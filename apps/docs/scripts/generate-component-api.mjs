import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';
import ts from 'typescript';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(docsRoot, '../..');
const componentsRoot = resolve(workspaceRoot, 'ui/zui/src/components');
const outputPath = resolve(docsRoot, 'src/framework/component-api.generated.ts');
const write = process.argv.includes('--write');
const portable = (path) => path.replaceAll('\\', '/');
const normalizeType = (value) => value.replace(/\s+/gu, ' ').trim();

async function filesUnder(root, extension) {
	const entries = await readdir(root, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = resolve(root, entry.name);
		if (entry.isDirectory()) files.push(...(await filesUnder(path, extension)));
		else if (entry.isFile() && entry.name.endsWith(extension)) files.push(path);
	}
	return files.sort();
}

function unwrapExpression(expression) {
	let current = expression;
	while (
		ts.isAsExpression(current) ||
		ts.isParenthesizedExpression(current) ||
		ts.isSatisfiesExpression(current)
	) {
		current = current.expression;
	}
	return current;
}

function propertyName(property) {
	if (!property.name) return undefined;
	if (
		ts.isIdentifier(property.name) ||
		ts.isStringLiteral(property.name) ||
		ts.isNumericLiteral(property.name)
	) {
		return property.name.text;
	}
	return undefined;
}

function metadataObject(sourceFile, filename) {
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'zuiMetadata') continue;
			if (!declaration.initializer) break;
			const initializer = unwrapExpression(declaration.initializer);
			if (ts.isObjectLiteralExpression(initializer)) return initializer;
		}
	}
	throw new Error(`${filename} is missing an object-literal zuiMetadata export.`);
}

function stringProperty(object, name, sourceFile, filename) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) {
		throw new Error(`${filename} zuiMetadata must declare ${name}.`);
	}
	const value = unwrapExpression(property.initializer);
	if (!ts.isStringLiteral(value) && !ts.isNoSubstitutionTemplateLiteral(value)) {
		throw new Error(`${filename} zuiMetadata.${name} must be a string literal.`);
	}
	return value.text;
}

function metadataItemNames(object, name) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) return [];
	const value = unwrapExpression(property.initializer);
	if (!ts.isArrayLiteralExpression(value)) return [];
	return value.elements.flatMap((element) => {
		const item = unwrapExpression(element);
		if (!ts.isObjectLiteralExpression(item)) return [];
		const itemName = item.properties.find((candidate) => propertyName(candidate) === 'name');
		if (!itemName || !ts.isPropertyAssignment(itemName)) return [];
		const initializer = unwrapExpression(itemName.initializer);
		return ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)
			? [initializer.text]
			: [];
	});
}

function declarationMap(sourceFile) {
	const declarations = new Map();
	for (const statement of sourceFile.statements) {
		if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
			declarations.set(statement.name.text, statement);
		}
	}
	return declarations;
}

function referenceName(node) {
	if (ts.isIdentifier(node)) return node.text;
	if (ts.isQualifiedName(node)) return normalizeType(node.getText());
	if (ts.isPropertyAccessExpression(node)) return normalizeType(node.getText());
	return normalizeType(node.getText());
}

function stringLiteralSet(node) {
	if (!node) return new Set();
	const nodes = ts.isUnionTypeNode(node) ? node.types : [node];
	return new Set(
		nodes
			.filter(ts.isLiteralTypeNode)
			.map(({ literal }) =>
				ts.isStringLiteral(literal) || ts.isNumericLiteral(literal) ? literal.text : undefined
			)
			.filter((value) => value !== undefined)
	);
}

function resolvedTypeText(node, sourceFile, declarations, seen = new Set()) {
	if (ts.isParenthesizedTypeNode(node)) {
		return resolvedTypeText(node.type, sourceFile, declarations, seen);
	}
	if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) {
		const separator = ts.isUnionTypeNode(node) ? ' | ' : ' & ';
		return node.types
			.map((item) => resolvedTypeText(item, sourceFile, declarations, seen))
			.join(separator);
	}
	if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
		const name = node.typeName.text;
		const declaration = declarations.get(name);
		if (declaration && ts.isTypeAliasDeclaration(declaration) && !seen.has(name)) {
			const nextSeen = new Set(seen).add(name);
			if (
				ts.isUnionTypeNode(declaration.type) ||
				ts.isLiteralTypeNode(declaration.type) ||
				ts.isTypeReferenceNode(declaration.type) ||
				ts.isParenthesizedTypeNode(declaration.type)
			) {
				return resolvedTypeText(declaration.type, sourceFile, declarations, nextSeen);
			}
		}
	}
	return normalizeType(node.getText(sourceFile));
}

function collectProperty(member, context, include, exclude) {
	if (!ts.isPropertySignature(member)) return;
	const name = propertyName(member);
	if (!name || exclude.has(name) || (include && !include.has(name))) return;
	context.props.set(name, {
		name,
		required: !member.questionToken,
		type: member.type
			? resolvedTypeText(member.type, context.sourceFile, context.declarations)
			: 'unknown'
	});
}

function collectReference(name, typeArguments, context, include, exclude, printed) {
	if ((name === 'Omit' || name === 'Pick') && typeArguments?.[0]) {
		const selected = stringLiteralSet(typeArguments[1]);
		const nextInclude = name === 'Pick' ? selected : include;
		const nextExclude = name === 'Omit' ? new Set([...exclude, ...selected]) : exclude;
		collectType(typeArguments[0], context, nextInclude, nextExclude);
		return;
	}

	const declaration = context.declarations.get(name);
	if (declaration) {
		collectDeclaration(declaration, context, include, exclude);
		return;
	}

	context.inheritedFrom.add(printed);
}

function collectType(node, context, include = undefined, exclude = new Set()) {
	if (ts.isParenthesizedTypeNode(node)) {
		collectType(node.type, context, include, exclude);
		return;
	}
	if (ts.isTypeLiteralNode(node)) {
		for (const member of node.members) collectProperty(member, context, include, exclude);
		return;
	}
	if (ts.isIntersectionTypeNode(node)) {
		for (const type of node.types) collectType(type, context, include, exclude);
		return;
	}
	if (ts.isTypeReferenceNode(node)) {
		collectReference(
			referenceName(node.typeName),
			node.typeArguments,
			context,
			include,
			exclude,
			normalizeType(node.getText(context.sourceFile))
		);
		return;
	}
	context.inheritedFrom.add(normalizeType(node.getText(context.sourceFile)));
}

function collectHeritage(node, context, include, exclude) {
	collectReference(
		referenceName(node.expression),
		node.typeArguments,
		context,
		include,
		exclude,
		normalizeType(node.getText(context.sourceFile))
	);
}

function collectDeclaration(declaration, context, include = undefined, exclude = new Set()) {
	const name = declaration.name.text;
	if (context.seen.has(name)) return;
	context.seen.add(name);
	if (ts.isTypeAliasDeclaration(declaration)) {
		collectType(declaration.type, context, include, exclude);
	} else {
		for (const heritage of declaration.heritageClauses ?? []) {
			for (const type of heritage.types) collectHeritage(type, context, include, exclude);
		}
		for (const member of declaration.members) collectProperty(member, context, include, exclude);
	}
	context.seen.delete(name);
}

function componentFacts(source, filename) {
	const match = /<script\s+module\s+lang=["']ts["']>([\s\S]*?)<\/script>/u.exec(source);
	if (!match) throw new Error(`${filename} is missing its TypeScript module script.`);
	const sourceFile = ts.createSourceFile(filename, match[1], ts.ScriptTarget.Latest, true);
	const metadata = metadataObject(sourceFile, filename);
	const id = stringProperty(metadata, 'id', sourceFile, filename);
	const name = stringProperty(metadata, 'name', sourceFile, filename);
	const sourcePath = stringProperty(metadata, 'source', sourceFile, filename);
	const propsType = `${name}Props`;
	const declarations = declarationMap(sourceFile);
	const declaration = declarations.get(propsType);
	if (!declaration) throw new Error(`${filename} must export ${propsType} for API extraction.`);
	const context = {
		declarations,
		inheritedFrom: new Set(),
		props: new Map(),
		seen: new Set(),
		sourceFile
	};
	collectDeclaration(declaration, context);
	const documentedProps = new Set(
		['bindings', 'events', 'props', 'snippets'].flatMap((section) =>
			metadataItemNames(metadata, section)
		)
	);
	const undocumentedProps = [...context.props.keys()].filter(
		(name) =>
			!documentedProps.has(name) && name !== 'class' && name !== 'style' && !/^on[a-z]/u.test(name)
	);
	return {
		declaration: propsType,
		id,
		inheritedFrom: [...context.inheritedFrom].sort(),
		name,
		props: [...context.props.values()],
		source: sourcePath,
		undocumentedProps
	};
}

function factExportName(id) {
	return `${id.replace(/-([a-z0-9])/gu, (_, character) => character.toUpperCase())}ApiFacts`;
}

const facts = {};
for (const path of await filesUnder(componentsRoot, '.svelte')) {
	const source = await readFile(path, 'utf8');
	if (!source.includes('export const zuiMetadata')) continue;
	const filename = portable(relative(workspaceRoot, path));
	const component = componentFacts(source, filename);
	if (facts[component.id]) throw new Error(`Duplicate component API id ${component.id}.`);
	facts[component.id] = component;
}

const generatedSource = `import type { ComponentApiFacts } from './component-api.js';\n\n// Generated by scripts/generate-component-api.mjs. Do not edit by hand.\n${Object.values(
	facts
)
	.map(
		(fact) =>
			`export const ${factExportName(fact.id)} = ${JSON.stringify(fact, null, '\t')} as const satisfies ComponentApiFacts;`
	)
	.join('\n\n')}\n`;
const serialized = await format(generatedSource, {
	...(await resolveConfig(outputPath)),
	filepath: outputPath
});

if (write) {
	await writeFile(outputPath, serialized);
	console.log(`Wrote ${portable(relative(workspaceRoot, outputPath))}.`);
} else {
	const current = await readFile(outputPath, 'utf8').catch(() => '');
	if (current !== serialized) {
		throw new Error(
			'Generated component API facts are stale. Run `pnpm --filter @zadmin/docs api:source:update`.'
		);
	}
	const undocumentedProps = Object.values(facts).reduce(
		(total, fact) => total + fact.undocumentedProps.length,
		0
	);
	console.log(
		`Component API facts verified (${Object.keys(facts).length} components; ${undocumentedProps} undocumented declared props remain in legacy docs).`
	);
}
