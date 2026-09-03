import { readFile, writeFile } from 'node:fs/promises';
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
			demoCount: (docText.match(/component:\s*\w+/gu) ?? []).length,
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
	await writeFile(manifestPath, formattedManifest, 'utf8');
	await writeFile(loadersPath, formattedLoaders, 'utf8');
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
