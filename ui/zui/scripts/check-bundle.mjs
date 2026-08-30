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
	{ id: 'combobox', name: 'ZCombobox', path: 'compound/combobox/ZCombobox.svelte' },
	{ id: 'combobox-input', name: 'ZComboboxInput', path: 'compound/combobox/ZComboboxInput.svelte' },
	{
		id: 'combobox-content',
		name: 'ZComboboxContent',
		path: 'compound/combobox/ZComboboxContent.svelte'
	},
	{ id: 'combobox-item', name: 'ZComboboxItem', path: 'compound/combobox/ZComboboxItem.svelte' },
	{ id: 'context-menu', name: 'ZContextMenu', path: 'compound/context-menu/ZContextMenu.svelte' },
	{
		id: 'context-menu-trigger',
		name: 'ZContextMenuTrigger',
		path: 'compound/context-menu/ZContextMenuTrigger.svelte'
	},
	{
		id: 'context-menu-content',
		name: 'ZContextMenuContent',
		path: 'compound/context-menu/ZContextMenuContent.svelte'
	},
	{ id: 'alert-dialog', name: 'ZAlertDialog', path: 'compound/alert-dialog/ZAlertDialog.svelte' },
	{
		id: 'alert-dialog-trigger',
		name: 'ZAlertDialogTrigger',
		path: 'compound/alert-dialog/ZAlertDialogTrigger.svelte'
	},
	{
		id: 'alert-dialog-overlay',
		name: 'ZAlertDialogOverlay',
		path: 'compound/alert-dialog/ZAlertDialogOverlay.svelte'
	},
	{
		id: 'alert-dialog-content',
		name: 'ZAlertDialogContent',
		path: 'compound/alert-dialog/ZAlertDialogContent.svelte'
	},
	{
		id: 'alert-dialog-title',
		name: 'ZAlertDialogTitle',
		path: 'compound/alert-dialog/ZAlertDialogTitle.svelte'
	},
	{
		id: 'alert-dialog-description',
		name: 'ZAlertDialogDescription',
		path: 'compound/alert-dialog/ZAlertDialogDescription.svelte'
	},
	{
		id: 'alert-dialog-cancel',
		name: 'ZAlertDialogCancel',
		path: 'compound/alert-dialog/ZAlertDialogCancel.svelte'
	},
	{
		id: 'alert-dialog-action',
		name: 'ZAlertDialogAction',
		path: 'compound/alert-dialog/ZAlertDialogAction.svelte'
	},
	{ id: 'dialog', name: 'ZDialog', path: 'compound/dialog/ZDialog.svelte' },
	{ id: 'dialog-trigger', name: 'ZDialogTrigger', path: 'compound/dialog/ZDialogTrigger.svelte' },
	{ id: 'dialog-overlay', name: 'ZDialogOverlay', path: 'compound/dialog/ZDialogOverlay.svelte' },
	{ id: 'dialog-content', name: 'ZDialogContent', path: 'compound/dialog/ZDialogContent.svelte' },
	{ id: 'dialog-title', name: 'ZDialogTitle', path: 'compound/dialog/ZDialogTitle.svelte' },
	{
		id: 'dialog-description',
		name: 'ZDialogDescription',
		path: 'compound/dialog/ZDialogDescription.svelte'
	},
	{ id: 'dialog-close', name: 'ZDialogClose', path: 'compound/dialog/ZDialogClose.svelte' },
	{
		id: 'dropdown-menu',
		name: 'ZDropdownMenu',
		path: 'compound/dropdown-menu/ZDropdownMenu.svelte'
	},
	{
		id: 'dropdown-menu-trigger',
		name: 'ZDropdownMenuTrigger',
		path: 'compound/dropdown-menu/ZDropdownMenuTrigger.svelte'
	},
	{
		id: 'dropdown-menu-content',
		name: 'ZDropdownMenuContent',
		path: 'compound/dropdown-menu/ZDropdownMenuContent.svelte'
	},
	{ id: 'drawer', name: 'ZDrawer', path: 'compound/drawer/ZDrawer.svelte' },
	{ id: 'drawer-trigger', name: 'ZDrawerTrigger', path: 'compound/drawer/ZDrawerTrigger.svelte' },
	{ id: 'drawer-overlay', name: 'ZDrawerOverlay', path: 'compound/drawer/ZDrawerOverlay.svelte' },
	{ id: 'drawer-content', name: 'ZDrawerContent', path: 'compound/drawer/ZDrawerContent.svelte' },
	{ id: 'drawer-title', name: 'ZDrawerTitle', path: 'compound/drawer/ZDrawerTitle.svelte' },
	{
		id: 'drawer-description',
		name: 'ZDrawerDescription',
		path: 'compound/drawer/ZDrawerDescription.svelte'
	},
	{ id: 'drawer-close', name: 'ZDrawerClose', path: 'compound/drawer/ZDrawerClose.svelte' },
	{ id: 'menu', name: 'ZMenu', path: 'compound/menu/ZMenu.svelte' },
	{ id: 'menu-item', name: 'ZMenuItem', path: 'compound/menu/ZMenuItem.svelte' },
	{ id: 'menu-group', name: 'ZMenuGroup', path: 'compound/menu/ZMenuGroup.svelte' },
	{ id: 'menu-label', name: 'ZMenuLabel', path: 'compound/menu/ZMenuLabel.svelte' },
	{ id: 'menu-separator', name: 'ZMenuSeparator', path: 'compound/menu/ZMenuSeparator.svelte' },
	{ id: 'multi-select', name: 'ZMultiSelect', path: 'compound/multi-select/ZMultiSelect.svelte' },
	{
		id: 'multi-select-trigger',
		name: 'ZMultiSelectTrigger',
		path: 'compound/multi-select/ZMultiSelectTrigger.svelte'
	},
	{
		id: 'multi-select-content',
		name: 'ZMultiSelectContent',
		path: 'compound/multi-select/ZMultiSelectContent.svelte'
	},
	{
		id: 'multi-select-item',
		name: 'ZMultiSelectItem',
		path: 'compound/multi-select/ZMultiSelectItem.svelte'
	},
	{ id: 'popconfirm', name: 'ZPopconfirm', path: 'compound/popconfirm/ZPopconfirm.svelte' },
	{
		id: 'popconfirm-trigger',
		name: 'ZPopconfirmTrigger',
		path: 'compound/popconfirm/ZPopconfirmTrigger.svelte'
	},
	{
		id: 'popconfirm-content',
		name: 'ZPopconfirmContent',
		path: 'compound/popconfirm/ZPopconfirmContent.svelte'
	},
	{
		id: 'popconfirm-title',
		name: 'ZPopconfirmTitle',
		path: 'compound/popconfirm/ZPopconfirmTitle.svelte'
	},
	{
		id: 'popconfirm-description',
		name: 'ZPopconfirmDescription',
		path: 'compound/popconfirm/ZPopconfirmDescription.svelte'
	},
	{
		id: 'popconfirm-cancel',
		name: 'ZPopconfirmCancel',
		path: 'compound/popconfirm/ZPopconfirmCancel.svelte'
	},
	{
		id: 'popconfirm-action',
		name: 'ZPopconfirmAction',
		path: 'compound/popconfirm/ZPopconfirmAction.svelte'
	},
	{ id: 'popover', name: 'ZPopover', path: 'compound/popover/ZPopover.svelte' },
	{
		id: 'popover-trigger',
		name: 'ZPopoverTrigger',
		path: 'compound/popover/ZPopoverTrigger.svelte'
	},
	{
		id: 'popover-content',
		name: 'ZPopoverContent',
		path: 'compound/popover/ZPopoverContent.svelte'
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
	{ id: 'select', name: 'ZSelect', path: 'compound/select/ZSelect.svelte' },
	{ id: 'select-trigger', name: 'ZSelectTrigger', path: 'compound/select/ZSelectTrigger.svelte' },
	{ id: 'select-content', name: 'ZSelectContent', path: 'compound/select/ZSelectContent.svelte' },
	{ id: 'select-item', name: 'ZSelectItem', path: 'compound/select/ZSelectItem.svelte' },
	{ id: 'tabs', name: 'ZTabs', path: 'compound/tabs/ZTabs.svelte' },
	{ id: 'tabs-list', name: 'ZTabsList', path: 'compound/tabs/ZTabsList.svelte' },
	{ id: 'tabs-trigger', name: 'ZTabsTrigger', path: 'compound/tabs/ZTabsTrigger.svelte' },
	{ id: 'tabs-panel', name: 'ZTabsPanel', path: 'compound/tabs/ZTabsPanel.svelte' },
	{ id: 'tree', name: 'ZTree', path: 'compound/tree/ZTree.svelte' },
	{ id: 'tooltip', name: 'ZTooltip', path: 'compound/tooltip/ZTooltip.svelte' },
	{
		id: 'tooltip-trigger',
		name: 'ZTooltipTrigger',
		path: 'compound/tooltip/ZTooltipTrigger.svelte'
	},
	{
		id: 'tooltip-content',
		name: 'ZTooltipContent',
		path: 'compound/tooltip/ZTooltipContent.svelte'
	},
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
	{ id: 'cascader', name: 'ZCascader', path: 'input/ZCascader.svelte' },
	{ id: 'input', name: 'ZInput', path: 'input/ZInput.svelte' },
	{ id: 'input-group', name: 'ZInputGroup', path: 'input/ZInputGroup.svelte' },
	{ id: 'mention', name: 'ZMention', path: 'input/ZMention.svelte' },
	{ id: 'number-field', name: 'ZNumberField', path: 'input/ZNumberField.svelte' },
	{ id: 'pin-input', name: 'ZPinInput', path: 'input/ZPinInput.svelte' },
	{ id: 'segmented', name: 'ZSegmented', path: 'input/ZSegmented.svelte' },
	{
		id: 'slider',
		maxIncrementalGzip: 3.375 * 1024,
		name: 'ZSlider',
		path: 'input/ZSlider.svelte'
	},
	{
		id: 'pagination',
		maxIncrementalGzip: 4.625 * 1024,
		name: 'ZPagination',
		path: 'navigation/ZPagination.svelte'
	},
	{ id: 'command', name: 'ZCommand', path: 'navigation/ZCommand.svelte' },
	{
		id: 'command-palette',
		name: 'ZCommandPalette',
		path: 'navigation/ZCommandPalette.svelte'
	},
	{
		id: 'switch',
		maxIncrementalGzip: 3.625 * 1024,
		name: 'ZSwitch',
		path: 'input/ZSwitch.svelte'
	},
	{ id: 'tags-input', name: 'ZTagsInput', path: 'input/ZTagsInput.svelte' },
	{ id: 'textarea', name: 'ZTextarea', path: 'input/ZTextarea.svelte' },
	{ id: 'tree-select', name: 'ZTreeSelect', path: 'input/ZTreeSelect.svelte' },
	{ id: 'transfer', name: 'ZTransfer', path: 'input/ZTransfer.svelte' },
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

const layerEntry = portable(resolve(sourceRoot, 'entrypoints/layer.ts'));
const layerBundle = await bundle(
	`import * as layer from ${JSON.stringify(layerEntry)}; globalThis.__zuiLayerBudget = layer;`
);
if (layerBundle.gzip > 30 * 1024) {
	throw new Error(`ZUI layer runtime gzip ${layerBundle.gzip} exceeds 30 KiB.`);
}
report.layerGzip = layerBundle.gzip;
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
