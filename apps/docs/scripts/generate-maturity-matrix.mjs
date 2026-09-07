import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import ts from 'typescript';
import { parse } from 'svelte/compiler';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(docsRoot, '../..');
const componentsRoot = resolve(workspaceRoot, 'ui/zui/src/components');
const testsRoot = resolve(workspaceRoot, 'ui/zui/tests');
const contractPath = resolve(workspaceRoot, '.docs/zui/api-contract.json');
const teachingCoveragePath = resolve(workspaceRoot, '.docs/zui/api-teaching-coverage.json');
const jsonPath = resolve(workspaceRoot, '.docs/zui/component-maturity.json');
const markdownPath = resolve(workspaceRoot, '.docs/zui/component-maturity.md');
const write = process.argv.includes('--write');
const portable = (value) => value.replaceAll('\\', '/');
const directRenderPattern = (name) => new RegExp(`\\b(?:render|mount)\\(\\s*${name}\\b`, 'u');
const explicitComponentPattern = (name) => new RegExp(`\\b${name}\\b`, 'u');
const executesComponentRender = (source) => /\b(?:render|mount)\(/u.test(source);
const explicitVisualEvidencePattern = (name) => new RegExp(`@zui-visual\\s+${name}(?:\\s|$)`, 'u');
const visualAssertionPattern =
	/\b(?:getBoundingClientRect|getComputedStyle)\s*\(|\.toHaveCSS\s*\(|\.toHaveScreenshot\s*\(/u;
const withoutComments = (source) =>
	source.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/[^\n]*/gu, '');

function hasRuntimeImplementation(source) {
	const component = parse(source, { modern: true });
	return Boolean(
		component.instance &&
		component.fragment.nodes.some((node) => !['Comment', 'Text'].includes(node.type))
	);
}

const visualBlockCache = new Map();
function visualTestBlocks(source) {
	if (visualBlockCache.has(source)) return visualBlockCache.get(source);
	const file = ts.createSourceFile('visual.spec.ts', source, ts.ScriptTarget.Latest, true);
	const blocks = [];
	function visit(node) {
		if (
			ts.isCallExpression(node) &&
			/^(?:it|test)(?:\.|\(|$)/u.test(node.expression.getText(file))
		) {
			const callback = node.arguments.find(
				(argument) => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)
			);
			if (callback?.body && ts.isBlock(callback.body)) {
				const start = ts.isExpressionStatement(node.parent)
					? node.parent.getFullStart()
					: node.getFullStart();
				blocks.push({
					name:
						node.arguments[0] && ts.isStringLiteral(node.arguments[0])
							? node.arguments[0].text
							: '<parameterized test>',
					source: source.slice(start, node.end),
					line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1
				});
				return;
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(file);
	visualBlockCache.set(source, blocks);
	return blocks;
}

function hasExplicitVisualEvidence(source, componentName) {
	return visualTestBlocks(source).some(
		(block) =>
			explicitVisualEvidencePattern(componentName).test(block.source) &&
			executesComponentRender(block.source) &&
			block.source.includes('expect(') &&
			visualAssertionPattern.test(block.source)
	);
}

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

function pendingExecutionStages() {
	return {
		BrowserBehaviorVerified: false,
		VisuallyVerified: false,
		ProductionVerified: false,
		DesktopVerified: false
	};
}

function pendingExecutionEvidence() {
	return {
		BrowserBehaviorVerified: [],
		VisuallyVerified: [],
		ProductionVerified: [],
		DesktopVerified: []
	};
}

function metadataIdentifierForComponent(name) {
	if (!/^Z[A-Z]/u.test(name)) throw new Error(`Unsupported component metadata name: ${name}`);
	return `${name.slice(1).replace(/^./u, (letter) => letter.toLowerCase())}Metadata`;
}

function componentMetadataIndex(components) {
	const byId = new Map();
	const byIdentifier = new Map();
	for (const component of components) {
		const duplicateId = byId.get(component.id);
		if (duplicateId)
			throw new Error(
				`Duplicate component id ${component.id}: ${duplicateId.path} and ${component.path}`
			);
		byId.set(component.id, component);
		const identifier = metadataIdentifierForComponent(component.name);
		const duplicateIdentifier = byIdentifier.get(identifier);
		if (duplicateIdentifier)
			throw new Error(
				`Duplicate metadata identifier ${identifier}: ${duplicateIdentifier.path} and ${component.path}`
			);
		byIdentifier.set(identifier, component);
	}
	return { byId, byIdentifier };
}

function unwrapExpression(expression) {
	let current = expression;
	while (
		ts.isParenthesizedExpression(current) ||
		ts.isAsExpression(current) ||
		ts.isSatisfiesExpression(current) ||
		ts.isTypeAssertionExpression(current)
	)
		current = current.expression;
	return current;
}

function docDefinition(source, path) {
	const sourceFile = ts.createSourceFile(
		path,
		source,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	const calls = [];
	const visit = (node) => {
		if (
			ts.isCallExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === 'defineComponentDoc'
		)
			calls.push(node);
		ts.forEachChild(node, visit);
	};
	visit(sourceFile);
	if (calls.length !== 1)
		throw new Error(
			`Expected exactly one defineComponentDoc call in ${path}; found ${calls.length}.`
		);
	const [metadataExpression, optionsExpression] = calls[0].arguments;
	if (!metadataExpression || !ts.isIdentifier(unwrapExpression(metadataExpression)))
		throw new Error(`defineComponentDoc owner metadata must be an identifier in ${path}.`);
	const options = optionsExpression ? unwrapExpression(optionsExpression) : undefined;
	if (!options || !ts.isObjectLiteralExpression(options))
		throw new Error(`defineComponentDoc options must be an object literal in ${path}.`);
	const memberProperties = options.properties.filter((property) => {
		if (!property.name) return false;
		return (
			(ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
			property.name.text === 'members'
		);
	});
	if (memberProperties.length > 1) throw new Error(`Duplicate members property in ${path}.`);
	const memberProperty = memberProperties[0];
	if (!memberProperty)
		return { memberIdentifiers: [], ownerIdentifier: unwrapExpression(metadataExpression).text };
	if (!ts.isPropertyAssignment(memberProperty))
		throw new Error(`members must be a property assignment in ${path}.`);
	const members = unwrapExpression(memberProperty.initializer);
	if (!ts.isArrayLiteralExpression(members))
		throw new Error(`members must be an identifier array in ${path}.`);
	const memberIdentifiers = members.elements.map((element) => {
		const member = unwrapExpression(element);
		if (!ts.isIdentifier(member))
			throw new Error(`members entries must be metadata identifiers in ${path}.`);
		return member.text;
	});
	return {
		memberIdentifiers,
		ownerIdentifier: unwrapExpression(metadataExpression).text
	};
}

function docsEvidenceByComponentId(components, docs, contentRoot) {
	const { byId, byIdentifier } = componentMetadataIndex(components);
	const ownership = new Map();
	for (const [docPath, docSource] of docs) {
		const relativeDocPath = portable(relative(contentRoot, docPath));
		const ownerId = relativeDocPath.split('/').at(-2);
		const owner = ownerId ? byId.get(ownerId) : undefined;
		if (!owner)
			throw new Error(`Unknown component documentation owner ${ownerId ?? '<none>'}: ${docPath}`);
		const { memberIdentifiers, ownerIdentifier } = docDefinition(docSource, docPath);
		const declaredOwner = byIdentifier.get(ownerIdentifier);
		if (!declaredOwner) throw new Error(`Unknown owner metadata ${ownerIdentifier} in ${docPath}.`);
		if (declaredOwner.id !== ownerId)
			throw new Error(
				`Documentation owner mismatch in ${docPath}: route ${ownerId}, metadata ${declaredOwner.id}.`
			);
		if (ownership.has(ownerId))
			throw new Error(`Duplicate documentation ownership for ${ownerId}: ${docPath}`);
		ownership.set(ownerId, {
			detail: 'catalog component documentation module',
			path: docPath
		});
		for (const metadataIdentifier of memberIdentifiers) {
			const member = byIdentifier.get(metadataIdentifier);
			if (!member) throw new Error(`Unknown member metadata ${metadataIdentifier} in ${docPath}.`);
			if (ownership.has(member.id))
				throw new Error(`Duplicate documentation ownership for ${member.id}: ${docPath}`);
			ownership.set(member.id, {
				detail: `family-owned documentation module (${ownerId})`,
				path: docPath
			});
		}
	}
	return ownership;
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
const teachingCoverage = JSON.parse(await readFile(teachingCoveragePath, 'utf8'));
const teachingById = new Map(teachingCoverage.components.map((item) => [item.id, item]));
const docsFiles = await filesUnder(resolve(docsRoot, 'src/content/components'), 'doc.ts');
const docsSources = await Promise.all(
	docsFiles.map(async (path) => [path, await readFile(path, 'utf8')])
);
const docsByComponentId = docsEvidenceByComponentId(
	componentFiles,
	docsSources,
	resolve(docsRoot, 'src/content/components')
);
const testFiles = await filesUnder(testsRoot, '.ts');
const tests = await Promise.all(
	testFiles.map(async (path) => [path, await readFile(path, 'utf8')])
);
const fixtureFiles = await filesUnder(testsRoot, '.svelte');
const fixtureSources = new Map(
	await Promise.all(fixtureFiles.map(async (path) => [path, await readFile(path, 'utf8')]))
);
function fixtureEvidenceFor(
	testPath,
	testSource,
	componentName,
	sources = fixtureSources,
	renderSource = testSource
) {
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
				!new RegExp(`(?:render|mount)\\(\\s*${fixtureName}\\b`, 'u').test(renderSource)
			)
				return [];
			const markup = withoutComments(fixtureSource);
			return new RegExp(`<${componentName}\\b`, 'u').test(markup)
				? [evidence(fixturePath, `${componentName} explicit rendered fixture usage`)]
				: [];
		}
	);
}
function ownedVisualBlocks(testPath, content, name, sources = fixtureSources) {
	return visualTestBlocks(content).filter(
		(block) =>
			hasExplicitVisualEvidence(block.source, name) &&
			(directRenderPattern(name).test(withoutComments(block.source)) ||
				fixtureEvidenceFor(testPath, content, name, sources, withoutComments(block.source)).length >
					0)
	);
}
if (process.argv.includes('--self-test')) {
	if (
		!hasRuntimeImplementation('<script\nlang="ts"\ngenerics="T">let value;</script><div />') ||
		hasRuntimeImplementation('<script module lang="ts">export const data = {};</script><div />') ||
		hasRuntimeImplementation('<script lang="ts">let value = 1;</script><!-- <div /> -->')
	)
		throw new Error('instance script and markup evidence self-test failed');
	const fixturePath = resolve('C:/tests', 'Fixture.svelte');
	const fixture = new Map([[fixturePath, '<ZButton />']]);
	if (!directRenderPattern('ZButton').test('render(ZButton)'))
		throw new Error('direct render self-test failed');
	if (directRenderPattern('ZButton').test('import ZButton from "x"; expect(true)'))
		throw new Error('import-only self-test failed');
	if (!explicitComponentPattern('ZButton').test("describe('ZButton contract', () => {})"))
		throw new Error('explicit component self-test failed');
	if (explicitComponentPattern('ZButton').test("describe('button contract', () => {})"))
		throw new Error('implicit component self-test failed');
	if (explicitComponentPattern('ZButton').test(withoutComments('// ZButton\nexpect(true)')))
		throw new Error('comment-only component self-test failed');
	if (
		!hasExplicitVisualEvidence(
			"it('button', () => { /* @zui-visual ZButton geometry */ render(ZButton); expect(getComputedStyle(node).height); });",
			'ZButton'
		)
	)
		throw new Error('explicit visual evidence self-test failed');
	if (
		hasExplicitVisualEvidence(
			'// @zui-visual ZButton geometry\\nrender(ZButton); expect(node.dataset.size);',
			'ZButton'
		)
	)
		throw new Error('non-visual marker self-test failed');
	if (
		hasExplicitVisualEvidence('render(ZButton); expect(getBoundingClientRect().height);', 'ZButton')
	)
		throw new Error('unowned visual assertion self-test failed');
	if (
		hasExplicitVisualEvidence(
			"it('one', () => { /* @zui-visual ZButton */ render(ZButton); expect(true); }); it('two', () => { render(Other); expect(getComputedStyle(other).height); });",
			'ZButton'
		)
	)
		throw new Error('visual evidence incorrectly crossed test block boundaries');
	if (
		ownedVisualBlocks(
			resolve('C:/tests', 'example.spec.ts'),
			"import Fixture from './Fixture.svelte'; it('one', () => { render(Fixture); }); it('two', () => { /* @zui-visual ZButton */ render(Other); expect(getComputedStyle(other).height); });",
			'ZButton',
			fixture
		).length
	)
		throw new Error('visual fixture ownership incorrectly crossed test block boundaries');
	if (Object.values(pendingExecutionStages()).some(Boolean))
		throw new Error('static maturity inventory must not synthesize execution verification');
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
	const docsFixtureRoot = resolve('C:/docs/components');
	const docsComponents = [
		{ id: 'form', name: 'ZForm', path: 'ZForm.svelte' },
		{ id: 'form-field', name: 'ZFormField', path: 'ZFormField.svelte' }
	];
	const ownerDocPath = resolve(docsFixtureRoot, 'input/form/doc.ts');
	const owned = docsEvidenceByComponentId(
		docsComponents,
		[
			[
				ownerDocPath,
				`const example = "members: [fakeMetadata]";
				// members: [commentMetadata]
				export const doc = defineComponentDoc(formMetadata, { members: [formFieldMetadata] });`
			]
		],
		docsFixtureRoot
	);
	if (owned.get('form')?.path !== ownerDocPath || owned.get('form-field')?.path !== ownerDocPath)
		throw new Error('family documentation ownership self-test failed');
	const expectOwnershipFailure = (label, expectedPattern, components, docs) => {
		try {
			docsEvidenceByComponentId(components, docs, docsFixtureRoot);
		} catch (error) {
			if (expectedPattern.test(String(error))) return;
			throw new Error(`${label} self-test received an unexpected error: ${error}`, {
				cause: error
			});
		}
		throw new Error(`${label} self-test accepted invalid ownership.`);
	};
	expectOwnershipFailure(
		'unknown member metadata',
		/Unknown member metadata unknownMetadata/u,
		docsComponents,
		[[ownerDocPath, 'defineComponentDoc(formMetadata, { members: [unknownMetadata] });']]
	);
	expectOwnershipFailure(
		'unknown documentation owner',
		/Unknown component documentation owner unknown/u,
		docsComponents,
		[[resolve(docsFixtureRoot, 'input/unknown/doc.ts'), 'defineComponentDoc(formMetadata, {});']]
	);
	expectOwnershipFailure(
		'duplicate metadata identifier',
		/Duplicate metadata identifier formMetadata/u,
		[...docsComponents, { id: 'form-copy', name: 'ZForm', path: 'ZFormCopy.svelte' }],
		[]
	);
	expectOwnershipFailure(
		'duplicate documentation owner',
		/Duplicate documentation ownership for form/u,
		docsComponents,
		[
			[ownerDocPath, 'defineComponentDoc(formMetadata, {});'],
			[resolve(docsFixtureRoot, 'other/form/doc.ts'), 'defineComponentDoc(formMetadata, {});']
		]
	);
	console.log('Maturity evidence self-test passed.');
	process.exit(0);
}

const rows = componentFiles.map(({ id, name, category, status, path, source }) => {
	const sourcePath = portable(relative(workspaceRoot, path));
	const contractFact = contractBySource.get(sourcePath);
	const apiDocumentation = teachingById.get(id);
	if (!apiDocumentation) throw new Error(`Missing API teaching coverage for ${id}.`);
	const docs = docsByComponentId.get(id);
	const componentReference = directRenderPattern(name);
	const explicitComponentReference = explicitComponentPattern(name);
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
			explicitComponentReference.test(withoutComments(content)) &&
			executesComponentRender(content)
	);
	const visualTests = relatedTests.filter(
		([testPath, content]) =>
			testPath.endsWith('.browser.spec.ts') &&
			content.includes('expect(') &&
			executesComponentRender(content) &&
			ownedVisualBlocks(testPath, content, name).length > 0
	);
	const productionTests = relatedTests.filter(
		([testPath, content]) =>
			testPath.includes('production') &&
			content.includes('expect(') &&
			explicitComponentReference.test(withoutComments(content)) &&
			executesComponentRender(content)
	);
	const ssrTests = relatedTests.filter(
		([, content]) =>
			content.includes("from 'svelte/server'") &&
			content.includes('expect(') &&
			content.includes('render(')
	);
	const runtimeImplemented = hasRuntimeImplementation(source);
	const exportPattern = new RegExp(`\\bdefault as ${name}\\b`, 'u');
	const authorable = entrypointSources.some(([, entrypoint]) => exportPattern.test(entrypoint));
	const row = {
		id,
		name,
		category,
		family: apiDocumentation.family ?? null,
		status,
		source: sourcePath,
		apiDocumentation: {
			metadataGapPropCount: apiDocumentation.metadataGapPropCount,
			teachingFallbackPropCount: apiDocumentation.fallbackPropCount
		},
		stages: {
			MetadataDeclared: true,
			PublicExportPresent: authorable,
			ApiContractDeclared: Boolean(contractFact),
			RuntimeImplemented: runtimeImplemented,
			BrowserBehaviorContractsDeclared: browserTests.length > 0,
			VisualContractsDeclared: visualTests.length > 0,
			ProductionContractsDeclared: productionTests.length > 0,
			SsrContractsDeclared: ssrTests.length > 0
		},
		evidence: {
			MetadataDeclared: [evidence(path, 'zuiMetadata declaration')],
			PublicExportPresent: authorable
				? entrypointSources
						.filter(([, entrypoint]) => exportPattern.test(entrypoint))
						.map(([entrypoint]) => evidence(entrypoint, `public entrypoint export ${name}`))
				: [],
			ApiContractDeclared: contractFact
				? [evidence(contractPath, `${contractFact.sha256} API snapshot entry`)]
				: [],
			RuntimeImplemented: runtimeImplemented
				? [evidence(path, 'component markup and instance script')]
				: [],
			BrowserBehaviorContractsDeclared: browserTests.flatMap(([testPath, content]) => [
				evidence(testPath, `${name} browser behavior assertions`),
				...fixtureEvidenceFor(testPath, content, name)
			]),
			VisualContractsDeclared: visualTests.flatMap(([testPath, content]) => [
				...ownedVisualBlocks(testPath, content, name).map((block) =>
					evidence(testPath, `${name} authored visual contract: ${block.name} (line ${block.line})`)
				),
				...fixtureEvidenceFor(testPath, content, name)
			]),
			ProductionContractsDeclared: productionTests.flatMap(([testPath, content]) => [
				evidence(testPath, `${name} production assertions`),
				...fixtureEvidenceFor(testPath, content, name)
			]),
			SsrContractsDeclared: ssrTests.map(([testPath]) =>
				evidence(testPath, `${name} SSR assertions`)
			)
		},
		executionStages: pendingExecutionStages(),
		executionEvidence: pendingExecutionEvidence(),
		docs: docs ? evidence(docs.path, docs.detail) : null,
		ssrContracts: ssrTests.map(([testPath]) => evidence(testPath, `${name} SSR assertions`))
	};
	return row;
});

const stageNames = [
	'MetadataDeclared',
	'PublicExportPresent',
	'ApiContractDeclared',
	'RuntimeImplemented',
	'BrowserBehaviorContractsDeclared',
	'VisualContractsDeclared',
	'ProductionContractsDeclared',
	'SsrContractsDeclared'
];
const executionStageNames = [
	'BrowserBehaviorVerified',
	'VisuallyVerified',
	'ProductionVerified',
	'DesktopVerified'
];
const summary = Object.fromEntries(
	stageNames.map((stage) => [stage, rows.filter((row) => row.stages[stage]).length])
);
const executionSummary = Object.fromEntries(
	executionStageNames.map((stage) => [
		stage,
		rows.filter((row) => row.executionStages[stage]).length
	])
);
const output = {
	schemaVersion: 3,
	source: {
		metadataComponents: rows.length,
		documentationPages: new Set(rows.map((row) => row.docs?.path).filter(Boolean)).size,
		contractComponents: contract.components.length,
		testFiles: testFiles.length
	},
	stageNames,
	executionStageNames,
	evidenceScope:
		'Static inventory of source, exports, API snapshots, and authored test contracts. Assets never imply execution success.',
	execution: {
		status: 'pending',
		revision: null,
		source: null,
		detail:
			'No repository manifest binds per-component browser, production, or visual results to the current commit.'
	},
	summary,
	executionSummary,
	components: rows
};
const serializedJson = `${JSON.stringify(output, null, '\t')}\n`;

const lines = [
	'# ZUI component maturity matrix',
	'',
	`Generated from ${rows.length} metadata components, ${output.source.documentationPages} documentation modules, ${contract.components.length} API contract entries, and ${testFiles.length} test files.`,
	'',
	'This is a static inventory of authored contracts and source assets. `BrowserBehaviorContractsDeclared`, `VisualContractsDeclared`, `ProductionContractsDeclared`, and `SsrContractsDeclared` only mean matching assets exist. They do not report that a test ran or passed. Per-component execution stages remain pending until a revision-bound evidence manifest is supplied; the existing WebView2 desktop composer is one such independent evidence path.',
	'',
	'| Static stage | Count |',
	'|---|---:|',
	...stageNames.map((stage) => `| ${stage} | ${summary[stage]} |`),
	'',
	'| Execution stage | Current revision status |',
	'|---|---:|',
	...executionStageNames.map(
		(stage) =>
			`| ${stage} | ${executionSummary[stage]} verified; ${rows.length - executionSummary[stage]} pending |`
	),
	'',
	'| Component | Category | Metadata | Export | API contract | Runtime | Browser contracts | Visual contracts | Production contracts | SSR contracts | Current execution | Docs |',
	'|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|',
	...rows.map(
		(row) =>
			`| ${row.name} | ${row.category} | ${row.stages.MetadataDeclared ? 'Y' : '—'} | ${row.stages.PublicExportPresent ? 'Y' : '—'} | ${row.stages.ApiContractDeclared ? 'Y' : '—'} | ${row.stages.RuntimeImplemented ? 'Y' : '—'} | ${row.stages.BrowserBehaviorContractsDeclared ? 'Y' : '—'} | ${row.stages.VisualContractsDeclared ? 'Y' : '—'} | ${row.stages.ProductionContractsDeclared ? 'Y' : '—'} | ${row.stages.SsrContractsDeclared ? 'Y' : '—'} | pending | ${row.docs?.path ?? '—'} |`
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
		summary,
		executionSummary
	})
);
