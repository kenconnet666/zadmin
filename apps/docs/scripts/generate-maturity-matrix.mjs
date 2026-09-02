import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(docsRoot, '../..');
const componentsRoot = resolve(workspaceRoot, 'ui/zui/src/components');
const testsRoot = resolve(workspaceRoot, 'ui/zui/tests');
const contractPath = resolve(workspaceRoot, '.docs/zui/api-contract.json');
const jsonPath = resolve(workspaceRoot, '.docs/zui/component-maturity.json');
const markdownPath = resolve(workspaceRoot, '.docs/zui/component-maturity.md');
const write = process.argv.includes('--write');
const portable = (value) => value.replaceAll('\\', '/');
const directRenderPattern = (name) => new RegExp(`\\b(?:render|mount)\\(\\s*${name}\\b`, 'u');
const executesComponentRender = (source) => /\b(?:render|mount)\(/u.test(source);

async function filesUnder(root, extension) {
	const entries = await readdir(root, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = resolve(root, entry.name);
		if (entry.isDirectory()) files.push(...(await filesUnder(path, extension)));
		else if (entry.name.endsWith(extension)) files.push(path);
	}
	return files.sort();
}

function evidence(path, detail) {
	return { path: portable(relative(workspaceRoot, path)), detail };
}

const sourceFiles = await filesUnder(componentsRoot, '.svelte');
const componentFiles = [];
for (const path of sourceFiles) {
	const source = await readFile(path, 'utf8');
	const metadata = /export const zuiMetadata\s*=\s*\{([\s\S]*?)\}\s*as const satisfies/u.exec(
		source
	);
	if (!metadata) continue;
	const pick = (name) =>
		metadata[1].match(new RegExp(`\\n(?:\\t{2}| {8})${name}:\\s*['"]([^'"]+)['"]`, 'u'))?.[1];
	const id = pick('id');
	const name = pick('name');
	const category = pick('category');
	const status = pick('status');
	if (!id || !name || !category || !status) throw new Error(`Incomplete metadata: ${path}`);
	componentFiles.push({ id, name, category, status, path, source });
}

const entrypointFiles = await filesUnder(resolve(workspaceRoot, 'ui/zui/src/entrypoints'), '.ts');
const entrypointSources = await Promise.all(
	entrypointFiles.map(async (path) => [path, await readFile(path, 'utf8')])
);
const contract = JSON.parse(await readFile(contractPath, 'utf8'));
const contractBySource = new Map(
	contract.components.map((item) => [`ui/zui/${item.source}`, item])
);
const docsFiles = await filesUnder(resolve(docsRoot, 'src/content/components'), 'doc.ts');
const docsSources = await Promise.all(
	docsFiles.map(async (path) => [path, await readFile(path, 'utf8')])
);
const testFiles = await filesUnder(testsRoot, '.ts');
const tests = await Promise.all(
	testFiles.map(async (path) => [path, await readFile(path, 'utf8')])
);
const fixtureFiles = await filesUnder(testsRoot, '.svelte');
const fixtureSources = new Map(
	await Promise.all(fixtureFiles.map(async (path) => [path, await readFile(path, 'utf8')]))
);
function fixtureEvidenceFor(testPath, testSource, componentName, sources = fixtureSources) {
	return [...testSource.matchAll(/from ['"](\.\/[^'"]+\.svelte)['"]/gu)].flatMap(
		([, importPath]) => {
			const fixturePath = resolve(dirname(testPath), importPath);
			const fixtureSource = sources.get(fixturePath);
			const fixtureName = importPath
				.split('/')
				.pop()
				?.replace(/\.svelte$/u, '');
			if (
				!fixtureSource ||
				!fixtureName ||
				!new RegExp(`(?:render|mount)\\(\\s*${fixtureName}\\b`, 'u').test(testSource)
			)
				return [];
			const markup = fixtureSource.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/[^\n]*/gu, '');
			return new RegExp(`<${componentName}\\b`, 'u').test(markup)
				? [evidence(fixturePath, `${componentName} explicit rendered fixture usage`)]
				: [];
		}
	);
}
if (process.argv.includes('--self-test')) {
	const fixturePath = resolve('C:/tests', 'Fixture.svelte');
	const fixture = new Map([[fixturePath, '<ZButton />']]);
	if (!directRenderPattern('ZButton').test('render(ZButton)'))
		throw new Error('direct render self-test failed');
	if (directRenderPattern('ZButton').test('import ZButton from "x"; expect(true)'))
		throw new Error('import-only self-test failed');
	if (
		fixtureEvidenceFor(
			resolve('C:/tests', 'example.spec.ts'),
			"import Fixture from './Fixture.svelte'; render(Fixture); expect(true);",
			'ZButton',
			fixture
		).length === 0
	)
		throw new Error('fixture self-test failed');
	if (
		fixtureEvidenceFor(
			resolve('C:/tests', 'example.spec.ts'),
			"import Fixture from './Fixture.svelte'; render(Fixture); expect(true);",
			'ZButton',
			new Map([[fixturePath, '<!-- <ZButton /> -->\n/* <ZButton /> */\n// <ZButton />']])
		).length > 0
	)
		throw new Error('comment-only self-test failed');
	console.log('Maturity evidence self-test passed.');
	process.exit(0);
}

const rows = componentFiles.map(({ id, name, category, status, path, source }) => {
	const sourcePath = portable(relative(workspaceRoot, path));
	const contractFact = contractBySource.get(sourcePath);
	const docs = docsSources.find(([docPath]) =>
		portable(relative(resolve(docsRoot, 'src/content/components'), docPath)).endsWith(
			`/${id}/doc.ts`
		)
	);
	const componentReference = directRenderPattern(name);
	const directTests = tests.filter(([, content]) => componentReference.test(content));
	const fixtureTests = tests.filter(
		([testPath, content]) => fixtureEvidenceFor(testPath, content, name).length > 0
	);
	const relatedTests = [
		...new Map(
			[...directTests, ...fixtureTests].map(([testPath, content]) => [testPath, content])
		).entries()
	];
	const browserTests = relatedTests.filter(
		([testPath, content]) =>
			testPath.endsWith('.browser.spec.ts') &&
			content.includes('expect(') &&
			executesComponentRender(content)
	);
	const productionTests = relatedTests.filter(
		([testPath, content]) =>
			testPath.includes('production') &&
			content.includes('expect(') &&
			executesComponentRender(content)
	);
	const ssrTests = relatedTests.filter(
		([, content]) =>
			content.includes("from 'svelte/server'") &&
			content.includes('expect(') &&
			content.includes('render(')
	);
	const runtimeImplemented = source.includes('<script lang=') && /<\/script>[\s\S]*</u.test(source);
	const exportPattern = new RegExp(`\\bdefault as ${name}\\b`, 'u');
	const authorable = entrypointSources.some(([, entrypoint]) => exportPattern.test(entrypoint));
	const row = {
		id,
		name,
		category,
		status,
		source: sourcePath,
		stages: {
			Declared: true,
			Authorable: authorable,
			ContractVerified: Boolean(contractFact),
			RuntimeImplemented: runtimeImplemented,
			VisuallyVerified: browserTests.length > 0,
			DesktopVerified: false,
			ProductionVerified: productionTests.length > 0
		},
		evidence: {
			Declared: [evidence(path, 'zuiMetadata declaration')],
			Authorable: authorable
				? entrypointSources
						.filter(([, entrypoint]) => exportPattern.test(entrypoint))
						.map(([entrypoint]) => evidence(entrypoint, `public entrypoint export ${name}`))
				: [],
			ContractVerified: contractFact
				? [evidence(contractPath, `${contractFact.sha256} API snapshot entry`)]
				: [],
			RuntimeImplemented: runtimeImplemented
				? [evidence(path, 'component markup and instance script')]
				: [],
			VisuallyVerified: browserTests.flatMap(([testPath, content]) => [
				evidence(testPath, `${name} browser assertions`),
				...fixtureEvidenceFor(testPath, content, name)
			]),
			DesktopVerified: [],
			ProductionVerified: productionTests.flatMap(([testPath, content]) => [
				evidence(testPath, `${name} production assertions`),
				...fixtureEvidenceFor(testPath, content, name)
			])
		},
		docs: docs ? evidence(docs[0], 'catalog component documentation module') : null,
		ssrEvidence: ssrTests.map(([testPath]) => evidence(testPath, `${name} SSR assertions`)),
		legacyUndocumentedProps: contractFact?.undocumentedProps?.length ?? null
	};
	return row;
});

const stageNames = [
	'Declared',
	'Authorable',
	'ContractVerified',
	'RuntimeImplemented',
	'VisuallyVerified',
	'DesktopVerified',
	'ProductionVerified'
];
const summary = Object.fromEntries(
	stageNames.map((stage) => [stage, rows.filter((row) => row.stages[stage]).length])
);
const output = {
	source: {
		metadataComponents: rows.length,
		documentationPages: new Set(rows.map((row) => row.docs?.path).filter(Boolean)).size,
		contractComponents: contract.components.length,
		testFiles: testFiles.length
	},
	stageNames,
	summary,
	components: rows
};
const serializedJson = `${JSON.stringify(output, null, '\t')}\n`;

const lines = [
	'# ZUI component maturity matrix',
	'',
	`Generated from ${rows.length} metadata components, ${output.source.documentationPages} documentation modules, ${contract.components.length} API contract entries, and ${testFiles.length} test files.`,
	'',
	'Generation is evidence-based. A test filename alone never grants `VisuallyVerified` or `ProductionVerified`; the test source must contain the component name, `render(`, and `expect(`. `DesktopVerified` remains false until a component-level desktop evidence source is added.',
	'',
	'| Stage | Count |',
	'|---|---:|',
	...stageNames.map((stage) => `| ${stage} | ${summary[stage]} |`),
	'',
	'| Component | Category | Declared | Authorable | Contract | Runtime | Visual | Desktop | Production | Docs |',
	'|---|---|---:|---:|---:|---:|---:|---:|---:|---|',
	...rows.map(
		(row) =>
			`| ${row.name} | ${row.category} | ${row.stages.Declared ? 'Y' : '—'} | ${row.stages.Authorable ? 'Y' : '—'} | ${row.stages.ContractVerified ? 'Y' : '—'} | ${row.stages.RuntimeImplemented ? 'Y' : '—'} | ${row.stages.VisuallyVerified ? 'Y' : '—'} | ${row.stages.DesktopVerified ? 'Y' : '—'} | ${row.stages.ProductionVerified ? 'Y' : '—'} | ${row.docs?.path ?? '—'} |`
	)
];
const prettierConfig = (await prettier.resolveConfig(markdownPath)) ?? {};
const serializedMarkdown = await prettier.format(`${lines.join('\n')}\n`, {
	...prettierConfig,
	filepath: markdownPath
});
if (write) {
	await writeFile(jsonPath, serializedJson);
	await writeFile(markdownPath, serializedMarkdown);
} else {
	const [currentJson, currentMarkdown] = await Promise.all([
		readFile(jsonPath, 'utf8').catch(() => ''),
		readFile(markdownPath, 'utf8').catch(() => '')
	]);
	const stale = [];
	if (currentJson !== serializedJson) stale.push(portable(relative(workspaceRoot, jsonPath)));
	if (currentMarkdown !== serializedMarkdown)
		stale.push(portable(relative(workspaceRoot, markdownPath)));
	if (stale.length > 0) {
		throw new Error(
			`Component maturity artifacts are missing or stale: ${stale.join(', ')}. Run maturity:update.`
		);
	}
}
console.log(
	JSON.stringify({
		json: portable(relative(workspaceRoot, jsonPath)),
		markdown: portable(relative(workspaceRoot, markdownPath)),
		source: output.source,
		summary
	})
);
