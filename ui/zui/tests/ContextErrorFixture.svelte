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
	let context: unknown;
	if (kind === 'accordion') context = useZAccordion();
	else if (kind === 'accordion-item') context = useZAccordionItem();
	else if (kind === 'combobox') context = useZCombobox();
	else if (kind === 'dialog') context = useZDialog();
	else if (kind === 'menu') context = useZMenu();
	else if (kind === 'multi-select') context = useZMultiSelect();
	else if (kind === 'popover') context = useZPopover();
	else if (kind === 'popconfirm') context = useZPopconfirm();
	else if (kind === 'radio-group') context = useZRadioGroup();
	else if (kind === 'select') context = useZSelect();
	else if (kind === 'tabs') context = useZTabs();
	else context = useZTooltip();
</script>

<span>{context ? 'ready' : 'missing'}</span>
