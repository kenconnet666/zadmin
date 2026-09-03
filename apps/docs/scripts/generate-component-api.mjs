import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';
import ts from 'typescript';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(docsRoot, '../..');
const componentsRoot = resolve(workspaceRoot, 'ui/zui/src/components');
const outputPath = resolve(docsRoot, 'src/framework/component-api.generated.ts');
const teachingCoverageJsonPath = resolve(workspaceRoot, '.docs/zui/api-teaching-coverage.json');
const teachingCoverageMarkdownPath = resolve(workspaceRoot, '.docs/zui/api-teaching-coverage.md');
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

function metadataItems(object, name) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) return [];
	const value = unwrapExpression(property.initializer);
	if (!ts.isArrayLiteralExpression(value)) return [];
	return value.elements.flatMap((element) => {
		const item = unwrapExpression(element);
		return ts.isObjectLiteralExpression(item) ? [item] : [];
	});
}

function objectStringProperty(object, name) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) return undefined;
	const value = unwrapExpression(property.initializer);
	return ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)
		? value.text
		: undefined;
}

function objectBooleanProperty(object, name) {
	const property = object.properties.find((candidate) => propertyName(candidate) === name);
	if (!property || !ts.isPropertyAssignment(property)) return undefined;
	const value = unwrapExpression(property.initializer);
	return value.kind === ts.SyntaxKind.TrueKeyword
		? true
		: value.kind === ts.SyntaxKind.FalseKeyword
			? false
			: undefined;
}

function hasDeprecatedTag(member) {
	return ts.getJSDocTags(member).some((tag) => tag.tagName.text === 'deprecated');
}

function scanDeprecatedPropertyPaths(
	sourceFile,
	declarations,
	rootDeclaration,
	collectAll = false
) {
	const paths = new Set();
	const seen = new Set();
	function literalNames(node) {
		if (!node) return new Set();
		const types = ts.isUnionTypeNode(node) ? node.types : [node];
		return new Set(
			types
				.filter(ts.isLiteralTypeNode)
				.map(({ literal }) => (ts.isStringLiteral(literal) ? literal.text : undefined))
				.filter((value) => value !== undefined)
		);
	}
	function visitType(node, path, include, exclude = new Set()) {
		if (!node) return;
		if (ts.isParenthesizedTypeNode(node)) return visitType(node.type, path, include, exclude);
		if (ts.isTypeOperatorNode(node)) return visitType(node.type, path, include, exclude);
		if (ts.isArrayTypeNode(node)) return visitType(node.elementType, path, include, exclude);
		if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node))
			return node.types.forEach((type) => visitType(type, path, include, exclude));
		if (ts.isTypeLiteralNode(node))
			return node.members.forEach((member) => visitMember(member, path, include, exclude));
		if (ts.isExpressionWithTypeArguments(node)) {
			if (ts.isIdentifier(node.expression)) {
				if (
					(node.expression.text === 'Omit' || node.expression.text === 'Pick') &&
					node.typeArguments?.[0]
				) {
					const selected = literalNames(node.typeArguments[1]);
					const nextInclude = node.expression.text === 'Pick' ? selected : include;
					const nextExclude =
						node.expression.text === 'Omit' ? new Set([...exclude, ...selected]) : exclude;
					return visitType(node.typeArguments[0], path, nextInclude, nextExclude);
				}
				const heritage = declarations.get(node.expression.text);
				if (heritage && ts.isInterfaceDeclaration(heritage))
					heritage.members.forEach((member) => visitMember(member, path, include, exclude));
			}
			for (const argument of node.typeArguments ?? []) visitType(argument, path, include, exclude);
			return;
		}
		if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
			if (
				(node.typeName.text === 'Omit' || node.typeName.text === 'Pick') &&
				node.typeArguments?.[0]
			) {
				const selected = literalNames(node.typeArguments[1]);
				const nextInclude = node.typeName.text === 'Pick' ? selected : include;
				const nextExclude =
					node.typeName.text === 'Omit' ? new Set([...exclude, ...selected]) : exclude;
				return visitType(node.typeArguments[0], path, nextInclude, nextExclude);
			}
			const declaration = declarations.get(node.typeName.text);
			if (declaration && !seen.has(declaration.name.text)) {
				seen.add(declaration.name.text);
				if (ts.isTypeAliasDeclaration(declaration))
					visitType(declaration.type, path, include, exclude);
				else declaration.members.forEach((member) => visitMember(member, path, include, exclude));
				seen.delete(declaration.name.text);
			}
			for (const argument of node.typeArguments ?? []) visitType(argument, path, include, exclude);
		}
	}
	function visitMember(member, parentPath, include, exclude = new Set()) {
		if (!ts.isPropertySignature(member)) return;
		const name = propertyName(member);
		if (!name) return;
		if (exclude.has(name) || (include && !include.has(name))) return;
		const path = parentPath ? `${parentPath}.${name}` : name;
		if (collectAll || hasDeprecatedTag(member)) paths.add(path);
		visitType(member.type, path);
	}
	visitType(ts.isTypeAliasDeclaration(rootDeclaration) ? rootDeclaration.type : undefined, '');
	if (ts.isInterfaceDeclaration(rootDeclaration)) {
		rootDeclaration.members.forEach((member) => visitMember(member, ''));
		for (const heritage of rootDeclaration.heritageClauses ?? [])
			for (const type of heritage.types) visitType(type, '');
	}
	return paths;
}

const releasedVersionPattern = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u;
const lifecycleVersionPattern = new RegExp(
	`^(?:unreleased|${releasedVersionPattern.source})$`,
	'u'
);

function safeMigrationTarget(value) {
	if (typeof value !== 'string' || value.length === 0) return false;
	try {
		const url = new URL(value);
		return (
			url.protocol === 'https:' &&
			url.hostname.length > 0 &&
			url.username === '' &&
			url.password === ''
		);
	} catch {
		return (
			!value.startsWith('/') &&
			!value.includes('\\') &&
			!value.includes(':') &&
			!value.includes('\0') &&
			value
				.split('/')
				.every(
					(segment) =>
						segment.length > 0 &&
						segment !== '.' &&
						segment !== '..' &&
						/^[A-Za-z0-9._-]+$/u.test(segment)
				)
		);
	}
}

function compareReleasedVersions(left, right) {
	const leftParts = left.split('.').map(Number);
	const rightParts = right.split('.').map(Number);
	for (let index = 0; index < 3; index += 1) {
		if (leftParts[index] !== rightParts[index]) return leftParts[index] - rightParts[index];
	}
	return 0;
}

export function validateDeprecationMetadata({
	deprecatedPaths,
	deprecatedNames,
	entries,
	publicPaths,
	filename = 'metadata'
}) {
	const paths = new Set(deprecatedPaths ?? deprecatedNames ?? []);
	const knownPublicPaths = new Set(
		publicPaths ?? entries.map(({ path, name }) => path ?? name).filter(Boolean)
	);
	for (const entry of entries) {
		const entryPath = entry.path ?? entry.name;
		const rootPath = entryPath?.split('.')[0];
		const hasKnownChildren =
			entryPath?.includes('.') &&
			rootPath &&
			[...knownPublicPaths].some((path) => path.startsWith(`${rootPath}.`));
		if (publicPaths && hasKnownChildren && !knownPublicPaths.has(entryPath))
			throw new Error(
				`${filename} metadata member does not exist in the public type graph: ${entryPath ?? '<unnamed>'}.`
			);
		if (entry.since !== undefined && !lifecycleVersionPattern.test(entry.since))
			throw new Error(
				`${filename} ${entry.name ?? '<unnamed>'}.since must be unreleased or a stable x.y.z version.`
			);
		const hasLifecycle = [
			'deprecatedSince',
			'replacement',
			'replacementExternal',
			'removeAfter',
			'migration'
		].some((field) => entry[field] !== undefined);
		if (!hasLifecycle) continue;
		const path = entry.path ?? entry.name;
		if (!path || !paths.has(path))
			throw new Error(
				`${filename} metadata lifecycle does not match a @deprecated public API: ${path ?? '<unnamed>'}.`
			);
		const name = entry.name;
		if (entry.deprecatedSince !== undefined && !lifecycleVersionPattern.test(entry.deprecatedSince))
			throw new Error(
				`${filename} ${name}.deprecatedSince must be unreleased or a stable x.y.z version.`
			);
		if (entry.removeAfter !== undefined && !releasedVersionPattern.test(entry.removeAfter))
			throw new Error(`${filename} ${name}.removeAfter must be a stable x.y.z version.`);
		if (entry.migration !== undefined && !safeMigrationTarget(entry.migration))
			throw new Error(
				`${filename} ${name}.migration must be a safe repository-relative path or https URL.`
			);
		if (entry.deprecatedSince === undefined)
			throw new Error(`${filename} deprecation metadata for ${name} requires deprecatedSince.`);
		if (typeof entry.replacement !== 'string' || entry.replacement.length === 0)
			throw new Error(`${filename} deprecation metadata for ${name} requires replacement.`);
		const parent = path.includes('.') ? path.slice(0, path.lastIndexOf('.')) : '';
		const replacementPath = parent ? `${parent}.${entry.replacement}` : entry.replacement;
		if (entry.replacement === name || replacementPath === path)
			throw new Error(`${filename} deprecation metadata for ${path} cannot replace itself.`);
		if (entry.replacementExternal !== true && !knownPublicPaths.has(replacementPath))
			throw new Error(
				`${filename} deprecation metadata for ${path} requires a same-level resolvable replacement or replacementExternal=true.`
			);
		if (entry.replacementExternal !== undefined && entry.replacementExternal !== true)
			throw new Error(`${filename} ${name}.replacementExternal must be true when specified.`);
		if (
			entry.since !== undefined &&
			entry.since !== 'unreleased' &&
			entry.deprecatedSince !== 'unreleased' &&
			compareReleasedVersions(entry.deprecatedSince, entry.since) < 0
		)
			throw new Error(`${filename} ${name} cannot be deprecated before it was introduced.`);
		if (
			entry.removeAfter !== undefined &&
			entry.deprecatedSince !== 'unreleased' &&
			compareReleasedVersions(entry.removeAfter, entry.deprecatedSince) <= 0
		)
			throw new Error(`${filename} ${name}.removeAfter must follow deprecatedSince.`);
	}
}

if (process.argv.includes('--self-test')) {
	const scannerSource = ts.createSourceFile(
		'scanner-self-test.ts',
		`interface Meta {
/** @deprecated Use key. */
id: string;
key: string;
}
interface Other {
/** @deprecated Use key. */
id: string;
key: string;
}
interface Root extends Base {
items: ReadonlyArray<Meta>;
other: Other;
}
interface Base {
inherited: ReadonlyArray<Meta>;

}
interface Omitted extends Omit<Meta, 'id'> {}
interface Picked extends Pick<Meta, 'key'> {}
type MetaAlias = Meta;
type OmittedAlias = Omit<Readonly<MetaAlias>, 'id'>;
type PickedAlias = Pick<(MetaAlias), 'key'>;`,
		ts.ScriptTarget.Latest,
		true
	);
	const scannerDeclarations = declarationMap(scannerSource);
	const scannerPaths = scanDeprecatedPropertyPaths(
		scannerSource,
		scannerDeclarations,
		scannerDeclarations.get('Root')
	);
	if ([...scannerPaths].sort().join(',') !== 'inherited.id,items.id,other.id')
		throw new Error(`Deprecation scanner self-test mismatch: ${[...scannerPaths].join(',')}.`);
	for (const name of ['Omitted', 'Picked', 'OmittedAlias', 'PickedAlias']) {
		const paths = scanDeprecatedPropertyPaths(
			scannerSource,
			scannerDeclarations,
			scannerDeclarations.get(name)
		);
		if (paths.size !== 0)
			throw new Error(`Deprecation scanner self-test leaked excluded fields from ${name}.`);
	}
	const valid = () =>
		validateDeprecationMetadata({
			deprecatedNames: ['old'],
			entries: [
				{
					name: 'old',
					deprecatedSince: 'unreleased',
					replacement: 'new',
					migration: 'docs/migrate.md'
				},
				{ name: 'new', since: '0.1.0' }
			]
		});
	valid();
	validateDeprecationMetadata({
		deprecatedPaths: ['items.meta.id'],
		entries: [
			{ path: 'items.meta.id', name: 'id', deprecatedSince: 'unreleased', replacement: 'key' },
			{ path: 'items.meta.key', name: 'key' },
			{ path: 'other.id', name: 'id' }
		]
	});
	try {
		validateDeprecationMetadata({
			deprecatedPaths: [],
			publicPaths: ['items', 'items.id'],
			entries: [{ path: 'items.meta.fake', name: 'fake' }],
			filename: 'nested member existence'
		});
		throw new Error('Deprecation validator self-test accepted a nonexistent nested member.');
	} catch (error) {
		if (!String(error).includes('does not exist')) throw error;
	}
	const external = () =>
		validateDeprecationMetadata({
			deprecatedNames: ['old'],
			entries: [
				{
					name: 'old',
					deprecatedSince: '0.1.0',
					replacement: 'aria-label',
					replacementExternal: true
				}
			]
		});
	external();
	validateDeprecationMetadata({
		deprecatedNames: ['old'],
		entries: [
			{
				name: 'old',
				deprecatedSince: '0.2.0',
				replacement: 'aria-label',
				replacementExternal: true,
				migration: 'https://example.com/migrations/old'
			}
		]
	});
	const rejects = [
		[
			'nested missing member',
			[{ path: 'items.id', name: 'id', deprecatedSince: 'unreleased', replacement: 'key' }],
			/resolvable replacement/u
		],
		[
			'same-name sibling mismatch',
			[
				{ path: 'other.id', name: 'id', deprecatedSince: 'unreleased', replacement: 'key' },
				{ path: 'items.key', name: 'key' }
			],
			/resolvable replacement/u
		],
		['missing deprecatedSince', [{ name: 'old', replacement: 'new' }], /requires deprecatedSince/u],
		[
			'orphan metadata',
			[{ name: 'other', deprecatedSince: 'unreleased', replacement: 'new' }],
			/does not match/u
		],
		[
			'missing replacement',
			[{ name: 'old', deprecatedSince: 'unreleased' }],
			/requires replacement/u
		],
		[
			'same replacement',
			[{ name: 'old', deprecatedSince: 'unreleased', replacement: 'old' }],
			/cannot replace itself/u
		],
		[
			'unresolved replacement',
			[{ name: 'old', deprecatedSince: 'unreleased', replacement: 'new' }],
			/resolvable replacement/u
		],
		['invalid since', [{ name: 'new', since: 'next' }], /\.since must be/u],
		[
			'invalid deprecatedSince',
			[{ name: 'old', deprecatedSince: 'next', replacement: 'new' }],
			/deprecatedSince must be/u
		],
		[
			'invalid removal',
			[{ name: 'old', deprecatedSince: 'unreleased', replacement: 'new', removeAfter: '1.0' }],
			/removeAfter must be/u
		],
		[
			'unsafe migration',
			[{ name: 'old', deprecatedSince: 'unreleased', replacement: 'new', migration: '../x.md' }],
			/safe repository-relative/u
		],
		[
			'replacementExternal false',
			[
				{
					name: 'old',
					deprecatedSince: 'unreleased',
					replacement: 'new',
					replacementExternal: false
				},
				{ name: 'new' }
			],
			/replacementExternal must be true/u
		],
		['stray lifecycle', [{ name: 'old', removeAfter: '1.0.0' }], /requires deprecatedSince/u],
		[
			'deprecated before introduction',
			[
				{
					name: 'old',
					since: '0.3.0',
					deprecatedSince: '0.2.0',
					replacement: 'new'
				},
				{ name: 'new' }
			],
			/deprecated before/u
		],
		[
			'removal before deprecation',
			[
				{
					name: 'old',
					deprecatedSince: '0.2.0',
					replacement: 'new',
					removeAfter: '0.2.0'
				},
				{ name: 'new' }
			],
			/must follow/u
		]
	];
	for (const [label, entries, expectedPattern] of rejects) {
		try {
			validateDeprecationMetadata({
				...(entries.some((entry) => entry.path)
					? { deprecatedPaths: [entries[0].path] }
					: { deprecatedNames: ['old'] }),
				entries,
				filename: label
			});
		} catch (error) {
			if (expectedPattern.test(String(error))) continue;
			throw new Error(`Deprecation validator self-test received an unexpected ${label} error.`, {
				cause: error
			});
		}
		throw new Error(`Deprecation validator self-test accepted ${label}.`);
	}
	console.log('Deprecation validator self-test passed.');
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

function resolvedTypeText(node, sourceFile, declarations, seen = new Set(), parentPrecedence = 0) {
	if (ts.isParenthesizedTypeNode(node)) {
		return `(${resolvedTypeText(node.type, sourceFile, declarations, seen)})`;
	}
	if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) {
		const precedence = ts.isUnionTypeNode(node) ? 1 : 2;
		const separator = ts.isUnionTypeNode(node) ? ' | ' : ' & ';
		const text = node.types
			.map((item) => resolvedTypeText(item, sourceFile, declarations, seen, precedence))
			.join(separator);
		return parentPrecedence > precedence ? `(${text})` : text;
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
				return resolvedTypeText(
					declaration.type,
					sourceFile,
					declarations,
					nextSeen,
					parentPrecedence
				);
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
	if (hasDeprecatedTag(member)) context.deprecatedProps.add(name);
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
		deprecatedProps: new Set(),
		seen: new Set(),
		sourceFile
	};
	collectDeclaration(declaration, context);
	const documentedProps = new Set(
		['bindings', 'events', 'props', 'snippets'].flatMap((section) =>
			metadataItemNames(metadata, section)
		)
	);
	const metadataGapProps = [...context.props.keys()].filter(
		(name) =>
			!documentedProps.has(name) && name !== 'class' && name !== 'style' && !/^on[a-z]/u.test(name)
	);
	const metadataEntries = ['bindings', 'events', 'props', 'snippets'].flatMap((section) =>
		metadataItems(metadata, section).map((item) => ({ item, section }))
	);
	const flattenMetadataEntries = (entries, parentPath = '') =>
		entries.flatMap(({ item, section }) => {
			const name = objectStringProperty(item, 'name');
			const path = name ? (parentPath ? `${parentPath}.${name}` : name) : parentPath;
			return [
				{ item, section, path },
				...flattenMetadataEntries(
					metadataItems(item, 'members').map((member) => ({ item: member, section })),
					path
				)
			];
		});
	const allMetadataEntries = flattenMetadataEntries(metadataEntries);
	const metadataByName = new Map(
		allMetadataEntries
			.map(({ item, section, path }) => [path, { item, section, path }])
			.filter(([path]) => path !== undefined)
	);
	const deprecatedPaths = scanDeprecatedPropertyPaths(sourceFile, declarations, declaration);
	const publicPaths = scanDeprecatedPropertyPaths(sourceFile, declarations, declaration, true);
	const missingDeprecationMetadata = [...deprecatedPaths].filter((path) => {
		const entry = metadataByName.get(path);
		return !entry || objectStringProperty(entry.item, 'deprecatedSince') === undefined;
	});
	if (missingDeprecationMetadata.length > 0) {
		throw new Error(
			`${filename} has @deprecated public API without structured metadata: ${missingDeprecationMetadata.join(', ')}.`
		);
	}
	validateDeprecationMetadata({
		deprecatedPaths,
		publicPaths,
		entries: allMetadataEntries.map(({ item, path }) => ({
			path,
			name: objectStringProperty(item, 'name'),
			since: objectStringProperty(item, 'since'),
			deprecatedSince: objectStringProperty(item, 'deprecatedSince'),
			replacement: objectStringProperty(item, 'replacement'),
			replacementExternal: objectBooleanProperty(item, 'replacementExternal'),
			removeAfter: objectStringProperty(item, 'removeAfter'),
			migration: objectStringProperty(item, 'migration')
		})),
		filename
	});
	return {
		declaration: propsType,
		id,
		inheritedFrom: [...context.inheritedFrom].sort(),
		name,
		props: [...context.props.values()],
		source: sourcePath,
		metadataGapProps
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
function parseDocTeaching(source, filename) {
	const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
	let result;
	function visit(node) {
		if (
			ts.isCallExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === 'defineComponentDoc' &&
			node.arguments.length >= 2 &&
			ts.isObjectLiteralExpression(node.arguments[1])
		) {
			const properties = node.arguments[1].properties;
			const sourceApi = properties.find(
				(property) =>
					ts.isPropertyAssignment(property) &&
					ts.isIdentifier(property.name) &&
					property.name.text === 'sourceApi'
			);
			const teaching = properties.find(
				(property) =>
					ts.isPropertyAssignment(property) &&
					ts.isIdentifier(property.name) &&
					property.name.text === 'teaching'
			);
			const teachingProps = [];
			if (teaching && ts.isObjectLiteralExpression(teaching.initializer)) {
				const props = teaching.initializer.properties.find(
					(property) =>
						ts.isPropertyAssignment(property) &&
						ts.isIdentifier(property.name) &&
						property.name.text === 'props'
				);
				if (props && ts.isObjectLiteralExpression(props.initializer)) {
					for (const property of props.initializer.properties) {
						if (ts.isPropertyAssignment(property) && property.name) {
							teachingProps.push(property.name.getText(file).replace(/^['"]|['"]$/gu, ''));
						}
					}
				}
			}
			result = {
				sourceApi:
					sourceApi && ts.isIdentifier(sourceApi.initializer)
						? sourceApi.initializer.text
						: undefined,
				teachingProps
			};
		}
		ts.forEachChild(node, visit);
	}
	visit(file);
	return result;
}
const docsFiles = await filesUnder(resolve(docsRoot, 'src/content/components'), '.ts');
const teachingByFact = new Map();
for (const path of docsFiles) {
	const parsed = parseDocTeaching(
		await readFile(path, 'utf8'),
		portable(relative(workspaceRoot, path))
	);
	if (!parsed?.sourceApi) continue;
	const id = Object.keys(facts).find((candidate) => factExportName(candidate) === parsed.sourceApi);
	if (id) teachingByFact.set(id, new Set(parsed.teachingProps));
}
if (process.argv.includes('--self-test')) {
	const dataTableTeaching = teachingByFact.get('data-table');
	if (!dataTableTeaching || dataTableTeaching.size < 22)
		throw new Error('Teaching AST self-test expected DataTable teaching props.');
	const dataTableFact = facts['data-table'];
	if (dataTableFact?.metadataGapProps.length !== 0)
		throw new Error('Teaching AST self-test expected complete DataTable metadata.');
	const nested = parseDocTeaching(
		`defineComponentDoc(meta, { demos: [{ teaching: { props: { fake: {} } } }] })`,
		'nested.ts'
	);
	if (nested?.teachingProps.length !== 0)
		throw new Error('Teaching AST self-test misread nested demo props.');
	console.log('Teaching AST self-test passed.');
	process.exit(0);
}
const teachingCoverage = Object.values(facts).map((fact) => {
	const sourceDirectory = fact.source.slice(0, fact.source.lastIndexOf('/'));
	const directoryName = sourceDirectory.slice(sourceDirectory.lastIndexOf('/') + 1);
	const family = sourceDirectory.includes('/components/compound/') ? directoryName : undefined;
	const metadataGapPropNames = fact.metadataGapProps;
	const teachingProps = teachingByFact.get(fact.id) ?? new Set();
	const fallbackPropNames = metadataGapPropNames.filter((name) => !teachingProps.has(name));
	return {
		id: fact.id,
		name: fact.name,
		source: fact.source,
		family,
		declaredPropCount: fact.props.length,
		metadataGapPropCount: metadataGapPropNames.length,
		metadataGapPropNames,
		fallbackPropCount: fallbackPropNames.length,
		fallbackPropNames
	};
});
const teachingCoverageOutput = {
	components: teachingCoverage,
	policy: {
		maxFallbackProps: 0,
		maxMetadataGapProps: 0
	},
	totals: {
		components: teachingCoverage.length,
		declaredProps: teachingCoverage.reduce((sum, item) => sum + item.declaredPropCount, 0),
		metadataGapProps: teachingCoverage.reduce((sum, item) => sum + item.metadataGapPropCount, 0),
		fallbackProps: teachingCoverage.reduce((sum, item) => sum + item.fallbackPropCount, 0)
	}
};
const incompleteMetadata = teachingCoverage.filter(
	(item) => item.metadataGapPropCount > 0 || item.fallbackPropCount > 0
);
if (incompleteMetadata.length > 0) {
	throw new Error(
		`Every public component prop requires owned API metadata. Incomplete components: ${incompleteMetadata
			.map(
				(item) =>
					`${item.name} (${item.metadataGapPropNames.join(', ') || 'no metadata gaps'}; fallback: ${item.fallbackPropNames.join(', ') || 'none'})`
			)
			.join('; ')}.`
	);
}
const teachingCoverageJson = JSON.stringify(teachingCoverageOutput, null, '\t');
const topFallback = [...teachingCoverage]
	.sort(
		(left, right) =>
			right.fallbackPropCount - left.fallbackPropCount ||
			right.metadataGapPropCount - left.metadataGapPropCount ||
			left.id.localeCompare(right.id)
	)
	.slice(0, 20);
const teachingCoverageMarkdownSource = [
	'# API teaching coverage',
	'',
	`Generated from ${teachingCoverageOutput.totals.components} components and ${teachingCoverageOutput.totals.declaredProps} declared props. ${teachingCoverageOutput.totals.metadataGapProps} metadata gaps remain; ${teachingCoverageOutput.totals.fallbackProps} remain true fallbacks after teaching overrides.`,
	'',
	'Policy: every declared public prop must have owned component metadata, binding, event or snippet evidence; both totals are enforced at zero.',
	'',
	'| Component | Family | Declared props | Metadata gaps | True fallback props | Fallback names | Source |',
	'|---|---|---:|---:|---:|---|---|',
	...topFallback.map(
		(item) =>
			`| ${item.name} | ${item.family ?? '—'} | ${item.declaredPropCount} | ${item.metadataGapPropCount} | ${item.fallbackPropCount} | ${item.fallbackPropNames.join(', ') || '—'} | ${item.source} |`
	),
	''
].join('\n');
const serializedTeachingCoverageJson = await format(teachingCoverageJson, {
	...(await resolveConfig(teachingCoverageJsonPath)),
	filepath: teachingCoverageJsonPath
});
const serializedTeachingCoverageMarkdown = await format(teachingCoverageMarkdownSource, {
	...(await resolveConfig(teachingCoverageMarkdownPath)),
	filepath: teachingCoverageMarkdownPath
});

const generatedSource = `import type { ComponentApiFacts } from './component-api.js';\n\n// Generated by scripts/generate-component-api.mjs. Do not edit by hand.\n${Object.values(
	facts
)
	.map((fact) => {
		const directory = fact.source.slice(0, fact.source.lastIndexOf('/'));
		const familyId = directory.slice(directory.lastIndexOf('/') + 1);
		const members =
			fact.id === familyId
				? Object.values(facts)
						.filter(
							(candidate) =>
								candidate.source.slice(0, candidate.source.lastIndexOf('/')) === directory &&
								candidate.id !== fact.id
						)
						.map((candidate) => factExportName(candidate.id))
				: [];
		const serializedFact = JSON.stringify(fact, null, '\t');
		const withMembers = members.length
			? serializedFact.replace(/\n\}\s*$/u, `,\n\tmembers: () => [${members.join(', ')}]\n}`)
			: serializedFact;
		return `export const ${factExportName(fact.id)} = ${withMembers} as const satisfies ComponentApiFacts;`;
	})
	.join('\n\n')}\n`;
const serialized = await format(generatedSource, {
	...(await resolveConfig(outputPath)),
	filepath: outputPath
});

if (write) {
	await writeFile(outputPath, serialized);
	await writeFile(teachingCoverageJsonPath, serializedTeachingCoverageJson);
	await writeFile(teachingCoverageMarkdownPath, serializedTeachingCoverageMarkdown);
	console.log(`Wrote ${portable(relative(workspaceRoot, outputPath))}.`);
} else {
	const current = await readFile(outputPath, 'utf8').catch(() => '');
	if (current !== serialized) {
		throw new Error(
			'Generated component API facts are stale. Run `pnpm --filter @zadmin/docs api:source:update`.'
		);
	}
	const [currentCoverageJson, currentCoverageMarkdown] = await Promise.all([
		readFile(teachingCoverageJsonPath, 'utf8').catch(() => ''),
		readFile(teachingCoverageMarkdownPath, 'utf8').catch(() => '')
	]);
	const staleCoverage = [];
	if (currentCoverageJson !== serializedTeachingCoverageJson)
		staleCoverage.push(portable(relative(workspaceRoot, teachingCoverageJsonPath)));
	if (currentCoverageMarkdown !== serializedTeachingCoverageMarkdown)
		staleCoverage.push(portable(relative(workspaceRoot, teachingCoverageMarkdownPath)));
	if (staleCoverage.length > 0) {
		throw new Error(
			`API teaching coverage artifacts are missing or stale: ${staleCoverage.join(', ')}. Run pnpm --filter @zadmin/docs api:source:update.`
		);
	}
	const metadataGapProps = Object.values(facts).reduce(
		(total, fact) => total + fact.metadataGapProps.length,
		0
	);
	console.log(
		`Component API facts verified (${Object.keys(facts).length} components; ${metadataGapProps} metadata gaps; ${teachingCoverageOutput.totals.fallbackProps} true fallbacks after teaching overrides).`
	);
}
