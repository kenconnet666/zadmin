<script lang="ts">
	import {
		useZAccordion,
		useZAccordionItem
	} from '../src/components/compound/accordion/context.svelte.js';
	import { useZCombobox } from '../src/components/compound/combobox/context.svelte.js';
	import { useZDialog } from '../src/components/compound/dialog/context.svelte.js';
	import { useZMenu } from '../src/components/compound/menu/context.svelte.js';
	import { useZMultiSelect } from '../src/components/compound/multi-select/context.svelte.js';
	import { useZPopover } from '../src/components/compound/popover/context.svelte.js';
	import { useZPopconfirm } from '../src/components/compound/popconfirm/context.svelte.js';
	import { useZRadioGroup } from '../src/components/compound/radio-group/context.svelte.js';
	import { useZSelect } from '../src/components/compound/select/context.svelte.js';
	import { useZTabs } from '../src/components/compound/tabs/context.svelte.js';
	import { useZTooltip } from '../src/components/compound/tooltip/context.svelte.js';

	export type MissingContextKind =
		| 'accordion'
		| 'accordion-item'
		| 'combobox'
		| 'dialog'
		| 'menu'
		| 'multi-select'
		| 'popover'
		| 'popconfirm'
		| 'radio-group'
		| 'select'
		| 'tabs'
		| 'tooltip';

	let { kind }: { kind: MissingContextKind } = $props();
	if (kind === 'accordion') useZAccordion();
	else if (kind === 'accordion-item') useZAccordionItem();
	else if (kind === 'combobox') useZCombobox();
	else if (kind === 'dialog') useZDialog();
	else if (kind === 'menu') useZMenu();
	else if (kind === 'multi-select') useZMultiSelect();
	else if (kind === 'popover') useZPopover();
	else if (kind === 'popconfirm') useZPopconfirm();
	else if (kind === 'radio-group') useZRadioGroup();
	else if (kind === 'select') useZSelect();
	else if (kind === 'tabs') useZTabs();
	else useZTooltip();
</script>
