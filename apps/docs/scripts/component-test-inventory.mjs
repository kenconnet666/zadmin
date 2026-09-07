import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const portable = (value) => value.replaceAll('\\', '/');
export const directRenderPattern = (name) => ({
	test: (source) => sourceAnalysis(source).rendered.has(name)
});
export const explicitComponentPattern = (name) => new RegExp(`\\b${name}\\b`, 'u');
export const executesComponentRender = (source) => sourceAnalysis(source).rendered.size > 0;
const explicitVisualEvidencePattern = (name) => new RegExp(`@zui-visual\\s+${name}(?:\\s|$)`, 'u');
const visualAssertionPattern =
	/\b(?:getBoundingClientRect|getComputedStyle)\s*\(|\.toHaveCSS\s*\(|\.toHaveScreenshot\s*\(/u;
export const withoutComments = (source) =>
	source.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/[^\n]*/gu, '');

const testBlockCache = new Map();
const sourceAnalysisCache = new Map();
const rendererNamesCache = new Map();
const fixtureImportCache = new Map();
const exactOwnershipCache = new Map();
function staticTitle(argument) {
	return argument && (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))
		? argument.text
		: null;
}

function callFamily(node, file) {
	if (!ts.isCallExpression(node)) return null;
	const expression = node.expression.getText(file);
	if (/^describe(?:\.|\(|$)/u.test(expression)) return 'describe';
	if (/^(?:it|test)(?:\.|\(|$)/u.test(expression)) return 'test';
	return null;
}

export function visualTestBlocks(source) {
	if (testBlockCache.has(source)) return testBlockCache.get(source);
	const file = ts.createSourceFile('component.spec.ts', source, ts.ScriptTarget.Latest, true);
	const blocks = [];
	function visit(node, ancestors = [], parameterizedAncestor = false) {
		const family = callFamily(node, file);
		const callback =
			family && ts.isCallExpression(node)
				? node.arguments.find(
						(argument) => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)
					)
				: undefined;
		if (family === 'describe' && callback?.body && ts.isBlock(callback.body)) {
			const title = staticTitle(node.arguments[0]);
			const parameterized =
				parameterizedAncestor || /\.(?:each|for)\b/u.test(node.expression.getText(file));
			for (const statement of callback.body.statements)
				visit(statement, [...ancestors, title], parameterized);
			return;
		}
		if (family === 'test' && callback?.body && ts.isBlock(callback.body)) {
			const leafTitle = staticTitle(node.arguments[0]);
			const parameterized =
				parameterizedAncestor || /\.(?:each|for)\b/u.test(node.expression.getText(file));
			const titles = [...ancestors, leafTitle];
			const title =
				!parameterized && titles.every((value) => value !== null) ? titles.join(' > ') : null;
			const start = ts.isExpressionStatement(node.parent)
				? node.parent.getFullStart()
				: node.getFullStart();
			blocks.push({
				name: leafTitle ?? '<parameterized test>',
				source: source.slice(start, node.end),
				line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1,
				title
			});
			return;
		}
		ts.forEachChild(node, (child) => visit(child, ancestors, parameterizedAncestor));
	}
	visit(file);
	testBlockCache.set(source, blocks);
	return blocks;
}

function unwrapAliasExpression(expression) {
	let current = expression;
	while (
		ts.isParenthesizedExpression(current) ||
		ts.isAsExpression(current) ||
		ts.isSatisfiesExpression(current) ||
		ts.isTypeAssertionExpression(current) ||
		ts.isNonNullExpression(current)
	)
		current = current.expression;
	return current;
}

function rendererNamesForSource(source) {
	if (rendererNamesCache.has(source)) return rendererNamesCache.get(source);
	const file = ts.createSourceFile('renderers.ts', source, ts.ScriptTarget.Latest, true);
	const declarations = [];
	function visit(node) {
		if (
			ts.isVariableDeclaration(node) &&
			ts.isIdentifier(node.name) &&
			node.initializer &&
			ts.isVariableDeclarationList(node.parent) &&
			(node.parent.flags & ts.NodeFlags.Const) !== 0
		)
			declarations.push(node);
		ts.forEachChild(node, visit);
	}
	visit(file);
	const names = new Set(['mount', 'render']);
	let changed = true;
	while (changed) {
		changed = false;
		for (const declaration of declarations) {
			const initializer = unwrapAliasExpression(declaration.initializer);
			if (
				ts.isIdentifier(initializer) &&
				names.has(initializer.text) &&
				!names.has(declaration.name.text)
			) {
				names.add(declaration.name.text);
				changed = true;
			}
		}
	}
	rendererNamesCache.set(source, names);
	return names;
}

function sourceAnalysis(source, rendererNames = rendererNamesForSource(source)) {
	const rendererKey = [...rendererNames].sort().join('|');
	const cachedByRenderer = sourceAnalysisCache.get(source);
	if (cachedByRenderer?.has(rendererKey)) return cachedByRenderer.get(rendererKey);
	const file = ts.createSourceFile('block.ts', source, ts.ScriptTarget.Latest, true);
	const rendered = new Set();
	let expects = false;
	let visualAssertion = false;
	function visit(node) {
		if (ts.isCallExpression(node)) {
			if (ts.isIdentifier(node.expression) && rendererNames.has(node.expression.text)) {
				const first = node.arguments[0];
				if (first && ts.isIdentifier(first)) rendered.add(first.text);
			}
			if (ts.isIdentifier(node.expression) && node.expression.text === 'expect') expects = true;
			const expression = node.expression;
			const callName = ts.isIdentifier(expression)
				? expression.text
				: ts.isPropertyAccessExpression(expression)
					? expression.name.text
					: null;
			if (
				callName === 'getBoundingClientRect' ||
				callName === 'getComputedStyle' ||
				callName === 'toHaveCSS' ||
				callName === 'toHaveScreenshot'
			)
				visualAssertion = true;
		}
		ts.forEachChild(node, visit);
	}
	visit(file);
	const scanner = ts.createScanner(
		ts.ScriptTarget.Latest,
		false,
		ts.LanguageVariant.Standard,
		source
	);
	const comments = [];
	for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
		if (
			token === ts.SyntaxKind.SingleLineCommentTrivia ||
			token === ts.SyntaxKind.MultiLineCommentTrivia
		)
			comments.push(scanner.getTokenText());
	}
	const result = { comments: comments.join('\n'), expects, rendered, visualAssertion };
	const byRenderer = cachedByRenderer ?? new Map();
	byRenderer.set(rendererKey, result);
	if (!cachedByRenderer) sourceAnalysisCache.set(source, byRenderer);
	return result;
}

function fixtureImportMap(testPath, testSource, sources) {
	const cachedByPath = fixtureImportCache.get(testSource);
	const cached = cachedByPath?.get(testPath);
	if (cached?.sources === sources) return cached.imports;
	const file = ts.createSourceFile(testPath, testSource, ts.ScriptTarget.Latest, true);
	const imports = new Map();
	for (const statement of file.statements) {
		if (
			!ts.isImportDeclaration(statement) ||
			!statement.importClause?.name ||
			!ts.isStringLiteral(statement.moduleSpecifier) ||
			!/^\.\/.*\.svelte$/u.test(statement.moduleSpecifier.text)
		)
			continue;
		const fixturePath = resolve(dirname(testPath), statement.moduleSpecifier.text);
		const fixtureSource = sources.get(fixturePath);
		if (fixtureSource)
			imports.set(statement.importClause.name.text, { path: fixturePath, source: fixtureSource });
	}
	const byPath = cachedByPath ?? new Map();
	byPath.set(testPath, { imports, sources });
	if (!cachedByPath) fixtureImportCache.set(testSource, byPath);
	return imports;
}

function blockOwnsComponentExactly(testPath, testSource, block, name, sources) {
	const cacheKey = `${testPath}:${block.line}:${name}`;
	const cachedBySource = exactOwnershipCache.get(testSource);
	const cached = cachedBySource?.get(cacheKey);
	if (cached?.sources === sources) return cached.owns;
	const { rendered } = sourceAnalysis(block.source, rendererNamesForSource(testSource));
	let owns = rendered.has(name);
	if (!owns) {
		const fixtures = fixtureImportMap(testPath, testSource, sources);
		for (const renderedName of rendered) {
			const fixture = fixtures.get(renderedName);
			if (fixture && new RegExp(`<${name}\\b`, 'u').test(withoutComments(fixture.source))) {
				owns = true;
				break;
			}
		}
	}
	const bySource = cachedBySource ?? new Map();
	bySource.set(cacheKey, { owns, sources });
	if (!cachedBySource) exactOwnershipCache.set(testSource, bySource);
	return owns;
}

function blockHasVisualContract(block, componentName, rendererNames) {
	const analysis = sourceAnalysis(block.source, rendererNames);
	return (
		explicitVisualEvidencePattern(componentName).test(analysis.comments) &&
		analysis.rendered.size > 0 &&
		analysis.expects &&
		analysis.visualAssertion
	);
}

export function hasExplicitVisualEvidence(source, componentName) {
	const rendererNames = rendererNamesForSource(source);
	return visualTestBlocks(source).some(
		(block) =>
			explicitVisualEvidencePattern(componentName).test(block.source) &&
			sourceAnalysis(block.source, rendererNames).rendered.size > 0 &&
			block.source.includes('expect(') &&
			visualAssertionPattern.test(block.source)
	);
}

export async function filesUnder(root, extension) {
	const entries = await readdir(root, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = resolve(root, entry.name);
		if (entry.isDirectory()) files.push(...(await filesUnder(path, extension)));
		else if (entry.name.endsWith(extension)) files.push(path);
	}
	return files.sort();
}

export function fixtureEvidenceFor(
	testPath,
	testSource,
	componentName,
	sources,
	renderSource = testSource,
	workspaceRoot = process.cwd()
) {
	const rendered = sourceAnalysis(renderSource, rendererNamesForSource(testSource)).rendered;
	return [...fixtureImportMap(testPath, testSource, sources)].flatMap(([fixtureName, fixture]) => {
		if (!rendered.has(fixtureName)) return [];
		const markup = withoutComments(fixture.source);
		return new RegExp(`<${componentName}\\b`, 'u').test(markup)
			? [
					{
						path: portable(relative(workspaceRoot, fixture.path)),
						detail: `${componentName} explicit rendered fixture usage`
					}
				]
			: [];
	});
}

export function ownedVisualBlocks(testPath, content, name, sources) {
	const rendererNames = rendererNamesForSource(content);
	return visualTestBlocks(content).filter(
		(block) =>
			explicitVisualEvidencePattern(name).test(block.source) &&
			sourceAnalysis(block.source, rendererNames).rendered.size > 0 &&
			block.source.includes('expect(') &&
			visualAssertionPattern.test(block.source) &&
			(sourceAnalysis(block.source, rendererNames).rendered.has(name) ||
				fixtureEvidenceFor(testPath, content, name, sources, withoutComments(block.source)).length >
					0)
	);
}

function ownedVisualBlocksExactly(testPath, content, name, sources) {
	const rendererNames = rendererNamesForSource(content);
	return visualTestBlocks(content).filter(
		(block) =>
			blockHasVisualContract(block, name, rendererNames) &&
			blockOwnsComponentExactly(testPath, content, block, name, sources)
	);
}

const kindEvidenceKeys = {
	browser: ['BrowserBehaviorContractsDeclared'],
	production: ['ProductionContractsDeclared'],
	ssr: ['SsrContractsDeclared', 'ssrContracts'],
	visual: ['VisualContractsDeclared']
};
const kindOrder = new Map(
	['browser', 'visual', 'production', 'ssr'].map((kind, index) => [kind, index])
);

function evidenceFiles(component, kind) {
	const candidates = kindEvidenceKeys[kind].flatMap((key) =>
		key === 'ssrContracts' ? (component.ssrContracts ?? []) : (component.evidence?.[key] ?? [])
	);
	return [
		...new Set(
			candidates
				.map((item) => item?.path)
				.filter(
					(path) =>
						typeof path === 'string' &&
						path.startsWith('ui/zui/tests/') &&
						path.endsWith('.spec.ts')
				)
		)
	].sort();
}

function preciseBlocks(kind, testPath, source, componentName, fixtureSources) {
	if (kind === 'visual')
		return ownedVisualBlocksExactly(testPath, source, componentName, fixtureSources);
	const serverRendered = source.includes("from 'svelte/server'");
	const rendererNames = rendererNamesForSource(source);
	return visualTestBlocks(source).filter((block) => {
		const analysis = sourceAnalysis(block.source, rendererNames);
		return (
			blockOwnsComponentExactly(testPath, source, block, componentName, fixtureSources) &&
			analysis.expects &&
			(kind !== 'ssr' || (serverRendered && analysis.rendered.size > 0))
		);
	});
}

function validateBase(baseMaturity) {
	if (!baseMaturity || typeof baseMaturity !== 'object' || !Array.isArray(baseMaturity.components))
		throw new TypeError('baseMaturity.components must be an array.');
	const ids = new Set();
	const names = new Set();
	for (const component of baseMaturity.components) {
		if (!component || typeof component.id !== 'string' || typeof component.name !== 'string')
			throw new TypeError('Every base maturity component must have string id and name fields.');
		if (ids.has(component.id))
			throw new Error(`Duplicate base maturity component id: ${component.id}.`);
		if (names.has(component.name))
			throw new Error(`Duplicate base maturity component name: ${component.name}.`);
		ids.add(component.id);
		names.add(component.name);
	}
}

export async function createComponentTestInventory({ workspaceRoot, baseMaturity }) {
	if (typeof workspaceRoot !== 'string' || workspaceRoot.length === 0)
		throw new TypeError('workspaceRoot must be a non-empty string.');
	validateBase(baseMaturity);
	const resolvedWorkspaceRoot = resolve(workspaceRoot);
	const testsRoot = resolve(resolvedWorkspaceRoot, 'ui/zui/tests');
	const fixturePaths = await filesUnder(testsRoot, '.svelte');
	const fixtureSources = new Map(
		await Promise.all(fixturePaths.map(async (path) => [path, await readFile(path, 'utf8')]))
	);
	const sourceCache = new Map();
	const relevantFiles = new Set(
		baseMaturity.components.flatMap((component) =>
			Object.keys(kindEvidenceKeys).flatMap((kind) => evidenceFiles(component, kind))
		)
	);
	await Promise.all(
		[...relevantFiles].map(async (file) => {
			const path = resolve(resolvedWorkspaceRoot, file);
			sourceCache.set(path, await readFile(path, 'utf8'));
		})
	);
	function testSource(file) {
		const path = resolve(resolvedWorkspaceRoot, file);
		return [path, sourceCache.get(path)];
	}

	const components = [];
	for (const component of baseMaturity.components) {
		const contracts = [];
		for (const kind of Object.keys(kindEvidenceKeys)) {
			for (const file of evidenceFiles(component, kind)) {
				const [testPath, source] = testSource(file);
				const blocks = preciseBlocks(kind, testPath, source, component.name, fixtureSources);
				if (blocks.length > 0) {
					for (const block of blocks)
						contracts.push({
							file,
							kind,
							line: block.line,
							scope: 'test-block',
							title: block.title
						});
				} else if (kind !== 'visual') {
					contracts.push({ file, kind, line: null, scope: 'shared-file', title: null });
				}
			}
		}
		contracts.sort(
			(left, right) =>
				left.file.localeCompare(right.file) ||
				(left.line ?? Number.MAX_SAFE_INTEGER) - (right.line ?? Number.MAX_SAFE_INTEGER) ||
				kindOrder.get(left.kind) - kindOrder.get(right.kind)
		);
		components.push({ contracts, id: component.id, name: component.name });
	}
	return { components, schemaVersion: 1 };
}

async function selfTest() {
	const root = await mkdtemp(resolve(tmpdir(), 'zui-test-inventory-'));
	try {
		const testsRoot = resolve(root, 'ui/zui/tests');
		await mkdir(testsRoot, { recursive: true });
		await writeFile(resolve(testsRoot, 'ButtonFixture.svelte'), '<ZButton />');
		await writeFile(
			resolve(testsRoot, 'button-production.browser.spec.ts'),
			`import ButtonFixture from './ButtonFixture.svelte';
			 describe('ZButton suite', () => {
			   it('same title', () => { render(ZButton); expect(true); });
			   it('same title', () => { render(ButtonFixture); expect(true); });
			   it.each([[1]])('parameter %s', (value) => { render(ZButton); expect(value); });
			   it('visual', () => { /* @zui-visual ZButton geometry */ render(ZButton); expect(getBoundingClientRect().height); });
			   it('marker only', () => { /* @zui-visual ZButton */ render(ZButton); expect(true); });
			   it('other block', () => { render(Other); expect(getComputedStyle(other).height); });
			   it('string and comment only', () => { const fake = 'render(ZOther)'; render(Other); expect(fake); });
			 });
			 // render(ZOther); expect(ZOther);`
		);
		await writeFile(
			resolve(testsRoot, 'button-production-ssr.spec.ts'),
			`import { render } from 'svelte/server';
			 const renderSsr = (render as unknown as Renderer);
			 it('ssr', () => { const body = renderSsr(ZButton).body; expect(body); });`
		);
		const browserPath = 'ui/zui/tests/button-production.browser.spec.ts';
		const ssrPath = 'ui/zui/tests/button-production-ssr.spec.ts';
		const evidence = (path) => [{ path }];
		const baseMaturity = {
			components: [
				{
					evidence: {
						BrowserBehaviorContractsDeclared: evidence(browserPath),
						ProductionContractsDeclared: evidence(browserPath),
						SsrContractsDeclared: evidence(ssrPath),
						VisualContractsDeclared: evidence(browserPath)
					},
					id: 'button',
					name: 'ZButton',
					ssrContracts: evidence(ssrPath)
				},
				{
					evidence: {
						BrowserBehaviorContractsDeclared: evidence(browserPath),
						VisualContractsDeclared: evidence(browserPath)
					},
					id: 'other',
					name: 'ZOther'
				}
			]
		};
		const inventory = await createComponentTestInventory({ baseMaturity, workspaceRoot: root });
		const aliasSource = 'const renderSsr = (render as unknown as Renderer); renderSsr(ZButton);';
		if (
			!directRenderPattern('ZButton').test(aliasSource) ||
			!executesComponentRender(aliasSource) ||
			directRenderPattern('ZButton').test(
				"function renderSsr(value) {} renderSsr(ZButton); 'render(ZButton)'; // render(ZButton)"
			)
		)
			throw new Error('renderer alias self-test failed.');
		const button = inventory.components[0];
		const browser = button.contracts.filter((contract) => contract.kind === 'browser');
		if (
			inventory.schemaVersion !== 1 ||
			browser.filter((contract) => contract.title === 'ZButton suite > same title').length !== 2 ||
			!browser.some((contract) => contract.title === null && contract.scope === 'test-block') ||
			button.contracts.filter((contract) => contract.kind === 'visual').length !== 1 ||
			!button.contracts.some(
				(contract) => contract.kind === 'ssr' && contract.scope === 'test-block'
			)
		)
			throw new Error(
				'owned block, duplicate title, parameterized, fixture or visual self-test failed.'
			);
		const other = inventory.components[1];
		if (
			other.contracts.some((contract) => contract.kind === 'visual') ||
			!other.contracts.some(
				(contract) => contract.kind === 'browser' && contract.scope === 'shared-file'
			)
		)
			throw new Error('comment, other-block or unowned fallback self-test failed.');
		console.log('Component test inventory self-test passed.');
	} finally {
		await rm(root, { force: true, recursive: true });
	}
}

const invokedDirectly =
	process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (invokedDirectly && process.argv.includes('--self-test')) await selfTest();
