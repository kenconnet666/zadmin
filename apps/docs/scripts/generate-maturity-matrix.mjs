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
	if (!id || !name || !category) throw new Error(`Incomplete metadata: ${path}`);
	componentFiles.push({ id, name, category, path, source });
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

const rows = componentFiles.map(({ id, name, category, path, source }) => {
	const sourcePath = portable(relative(workspaceRoot, path));
	const contractFact = contractBySource.get(sourcePath);
	const docs = docsSources.find(([docPath]) =>
		portable(relative(resolve(docsRoot, 'src/content/components'), docPath)).endsWith(
			`/${id}/doc.ts`
		)
	);
	const relatedTests = tests.filter(([, content]) => content.includes(name));
	const browserTests = relatedTests.filter(
		([testPath, content]) =>
			testPath.endsWith('.browser.spec.ts') &&
			content.includes('expect(') &&
			content.includes('render(')
	);
	const productionTests = relatedTests.filter(
		([testPath, content]) =>
			testPath.includes('production') && content.includes('expect(') && content.includes('render(')
	);
	const ssrTests = relatedTests.filter(
		([testPath, content]) =>
			content.includes("from 'svelte/server'") &&
			content.includes('expect(') &&
			content.includes('render(')
	);
	const runtimeImplemented = source.includes('<script lang=') && /<\/script>[\s\S]*</u.test(source);
	const authorable = entrypointSources.some(([, entrypoint]) =>
		new RegExp(`(?:default as )?\\b${name}\\b`).test(entrypoint)
	);
	const row = {
		id,
		name,
		category,
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
						.filter(([, entrypoint]) => new RegExp(`\\b${name}\\b`).test(entrypoint))
						.map(([entrypoint]) => evidence(entrypoint, `public entrypoint export ${name}`))
				: [],
			ContractVerified: contractFact
				? [evidence(contractPath, `${contractFact.sha256} API snapshot entry`)]
				: [],
			RuntimeImplemented: runtimeImplemented
				? [evidence(path, 'component markup and instance script')]
				: [],
			VisuallyVerified: browserTests.map(([testPath]) =>
				evidence(testPath, `${name} browser assertions`)
			),
			DesktopVerified: [],
			ProductionVerified: productionTests.map(([testPath]) =>
				evidence(testPath, `${name} production assertions`)
			)
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
