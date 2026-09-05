import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const portable = (value) => value.replaceAll('\\', '/');
async function loadDefinition(path) {
	const source = await readFile(resolve(root, path), 'utf8');
	const { outputText } = ts.transpileModule(source, {
		compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
	});
	return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { PROPERTY_DEFINITIONS: properties } = await loadDefinition('ui/zui/src/theme/properties.ts');
const { DEFAULT_THEME_SCHEMA: schema } = await loadDefinition('ui/zui/src/theme/schema.ts');
const { UNIT_FAMILIES: units } = await loadDefinition('ui/zui/src/theme/units.ts');
const unitNames = new Set(Object.values(units).flatMap(Object.keys));
const globals = new Set(['inherit', 'initial', 'revert', 'revertLayer', 'unset']);

function scripts(source, path) {
	if (!path.endsWith('.svelte')) return source;
	const result = source
		.split('')
		.map((character) => (character === '\n' || character === '\r' ? character : ' '));
	for (const match of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gu)) {
		const start = match.index + match[0].indexOf('>') + 1;
		for (let index = 0; index < match[1].length; index++) result[start + index] = match[1][index];
	}
	return result.join('');
}
function chain(node) {
	if (ts.isIdentifier(node)) return [node.text];
	if (ts.isPropertyAccessExpression(node)) {
		const parent = chain(node.expression);
		return parent && [...parent, node.name.text];
	}
	return undefined;
}
function literal(node) {
	if (!node) return undefined;
	if (ts.isNumericLiteral(node)) return Number(node.text);
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
	if (
		ts.isPrefixUnaryExpression(node) &&
		node.operator === ts.SyntaxKind.MinusToken &&
		ts.isNumericLiteral(node.operand)
	)
		return -Number(node.operand.text);
	return undefined;
}
function classify(property, method, values) {
	const definition = properties[property];
	if (values.length === 1 && typeof values[0] === 'string') {
		const keyword = Object.entries(definition?.keywords ?? {}).find(
			([, value]) => value === values[0]
		);
		if (keyword)
			return { kind: 'system-keyword-candidate', recommendation: `${property}.${keyword[0]}` };
	}
	if (values.length && values.every((value) => value === 0)) return { kind: 'structural-zero' };
	if (method === 'percent' && values.every((value) => value === 100 || value === 0))
		return { kind: 'structural-percentage' };
	if (
		property === 'zIndex' &&
		values.length === 1 &&
		typeof values[0] === 'number' &&
		Math.abs(values[0]) <= 10
	)
		return { kind: 'local-stacking-order' };
	if (values.some((value) => value === undefined)) return { kind: 'dynamic-or-composed' };
	const tokens = Object.entries(schema[definition?.token] ?? {})
		.filter(
			([, value]) =>
				values.length === 1 &&
				value === values[0] &&
				(method === 'call' || method === 'raw' || method === definition?.tokenUnit)
		)
		.map(([token]) => `${definition.token}.${token}`);
	if (tokens.length) return { kind: 'theme-token-candidate', matchingTokens: tokens };
	if (
		[
			'color',
			'fontSize',
			'fontWeight',
			'radius',
			'shadow',
			'duration',
			'opacity',
			'focusOffset',
			'easing'
		].includes(definition?.token)
	)
		return { kind: 'design-value-review' };
	return { kind: 'explicit-geometry-or-css' };
}

function auditSource(source, path) {
	const file = ts.createSourceFile(path, scripts(source, path), ts.ScriptTarget.Latest, true);
	const records = [];
	const references = [];
	const parameters = new Set();
	function collect(node) {
		if (ts.isParameter(node) && ts.isIdentifier(node.name)) parameters.add(node.name.text);
		ts.forEachChild(node, collect);
	}
	collect(file);
	function location(node) {
		return { path, line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1 };
	}
	function visit(node) {
		if (ts.isCallExpression(node)) {
			const parts = chain(node.expression);
			if (parts && parameters.has(parts[0])) {
				const [, property, method = 'call'] = parts;
				if (property === '_media') {
					const query = node.arguments[0];
					if (query && ts.isObjectLiteralExpression(query)) {
						for (const member of query.properties) {
							if (
								ts.isPropertyAssignment(member) &&
								typeof literal(member.initializer) === 'string'
							)
								references.push({
									...location(member),
									token: `breakpoint.${literal(member.initializer)}`,
									via: 'media-query'
								});
						}
					} else if (typeof literal(query) === 'string') {
						const queryText = literal(query);
						const match = /^\((min|max)-width:\s*([^()]+)\)$/u.exec(queryText);
						const token =
							match &&
							Object.entries(schema.breakpoint).find(([, value]) => value === match[2].trim());
						records.push({
							...location(node),
							property,
							expression: queryText,
							kind: token ? 'breakpoint-token-candidate' : 'explicit-media-query',
							...(token ? { recommendation: `_media({ ${match[1]}: '${token[0]}' }, ...)` } : {})
						});
					}
				} else if (
					(parts.length === 2 && Object.hasOwn(properties, property)) ||
					(parts.length === 3 && (method === 'raw' || unitNames.has(method)))
				) {
					const values = node.arguments.map(literal);
					records.push({
						...location(node),
						property,
						method,
						expression: node.getText(file).slice(0, 240),
						...classify(property, method, values)
					});
				}
			}
		}
		if (ts.isPropertyAccessExpression(node)) {
			const parts = chain(node);
			if (
				parts?.length === 3 &&
				parameters.has(parts[0]) &&
				!(ts.isCallExpression(node.parent) && node.parent.expression === node)
			) {
				const [, property, accessor] = parts;
				if (accessor.startsWith('_')) {
					const group = properties[property]?.token;
					const token = accessor.slice(1);
					const valid = group && Object.hasOwn(schema[group] ?? {}, token);
					records.push({
						...location(node),
						property,
						expression: node.getText(file),
						kind: valid ? 'theme-accessor' : 'unmapped-theme-accessor'
					});
					if (valid)
						references.push({
							...location(node),
							token: `${group}.${token}`,
							via: 'icss-accessor'
						});
				} else if (
					Object.hasOwn(properties[property]?.keywords ?? {}, accessor) ||
					globals.has(accessor)
				) {
					records.push({
						...location(node),
						property,
						expression: node.getText(file),
						kind: 'system-keyword'
					});
				}
			}
			const themeIndex = parts?.lastIndexOf('theme') ?? -1;
			if (
				parts &&
				themeIndex >= 0 &&
				parts.length === themeIndex + 3 &&
				Object.hasOwn(schema[parts[themeIndex + 1]] ?? {}, parts[themeIndex + 2])
			) {
				references.push({
					...location(node),
					token: parts.slice(themeIndex + 1).join('.'),
					via: 'direct-theme-read'
				});
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(file);
	const inlineStyles = [...source.matchAll(/\bstyle\s*=/gu)].map((match) => ({
		path,
		line: source.slice(0, match.index).split('\n').length
	}));
	return { records, references, inlineStyles };
}

if (process.argv.includes('--self-test')) {
	const result = auditSource(
		'const f = (s) => { s.color._primary; s.padding.px(0); s.display.raw("flex"); s.width.percent(100); s.padding.px(4); s._media({max:"small"}, p => p.display.none); };',
		'fixture.ts'
	);
	for (const kind of [
		'theme-accessor',
		'structural-zero',
		'system-keyword-candidate',
		'structural-percentage',
		'theme-token-candidate'
	]) {
		if (!result.records.some((record) => record.kind === kind))
			throw new Error(`Missing classifier case: ${kind}`);
	}
	if (!result.references.some(({ token }) => token === 'breakpoint.small'))
		throw new Error('Missing breakpoint reference');
	const markup = auditSource(
		'<script>const f=(s)=>s.color._primary;</script>\n<p>example s.width.px(99)</p>',
		'fixture.svelte'
	);
	if (markup.records.length !== 1)
		throw new Error('Markup text must not be parsed as executable ICSS');
	console.log('ICSS token inventory self-test passed.');
	process.exit(0);
}

async function filesUnder(directory) {
	const paths = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = resolve(directory, entry.name);
		if (entry.isDirectory()) paths.push(...(await filesUnder(path)));
		else if (/\.(ts|svelte)$/u.test(path) && !/\.(?:generated|spec|test)\.ts$/u.test(path))
			paths.push(path);
	}
	return paths.sort();
}
const roots = ['ui/zui/src/components', 'ui/zui/src/runtime', 'apps/docs/src'];
const files = [
	...new Set((await Promise.all(roots.map((path) => filesUnder(resolve(root, path))))).flat())
];
const results = await Promise.all(
	files.map(async (path) =>
		auditSource(await readFile(path, 'utf8'), portable(relative(root, path)))
	)
);
const records = results.flatMap(({ records }) => records);
const references = results.flatMap(({ references }) => references);
const used = new Set(references.map(({ token }) => token));
const declared = Object.entries(schema).flatMap(([group, tokens]) =>
	Object.keys(tokens).map((token) => `${group}.${token}`)
);
const countBy = (items, key) =>
	Object.fromEntries(
		[...new Set(items.map((item) => item[key]))]
			.sort()
			.map((value) => [value, items.filter((item) => item[key] === value).length])
	);
const output = {
	schemaVersion: 1,
	scope: roots,
	limitations:
		'AST source inventory, not runtime coverage. Numeric equality only identifies review candidates, not semantic equivalence. Dynamic/indexed theme reads and raw CSS returned from helpers require manual review. Entries without a direct reference are NOT proof of dead tokens.',
	summary: {
		files: files.length,
		registeredProperties: Object.keys(properties).length,
		themeGroups: Object.keys(schema).length,
		themeTokens: declared.length,
		directReferencedTokens: used.size,
		kinds: countBy(records, 'kind')
	},
	withoutDirectReference: declared.filter((token) => !used.has(token)),
	records,
	references,
	inlineStyleSites: results.flatMap(({ inlineStyles }) => inlineStyles)
};
if (process.argv.includes('--write')) {
	await writeFile(
		resolve(root, '.docs/zui/icss-token-usage.json'),
		`${JSON.stringify(output, null, '\t')}\n`
	);
}
console.log(
	JSON.stringify(
		{ ...output.summary, withoutDirectReference: output.withoutDirectReference },
		null,
		2
	)
);
