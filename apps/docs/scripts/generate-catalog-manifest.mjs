import { readFile } from 'node:fs/promises';
import { writeGeneratedFile } from './write-generated-file.mjs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = resolve(root, 'src/framework/catalog.ts');
const manifestPath = resolve(root, 'src/framework/catalog-manifest.generated.ts');
const loadersPath = resolve(root, 'src/framework/component-doc-loaders.generated.ts');
const catalog = await readFile(catalogPath, 'utf8');
const metadataEntry = await readFile(
	resolve(root, '../../ui/zui/src/entrypoints/metadata.ts'),
	'utf8'
);
const metadataPaths = new Map(
	[
		...metadataEntry.matchAll(
			/export \{ zuiMetadata as (\w+)Metadata \} from '(\.\.[^']+\.svelte)';/gu
		)
	].map(([, name, path]) => [name, path])
);
const imports = [
	...catalog.matchAll(/import \{ (\w+) \} from '(\.\.\/content\/components\/[^']+\/doc)\.js';/gu)
];
const array = catalog.match(
	/export const componentDocs = Object\.freeze\(\[([\s\S]*?)\]\s+satisfies/u
)?.[1];
if (!array || imports.length === 0) throw new Error('Unable to discover component catalog.');
const names = [...array.matchAll(/\b(\w+Doc)(?=\s*,|\s*$)/gmu)].map((match) =>
	match[1].replace(/Doc$/u, '')
);
const paths = new Map(imports.map(([, name, path]) => [name.replace(/Doc$/u, ''), path]));
const literal = (text, key) =>
	text.match(new RegExp(`\\b${key}:\\s*['"]([^'"]+)['"]`, 'u'))?.[1] ?? '';
const kebab = (value) => value.replace(/([a-z0-9])([A-Z])/gu, '$1-$2').toLowerCase();

function unwrapExpression(node) {
	let current = node;
	while (
		ts.isAsExpression(current) ||
		ts.isParenthesizedExpression(current) ||
		ts.isSatisfiesExpression(current)
	)
		current = current.expression;
	return current;
}

function readMetadataLiterals(text, sourcePath) {
	const moduleScript = text.match(
		/<script\s+module(?:\s+lang=['"]ts['"])?>([\s\S]*?)<\/script>/u
	)?.[1];
	if (!moduleScript) throw new Error(`Unable to read module metadata script from ${sourcePath}.`);
	const source = ts.createSourceFile(
		sourcePath,
		moduleScript,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	let metadata;
	for (const statement of source.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'zuiMetadata') continue;
			if (!declaration.initializer) continue;
			const initializer = unwrapExpression(declaration.initializer);
			if (ts.isObjectLiteralExpression(initializer)) metadata = initializer;
		}
	}
	if (!metadata) throw new Error(`Unable to find zuiMetadata object in ${sourcePath}.`);
	const values = new Map();
	for (const property of metadata.properties) {
		if (!ts.isPropertyAssignment(property)) continue;
		const key = ts.isIdentifier(property.name)
			? property.name.text
			: ts.isStringLiteral(property.name)
				? property.name.text
				: undefined;
		const value = unwrapExpression(property.initializer);
		if (key && (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)))
			values.set(key, value.text);
	}
	return values;
}

function readPublicComponentCount(text, sourcePath) {
	const source = ts.createSourceFile(
		sourcePath,
		text,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	let members;
	function visit(node) {
		if (
			ts.isCallExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === 'defineComponentDoc' &&
			node.arguments.length >= 2
		) {
			const definition = unwrapExpression(node.arguments[1]);
			if (!ts.isObjectLiteralExpression(definition))
				throw new Error(`${sourcePath} defineComponentDoc definition must be an object literal.`);
			const property = definition.properties.find(
				(candidate) =>
					ts.isPropertyAssignment(candidate) &&
					((ts.isIdentifier(candidate.name) && candidate.name.text === 'members') ||
						(ts.isStringLiteral(candidate.name) && candidate.name.text === 'members'))
			);
			if (!property) members = [];
			else {
				const value = unwrapExpression(property.initializer);
				if (!ts.isArrayLiteralExpression(value))
					throw new Error(`${sourcePath} members must be an array literal.`);
				if (!value.elements.every(ts.isIdentifier))
					throw new Error(`${sourcePath} members must contain metadata identifiers only.`);
				members = value.elements;
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(source);
	if (!members) throw new Error(`Unable to find defineComponentDoc in ${sourcePath}.`);
	return members.length + 1;
}

function readDemoCount(text, sourcePath) {
	const source = ts.createSourceFile(
		sourcePath,
		text,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	const literals = new Map();
	function location(node) {
		const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
		return `${sourcePath}:${line + 1}:${character + 1}`;
	}
	function propertyName(property) {
		return ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
			? property.name.text
			: undefined;
	}
	function findProperty(object, name) {
		return object.properties.find(
			(property) =>
				(ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
				propertyName(property) === name
		);
	}
	function resolveArray(expression, owner) {
		const value = unwrapExpression(expression);
		if (ts.isArrayLiteralExpression(value)) return value;
		if (ts.isIdentifier(value) && literals.has(value.text)) return literals.get(value.text);
		throw new Error(`${location(owner)} defineComponentDoc demos must be a static array literal.`);
	}
	function readDemos(call) {
		const definition = unwrapExpression(call.arguments[1]);
		if (!ts.isObjectLiteralExpression(definition))
			throw new Error(
				`${location(call.arguments[1])} defineComponentDoc definition must be an object literal.`
			);
		const demosProperty = findProperty(definition, 'demos');
		if (!demosProperty)
			throw new Error(`${location(definition)} defineComponentDoc demos property is required.`);
		const demosExpression = ts.isShorthandPropertyAssignment(demosProperty)
			? demosProperty.name
			: demosProperty.initializer;
		const demos = resolveArray(demosExpression, demosExpression);
		for (const [index, element] of demos.elements.entries()) {
			const item = unwrapExpression(element);
			if (!ts.isObjectLiteralExpression(item))
				throw new Error(`${location(element)} demos[${index}] must be an object literal.`);
			for (const key of ['component', 'source', 'id']) {
				if (!findProperty(item, key))
					throw new Error(
						`${location(item)} demos[${index}] is missing required property "${key}".`
					);
			}
		}
		return demos.elements.length;
	}
	let count;
	function visit(node) {
		if (
			ts.isCallExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === 'defineComponentDoc' &&
			node.arguments.length >= 2
		) {
			if (count !== undefined)
				throw new Error(`${location(node)} expected exactly one defineComponentDoc call.`);
			count = readDemos(node);
		}
		ts.forEachChild(node, visit);
	}
	// Only module-level constants are eligible; a nested shadowing declaration
	// or reassigned variable cannot establish a static catalog contract.
	for (const statement of source.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		if (!(statement.declarationList.flags & ts.NodeFlags.Const)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
			const value = unwrapExpression(declaration.initializer);
			if (ts.isArrayLiteralExpression(value)) literals.set(declaration.name.text, value);
		}
	}
	visit(source);
	if (count === undefined) throw new Error(`Unable to find defineComponentDoc in ${sourcePath}.`);
	return count;
}

if (process.argv.includes('--self-test')) {
	const assert = (condition, message) => {
		if (!condition) throw new Error(`catalog demo self-test failed: ${message}`);
	};
	const fixture = `
const demos = [
  { component: DemoA, source: sourceA, id: 'a' },
  { component: DemoB, source: sourceB, id: 'b', description: 'component: fake' },
  { component: DemoC, source: sourceC, id: 'c' },
  { component: DemoD, source: sourceD, id: 'd' },
  { component: DemoE, source: sourceE, id: 'e' }
] as const satisfies readonly object[];
defineComponentDoc(meta, { demos });`;
	assert(readDemoCount(fixture, 'catalog-self-test.ts') === 5, 'counts five static demos');
	assert(
		readDemoCount(
			`defineComponentDoc(meta, { demos: [({ component: Demo, source, id: 'a' } satisfies DemoDefinition)] });`,
			'catalog-self-test-inline.ts'
		) === 1,
		'counts wrapped inline demos'
	);
	try {
		readDemoCount(
			`defineComponentDoc(meta, { demos: [{ source: source, id: 'missing-component' }] });`,
			'catalog-self-test-missing.ts'
		);
		assert(false, 'reports missing component');
	} catch (error) {
		assert(
			/catalog-self-test-missing\.ts:\d+:\d+.*demos\[0\] is missing required property "component"/u.test(
				String(error)
			),
			'missing component diagnostic'
		);
	}
	for (const declaration of [
		'let demos = [{ component: Demo, source, id: "a" }];',
		'const demos = loadDemos(); function nested() { const demos = []; }'
	]) {
		try {
			readDemoCount(
				`${declaration} defineComponentDoc(meta, { demos });`,
				'catalog-self-test-dynamic.ts'
			);
			assert(false, 'rejects dynamic demos');
		} catch (error) {
			assert(
				String(error).includes('demos must be a static array literal'),
				'dynamic demo diagnostic'
			);
		}
	}
	console.log('Catalog demo AST self-test passed.');
	process.exit(0);
}

const docs = await Promise.all(
	names.map(async (name) => {
		const path = paths.get(name);
		const parts = path.split('/');
		const category = parts[3] ?? 'utility';
		const docText = await readFile(resolve(root, `src/${path.slice(3)}.ts`), 'utf8');
		const metadataName = docText.match(/defineComponentDoc\((\w+)Metadata/u)?.[1] ?? name;
		const metadataPath = metadataPaths.get(metadataName);
		const sourcePath = metadataPath
			? resolve(root, `../../ui/zui/src/${metadataPath.slice(3)}`)
			: undefined;
		const metadata = sourcePath
			? readMetadataLiterals(await readFile(sourcePath, 'utf8'), sourcePath)
			: new Map();
		const covers = [...docText.matchAll(/covers:\s*\[([^\]]*)\]/gu)].flatMap(([, value]) =>
			[...value.matchAll(/['"]([^'"]+)['"]/gu)].map(([, item]) => item)
		);
		const keywords = [...docText.matchAll(/keywords:\s*\[([^\]]*)\]/gu)].flatMap(([, value]) =>
			[...value.matchAll(/['"]([^'"]+)['"]/gu)].map(([, item]) => item)
		);
		const profiles = [...docText.matchAll(/profiles:\s*\[([^\]]*)\]/gu)].flatMap(([, value]) =>
			[...value.matchAll(/['"]([^'"]+)['"]/gu)].map(([, item]) => item)
		);
		return {
			id: metadata.get('id') || kebab(name),
			name: metadata.get('name') || `Z${name[0].toUpperCase()}${name.slice(1)}`,
			category: metadata.get('category') || category,
			summary: literal(docText, 'summary') || metadata.get('summary') || '',
			status: metadata.get('status') || '',
			keywords: [...new Set(keywords)],
			profiles,
			capabilities: [...new Set(covers)],
			demoCount: readDemoCount(docText, resolve(root, `src/${path.slice(3)}.ts`)),
			publicComponentCount: readPublicComponentCount(docText, path)
		};
	})
);
const publicComponentCount = docs.reduce((total, doc) => total + doc.publicComponentCount, 0);
if (publicComponentCount !== metadataPaths.size)
	throw new Error(
		`Catalog public component count does not match metadata exports: ${publicComponentCount} != ${metadataPaths.size}.`
	);
const manifest = `// Generated by scripts/generate-catalog-manifest.mjs. Do not edit.
export interface ComponentCatalogManifestEntry {
	readonly id: string;
	readonly name: string;
	readonly category: string;
	readonly summary: string;
	readonly status: string;
	readonly keywords: readonly string[];
	readonly profiles: readonly string[];
	readonly capabilities: readonly string[];
	readonly demoCount: number;
	readonly publicComponentCount: number;
}

export const componentCategories = Object.freeze([{ id: 'gene', label: '通用组件' }, { id: 'layout', label: '布局组件' }, { id: 'input', label: '输入组件' }, { id: 'navigation', label: '导航组件' }, { id: 'overlay', label: '浮层组件' }, { id: 'data-display', label: '展示组件' }, { id: 'feedback', label: '反馈组件' }, { id: 'utility', label: '工具组件' }] as const);

export const componentCatalogManifest = Object.freeze(${JSON.stringify(docs, null, 2)} as readonly ComponentCatalogManifestEntry[]);
export const componentCatalogManifestById = new Map(componentCatalogManifest.map((entry) => [entry.id, entry]));
`;
const loaders = `// Generated by scripts/generate-catalog-manifest.mjs. Do not edit.\nimport type { ComponentDoc } from './component-doc.js';\nexport const componentDocLoaders = {\n${names.map((name, index) => `\t${JSON.stringify(docs[index].id)}: () => import(${JSON.stringify(`${paths.get(name)}.js`)}).then((module) => module.${name}Doc),`).join('\n')}\n} satisfies Record<string, () => Promise<ComponentDoc>>;\n`;
const prettierConfig = (await prettier.resolveConfig(manifestPath)) ?? {};
const formattedManifest = await prettier.format(manifest, {
	...prettierConfig,
	filepath: manifestPath
});
const formattedLoaders = await prettier.format(loaders, {
	...prettierConfig,
	filepath: loadersPath
});
if (process.argv.includes('--write')) {
	await writeGeneratedFile(manifestPath, formattedManifest);
	await writeGeneratedFile(loadersPath, formattedLoaders);
	console.log(
		`Catalog manifest generated (${docs.length} families; ${publicComponentCount} public components).`
	);
} else {
	const [actualManifest, actualLoaders] = await Promise.all([
		readFile(manifestPath, 'utf8'),
		readFile(loadersPath, 'utf8')
	]);
	if (actualManifest !== formattedManifest || actualLoaders !== formattedLoaders)
		throw new Error('Catalog manifest is stale. Run api:catalog:update.');
	console.log(
		`Catalog manifest verified (${docs.length} families; ${publicComponentCount} public components).`
	);
}
