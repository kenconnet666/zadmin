import { gzipSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { build } from 'vite';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(packageRoot, 'src');
const portable = (path) => path.replaceAll('\\', '/');
const runtime = portable(resolve(sourceRoot, 'entrypoints/runtime.ts'));
const components = [
	{ id: 'accordion', name: 'ZAccordion', path: 'compound/accordion/ZAccordion.svelte' },
	{
		id: 'accordion-item',
		name: 'ZAccordionItem',
		path: 'compound/accordion/ZAccordionItem.svelte'
	},
	{
		id: 'accordion-trigger',
		name: 'ZAccordionTrigger',
		path: 'compound/accordion/ZAccordionTrigger.svelte'
	},
	{
		id: 'accordion-content',
		name: 'ZAccordionContent',
		path: 'compound/accordion/ZAccordionContent.svelte'
	},
	{
		id: 'radio-group',
		maxIncrementalGzip: 3.375 * 1024,
		name: 'ZRadioGroup',
		path: 'compound/radio-group/ZRadioGroup.svelte'
	},
	{
		id: 'radio-group-item',
		name: 'ZRadioGroupItem',
		path: 'compound/radio-group/ZRadioGroupItem.svelte'
	},
	{ id: 'tabs', name: 'ZTabs', path: 'compound/tabs/ZTabs.svelte' },
	{ id: 'tabs-list', name: 'ZTabsList', path: 'compound/tabs/ZTabsList.svelte' },
	{ id: 'tabs-trigger', name: 'ZTabsTrigger', path: 'compound/tabs/ZTabsTrigger.svelte' },
	{ id: 'tabs-panel', name: 'ZTabsPanel', path: 'compound/tabs/ZTabsPanel.svelte' },
	{ id: 'provider', name: 'ZProvider', path: 'gene/ZProvider.svelte' },
	{ id: 'box', name: 'ZBox', path: 'gene/ZBox.svelte' },
	{ id: 'link', name: 'ZLink', path: 'gene/ZLink.svelte' },
	{ id: 'separator', name: 'ZSeparator', path: 'gene/ZSeparator.svelte' },
	{ id: 'visually-hidden', name: 'ZVisuallyHidden', path: 'gene/ZVisuallyHidden.svelte' },
	{ id: 'kbd', name: 'ZKbd', path: 'gene/ZKbd.svelte' },
	{ id: 'stack', name: 'ZStack', path: 'layout/ZStack.svelte' },
	{ id: 'aspect-ratio', name: 'ZAspectRatio', path: 'layout/ZAspectRatio.svelte' },
	{ id: 'container', name: 'ZContainer', path: 'layout/ZContainer.svelte' },
	{ id: 'text', name: 'ZText', path: 'gene/ZText.svelte' },
	{ id: 'icon', maxIncrementalGzip: 4 * 1024, name: 'ZIcon', path: 'gene/ZIcon.svelte' },
	{ id: 'button', name: 'ZButton', path: 'gene/ZButton.svelte' },
	{
		id: 'toggle-button',
		maxIncrementalGzip: 3.625 * 1024,
		name: 'ZToggleButton',
		path: 'gene/ZToggleButton.svelte'
	},
	{ id: 'checkbox', name: 'ZCheckbox', path: 'input/ZCheckbox.svelte' },
	{ id: 'input', name: 'ZInput', path: 'input/ZInput.svelte' },
	{ id: 'slider', name: 'ZSlider', path: 'input/ZSlider.svelte' },
	{
		id: 'pagination',
		maxIncrementalGzip: 4.625 * 1024,
		name: 'ZPagination',
		path: 'navigation/ZPagination.svelte'
	},
	{
		id: 'switch',
		maxIncrementalGzip: 3.625 * 1024,
		name: 'ZSwitch',
		path: 'input/ZSwitch.svelte'
	},
	{
		id: 'field',
		maxIncrementalGzip: 3.375 * 1024,
		name: 'ZField',
		path: 'input/ZField.svelte'
	}
];

const FORBIDDEN_FOUNDATION_DEPENDENCIES = [
	'@floating-ui',
	'@internationalized/date',
	'runed',
	'shiki',
	'tabbable'
];

async function bundle(source, extraExternal = () => false) {
	const virtualId = '\0zadmin-zui-bundle-entry';
	const result = await build({
		configFile: false,
		logLevel: 'silent',
		plugins: [
			{
				name: 'zadmin-zui-bundle-entry',
				resolveId(id) {
					return id === 'virtual:zui-bundle' ? virtualId : null;
				},
				load(id) {
					return id === virtualId ? source : null;
				}
			},
			svelte({ configFile: false })
		],
		resolve: { conditions: ['svelte', 'browser'] },
		build: {
			minify: 'oxc',
			write: false,
			rolldownOptions: {
				external: (id) => id === 'svelte' || id.startsWith('svelte/') || extraExternal(id),
				input: 'virtual:zui-bundle',
				output: { format: 'es' }
			}
		}
	});
	const outputs = (Array.isArray(result) ? result.flatMap((entry) => entry.output) : result.output)
		.filter((entry) => entry.type === 'chunk')
		.map((entry) => entry.code)
		.join('\n');
	return { code: outputs, gzip: gzipSync(outputs, { level: 9 }).byteLength };
}

const runtimeBundle = await bundle(
	`import * as runtime from ${JSON.stringify(runtime)}; globalThis.__zuiRuntimeBudget = runtime;`
);
if (runtimeBundle.gzip > 15 * 1024) {
	throw new Error(`ZUI browser runtime gzip ${runtimeBundle.gzip} exceeds 15 KiB.`);
}

const report = { runtimeGzip: runtimeBundle.gzip, components: {} };
for (const dependency of FORBIDDEN_FOUNDATION_DEPENDENCIES) {
	if (runtimeBundle.code.includes(dependency)) {
		throw new Error(`ZUI root runtime unexpectedly contains ${dependency}.`);
	}
}
for (const component of components) {
	const componentEntry = portable(resolve(sourceRoot, `components/${component.path}`));
	const output = await bundle(
		`import * as runtime from ${JSON.stringify(runtime)}; import component from ${JSON.stringify(componentEntry)}; globalThis.__zuiRuntimeBudget = runtime; globalThis.__zuiComponentBudget = component;`
	);
	const incremental = Math.max(0, output.gzip - runtimeBundle.gzip);
	const maxIncrementalGzip = component.maxIncrementalGzip ?? 3.25 * 1024;
	if (incremental > maxIncrementalGzip) {
		throw new Error(
			`${component.name} incremental gzip ${incremental} exceeds ${maxIncrementalGzip} bytes.`
		);
	}
	if (/node:async_hooks|compiler\/preprocess|svelte\/compiler/u.test(output.code)) {
		throw new Error(`${component.name} browser bundle contains compiler/server code.`);
	}
	for (const dependency of FORBIDDEN_FOUNDATION_DEPENDENCIES) {
		if (output.code.includes(dependency)) {
			throw new Error(`${component.name} unexpectedly contains ${dependency}.`);
		}
	}
	report.components[component.id] = {
		gzip: output.gzip,
		incrementalGzip: incremental,
		maxIncrementalGzip
	};
}

const codeEntry = portable(resolve(sourceRoot, 'entrypoints/code.ts'));
const codeBundle = await bundle(
	`import * as runtime from ${JSON.stringify(runtime)}; import * as code from ${JSON.stringify(codeEntry)}; globalThis.__zuiRuntimeBudget = runtime; globalThis.__zuiCodeBudget = code;`,
	(id) => id === 'shiki' || id.startsWith('shiki/')
);
const codeIncremental = Math.max(0, codeBundle.gzip - runtimeBundle.gzip);
if (codeIncremental > 8 * 1024) {
	throw new Error(`ZCode shell incremental gzip ${codeIncremental} exceeds 8 KiB.`);
}
if (!codeBundle.code.includes('shiki')) {
	throw new Error('ZCode bundle lost its explicit optional Shiki boundary.');
}
report.components.code = { gzip: codeBundle.gzip, incrementalGzip: codeIncremental };

console.log(JSON.stringify(report));
