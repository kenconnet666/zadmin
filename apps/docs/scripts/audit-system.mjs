import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(docsRoot, '../..');
const componentsRoot = resolve(workspaceRoot, 'ui/zui/src/components');
const docsComponentsRoot = resolve(docsRoot, 'src/content/components');
const docsSourceRoot = resolve(docsRoot, 'src');
const portable = (path) => path.replaceAll('\\', '/');
const ignoredDirectories = new Set([
	'.svelte-kit',
	'.vite',
	'build',
	'coverage',
	'dist',
	'node_modules',
	'playwright-report',
	'test-results'
]);

async function filesUnder(root, extensions) {
	const entries = await readdir(root, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = resolve(root, entry.name);
		if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
			files.push(...(await filesUnder(path, extensions)));
		} else if (entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension))) {
			files.push(path);
		}
	}
	return files.sort();
}

function fail(message) {
	throw new Error(message);
}

function auditTabOrder(source, filename) {
	if (/tabindex\s*=\s*(?:["'][1-9]\d*["']|\{[1-9]\d*\})/u.test(source)) {
		fail(`${filename} contains a positive tabindex.`);
	}
	for (const match of source.matchAll(
		/<(?:a|button|input|select|textarea)\b[^>]*aria-hidden=["']true["'][^>]*>/gu
	)) {
		if (!/tabindex\s*=\s*(?:["']-1["']|\{-1\})/u.test(match[0])) {
			fail(`${filename} contains an aria-hidden interactive element in the tab order.`);
		}
	}
}

function auditSvelte5(source, filename) {
	if (/\son:[a-z][\w-]*\s*=/u.test(source)) {
		fail(`${filename} uses a legacy Svelte event directive.`);
	}
	if (/\bcreateEventDispatcher\b/u.test(source)) {
		fail(`${filename} uses createEventDispatcher instead of callback props.`);
	}
	if (/<svelte:component\b/u.test(source)) {
		fail(`${filename} uses the legacy dynamic component element.`);
	}
	if (/@ts-(?:ignore|nocheck)\b|\bas\s+any\b|:\s*any\b|<any>/u.test(source)) {
		fail(`${filename} bypasses TypeScript with an unsafe escape hatch.`);
	}
	if (
		/\{@html\}|\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write)\b|\beval\s*\(|new\s+Function\b|createElement\(\s*["']script["']|(?:href|src)\s*=\s*["']javascript:/u.test(
			source
		)
	) {
		fail(`${filename} contains a dangerous dynamic DOM sink.`);
	}
}

function auditResourceLifecycle(source, filename) {
	const pairs = [
		['addEventListener(', 'removeEventListener('],
		['setTimeout(', 'clearTimeout('],
		['setInterval(', 'clearInterval('],
		['requestAnimationFrame(', 'cancelAnimationFrame('],
		['new ResizeObserver', '.disconnect('],
		['new MutationObserver', '.disconnect('],
		['new IntersectionObserver', '.disconnect(']
	];
	for (const [create, cleanup] of pairs) {
		if (source.includes(create) && !source.includes(cleanup)) {
			fail(`${filename} creates ${create} without ${cleanup}.`);
		}
	}
}

const zuiSourceFiles = await filesUnder(resolve(workspaceRoot, 'ui/zui/src'), ['.svelte', '.ts']);
for (const path of zuiSourceFiles) {
	const source = await readFile(path, 'utf8');
	auditResourceLifecycle(source, portable(relative(workspaceRoot, path)));
}
const componentFiles = await filesUnder(componentsRoot, ['.svelte']);
const metadata = [];
const internalComponents = [];
const transitionFiles = [];
const rawButtonFiles = [];
const rawControlFiles = [];
const formResetActionFiles = [];
for (const path of componentFiles) {
	const source = await readFile(path, 'utf8');
	const filename = portable(relative(workspaceRoot, path));
	auditTabOrder(source, filename);
	auditSvelte5(source, filename);
	if (/<button\b/u.test(source)) {
		rawButtonFiles.push(filename);
		const hasFocusContract =
			/styleInternalAction|_focusVisible|&:focus-within/u.test(source) ||
			(filename === 'ui/zui/src/components/overlay/ZTour.svelte' &&
				/aria-hidden=["']true["'][\s\S]*?tabindex=["']-1["']/u.test(source));
		if (!hasFocusContract) fail(`${filename} has a raw button without a focus contract.`);
		for (const match of source.matchAll(/<button\b[^>]*>/gu)) {
			if (!/(?:\btype\s*=|\{type\})/u.test(match[0])) {
				fail(`${filename} has a raw button without an explicit type.`);
			}
		}
		for (const match of source.matchAll(/<button\b[^>]*>\s*<[A-Z][A-Za-z0-9]*/gu)) {
			if (!/aria-(?:label|labelledby)\s*=/u.test(match[0])) {
				fail(`${filename} has an icon-only raw button without an accessible name.`);
			}
		}
	}
	const hasVisibleRawControl =
		/<(?:input|textarea)\b(?![^>]*(?:\shidden(?:\s|=|>)|\stype\s*=\s*["']hidden["']))[^>]*>/u.test(
			source
		);
	if (hasVisibleRawControl) rawControlFiles.push(filename);
	if (hasVisibleRawControl && !/styleInternalFocus|_focusVisible|&:focus-within/u.test(source)) {
		fail(`${filename} has a visible raw input without a focus contract.`);
	}
	if (/use:form(?:Element)?Reset\b/u.test(source)) formResetActionFiles.push(filename);
	if (/\blisten(?:For|To)FormReset\b/u.test(source)) {
		fail(`${filename} bypasses the node form reset action.`);
	}
	const id = source.match(
		/export const zuiMetadata\s*=\s*\{[\s\S]*?\bid:\s*['"]([^'"]+)['"]/u
	)?.[1];
	if (id) metadata.push({ id, source: filename });
	else internalComponents.push(filename);
	if (/transition(?:Property|Duration)|transition:/u.test(source)) {
		transitionFiles.push(filename);
		if (!/\bmotion\b/u.test(source))
			fail(`${filename} defines a transition without a motion contract.`);
	}
	for (const line of source.split(/\r?\n/u)) {
		if (/^\s*import\s+(?!type\b).*from\s+['"]@lucide\/svelte['"]/u.test(line)) {
			fail(`${filename} imports Lucide values from the package root instead of an icon subpath.`);
		}
	}
}

if (new Set(metadata.map(({ id }) => id)).size !== metadata.length) {
	fail('ZUI component metadata ids must be globally unique.');
}
const expectedInternal = [
	'ui/zui/src/components/input/ZMentionEditor.svelte',
	'ui/zui/src/components/input/ZTextareaAutosize.svelte'
];
if (JSON.stringify(internalComponents) !== JSON.stringify(expectedInternal)) {
	fail(`Unexpected internal component set: ${internalComponents.join(', ') || 'none'}.`);
}

const stableNativeIdSources = [
	'ui/zui/src/components/input/ZInput.svelte',
	'ui/zui/src/components/input/ZTextarea.svelte',
	'ui/zui/src/components/input/ZCheckbox.svelte',
	'ui/zui/src/components/input/ZSwitch.svelte',
	'ui/zui/src/components/input/ZSlider.svelte',
	'ui/zui/src/components/compound/radio-group/ZRadioGroupItem.svelte'
];
for (const filename of stableNativeIdSources) {
	const source = await readFile(resolve(workspaceRoot, filename), 'utf8');
	if (!/createZuiId/u.test(source) || !/id=\{[^}]*\?\?[^}]*generatedId\}/u.test(source)) {
		fail(`${filename} must preserve its generated native control id fallback.`);
	}
}
const dataTableSource = await readFile(
	resolve(workspaceRoot, 'ui/zui/src/components/data-display/ZDataTable.svelte'),
	'utf8'
);
if (
	!dataTableSource.includes('id={`${selectionName}-all`}') ||
	!dataTableSource.includes('id={`${selectionName}-row-${entry.index}`}')
) {
	fail('ZDataTable must preserve scoped ids for its native selection controls.');
}

const docsSvelteFiles = await filesUnder(docsSourceRoot, ['.svelte']);
const rawInteractive =
	/<(?:a|button|code|details|input|kbd|meter|progress|select|summary|table|textarea)\b/u;
const forbiddenGlyph = /[×‹›✓←→↑↓↕✕✖]/u;
for (const path of docsSvelteFiles) {
	const source = await readFile(path, 'utf8');
	const filename = portable(relative(workspaceRoot, path));
	auditTabOrder(source, filename);
	auditSvelte5(source, filename);
	auditResourceLifecycle(source, filename);
	if (rawInteractive.test(source))
		fail(`${filename} hand-builds an interactive element instead of dogfooding ZUI.`);
	if (forbiddenGlyph.test(source))
		fail(`${filename} contains a character UI icon instead of Lucide.`);
}
const appShellSource = await readFile(resolve(docsRoot, 'src/views/AppShell.svelte'), 'utf8');
const skipLinkContracts = [
	/<ZLink\b[^>]*class=\{classes\.skipLink\}[^>]*href=\{currentHref\}[^>]*onclick=\{skipToMain\}/u,
	/function skipToMain\([\s\S]*?event\.preventDefault\(\)[\s\S]*?\.focus\(/u,
	/<main\b[^>]*id=["']zui-main-content["'][^>]*tabindex=\{-1\}/u
];
if (!skipLinkContracts.every((contract) => contract.test(appShellSource))) {
	fail('Docs AppShell must preserve its hash-router-safe skip link contract.');
}
const appHeaderSource = await readFile(resolve(docsRoot, 'src/views/AppHeader.svelte'), 'utf8');
const appSidebarSource = await readFile(resolve(docsRoot, 'src/views/AppSidebar.svelte'), 'utf8');
const searchLiveContracts = [
	/aria-controls=["']zui-docs-component-nav["']/u.test(appHeaderSource),
	/aria-describedby=["']zui-docs-search-status["']/u.test(appHeaderSource),
	/aria-keyshortcuts=["']\/["']/u.test(appHeaderSource),
	/data-slot=["']search-shortcut["'][\s\S]*?<ZKbd>\/<\/ZKbd>/u.test(appHeaderSource),
	/event\.key === ["']Escape["'] && query/u.test(appHeaderSource),
	/event\.key !== ["']\/["'][\s\S]*?searchRef\?\.focus/u.test(appHeaderSource),
	/<ZVisuallyHidden[\s\S]*?aria-live=["']polite["'][\s\S]*?id=["']zui-docs-search-status["']/u.test(
		appSidebarSource
	),
	/<nav\b[^>]*id=["']zui-docs-component-nav["']/u.test(appSidebarSource),
	appSidebarSource.includes('${filtered.length} 个匹配组件')
];
if (!searchLiveContracts.every(Boolean)) {
	fail('Docs component search must preserve its navigation and live-status relationships.');
}
for (const path of componentFiles) {
	const source = await readFile(path, 'utf8');
	if (forbiddenGlyph.test(source)) {
		fail(
			`${portable(relative(workspaceRoot, path))} contains a character UI icon instead of Lucide.`
		);
	}
}

const svgCandidates = [
	...(await filesUnder(resolve(workspaceRoot, 'apps'), ['.svelte', '.svg'])),
	...(await filesUnder(resolve(workspaceRoot, 'packages'), ['.svelte', '.svg'])),
	...(await filesUnder(resolve(workspaceRoot, 'ui'), ['.svelte', '.svg']))
];
const inlineSvg = [];
const gradientFiles = [];
for (const path of svgCandidates) {
	const source = await readFile(path, 'utf8');
	if (/<(?:path|svg)\b/u.test(source)) {
		inlineSvg.push(portable(relative(workspaceRoot, path)));
	}
	if (/(?:linear|radial|conic)-gradient\(|<(?:linear|radial)Gradient\b/u.test(source)) {
		gradientFiles.push(portable(relative(workspaceRoot, path)));
	}
}
const allowedSvg = [
	'apps/desktop/static/zadmin-icon.svg',
	'apps/docs/static/favicon.svg',
	'ui/zui/src/components/data-display/ZProgress.svelte',
	'ui/zui/src/components/feedback/ZSpinner.svelte'
];
if (JSON.stringify(inlineSvg.sort()) !== JSON.stringify(allowedSvg.sort())) {
	fail(`Inline SVG boundary changed: ${inlineSvg.join(', ') || 'none'}.`);
}
const allowedGradients = ['apps/desktop/static/zadmin-icon.svg', 'apps/docs/static/favicon.svg'];
if (JSON.stringify(gradientFiles.sort()) !== JSON.stringify(allowedGradients.sort())) {
	fail(`Visual gradient boundary changed: ${gradientFiles.join(', ') || 'none'}.`);
}

const docFiles = await filesUnder(docsComponentsRoot, ['doc.ts']);
const demoIds = [];
for (const path of docFiles) {
	const source = await readFile(path, 'utf8');
	const ids = [...source.matchAll(/\bid:\s*['"]([^'"]+)['"]/gu)].map((match) => match[1]);
	if (ids.length < 2)
		fail(`${portable(relative(workspaceRoot, path))} defines fewer than two demos.`);
	demoIds.push(...ids);
}
if (new Set(demoIds).size !== demoIds.length)
	fail('Documentation demo ids must be globally unique.');

console.log(
	JSON.stringify({
		componentSvelteFiles: componentFiles.length,
		metadataIds: metadata.length,
		docPages: docFiles.length,
		demoIds: demoIds.length,
		transitionFiles: transitionFiles.length,
		rawButtonComponentFiles: rawButtonFiles.length,
		rawControlComponentFiles: rawControlFiles.length,
		formResetActionFiles: formResetActionFiles.length,
		inlineSvgFiles: inlineSvg.length,
		brandGradientFiles: gradientFiles.length,
		docsRawInteractiveElements: 0,
		positiveTabindexElements: 0,
		ariaHiddenTabStops: 0,
		implicitSubmitButtons: 0,
		unnamedIconButtons: 0,
		legacySvelteEvents: 0,
		legacyDynamicComponents: 0,
		typescriptEscapeHatches: 0,
		zuiSourceFiles: zuiSourceFiles.length,
		resourceLifecycleViolations: 0,
		dangerousDomSinks: 0,
		skipLinkContracts: 1,
		searchLiveContracts: 1,
		stableNativeIdComponents: stableNativeIdSources.length + 1
	})
);
