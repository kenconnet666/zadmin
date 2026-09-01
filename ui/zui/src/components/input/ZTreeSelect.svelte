<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import type { TreeNode } from '../../runtime/tree.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	export interface ZTreeSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly ariaLabel?: string;
		readonly defaultExpandedKeys?: readonly SelectionKey[];
		readonly defaultOpen?: boolean;
		readonly defaultValue?: SelectionKey;
		readonly disabled?: boolean;
		expandedKeys?: readonly SelectionKey[];
		readonly form?: string;
		readonly name?: string;
		readonly nodes: readonly TreeNode[];
		readonly onExpandedChange?: (keys: readonly SelectionKey[]) => void;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: SelectionKey | undefined) => void;
		open?: boolean;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		ref?: HTMLDivElement | null;
		value?: SelectionKey;
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'tree-select',
		importStatement: "import { ZTreeSelect } from '@zadmin/zui';",
		name: 'ZTreeSelect',
		bindings: [
			{ description: '当前选择key。', name: 'value', type: 'string | number | undefined' },
			{ description: '展开keys。', name: 'expandedKeys', type: 'readonly SelectionKey[]' },
			{ description: '打开状态。', name: 'open', type: 'boolean' }
		],
		dependencies: ['ZTree', 'TreeIndex', 'ZPopover', 'FormValue'],
		events: [
			{
				description: '选择后调用一次。',
				name: 'onValueChange',
				type: '(value: SelectionKey | undefined) => void'
			},
			{
				description: '展开变化。',
				name: 'onExpandedChange',
				type: '(keys: readonly SelectionKey[]) => void'
			},
			{ description: '打开变化。', name: 'onOpenChange', type: '(open: boolean) => void' }
		],
		keyboard: [
			{ description: '打开Tree popup。', key: 'Enter / Space' },
			{ description: '复用ZTree完整层级键盘。', key: 'Tree keys' },
			{ description: 'dismiss并恢复Trigger。', key: 'Escape' }
		],
		parts: [
			{ description: '触发按钮。', name: 'trigger' },
			{ description: 'Popup Tree。', name: 'tree' }
		],
		props: [
			{
				default: '必填',
				description: 'Tree nodes。',
				name: 'nodes',
				required: true,
				type: 'readonly TreeNode[]'
			},
			{
				bindable: true,
				default: 'undefined',
				description: '当前选择key。',
				name: 'value',
				type: 'string | number'
			},
			{
				bindable: true,
				default: '[]',
				description: '展开keys。',
				name: 'expandedKeys',
				type: 'readonly SelectionKey[]'
			},
			{
				default: 'Provider localePack.collection.selectNode',
				description: '空值提示；显式值优先于Provider locale pack。',
				name: 'placeholder',
				type: 'string'
			},
			{ default: 'false', description: '禁用。', name: 'disabled', type: 'boolean' },
			{ default: 'undefined', description: '表单字段名。', name: 'name', type: 'string' }
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTreeSelect.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '复用TreeIndex与ZTree层级键盘，并由Popover提供定位和表单选择的TreeSelect。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { formReset } from '../../runtime/form/form-control.svelte.js';
	import { serializeFormValue } from '../../runtime/form/form-value.js';
	import { createTreeIndex } from '../../runtime/tree.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZTree from '../compound/tree/ZTree.svelte';
	let {
		'aria-label': ariaLabelAttribute,
		ariaLabel,
		defaultExpandedKeys = [],
		defaultOpen = false,
		defaultValue,
		disabled = false,
		expandedKeys = $bindable(),
		form,
		name,
		nodes,
		onExpandedChange,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placeholder,
		placement = 'bottom-start',
		ref = $bindable(null),
		value = $bindable(),
		...rest
	}: ZTreeSelectProps = $props();
	const zui = useZui();
	const resolvedAriaLabel = $derived(ariaLabel ?? zui.localePack.collection.treeOptions);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.collection.selectNode);
	const tree = $derived(createTreeIndex(nodes));
	let proxy = $state<HTMLInputElement | null>(null);
	const valueState = new ControllableState<SelectionKey | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const expandedState = new ControllableState<readonly SelectionKey[]>({
		defaultValue: () => Object.freeze([...new Set(defaultExpandedKeys)]),
		onChange: () => onExpandedChange,
		read: () => expandedKeys,
		write: (next) => (expandedKeys = next)
	});
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const label = $derived(
		valueState.current === undefined
			? resolvedPlaceholder
			: (tree.nodes.get(valueState.current)?.label ?? String(valueState.current))
	);
	const serialized = $derived(
		valueState.current === undefined ? '' : (serializeFormValue(valueState.current) ?? '')
	);
	function resetFromForm(): void {
		valueState.reset();
		expandedState.reset();
	}
	function handleSelection(keys: readonly SelectionKey[]): void {
		const next = keys[0];
		if (next === undefined) return;
		valueState.setFromUser(next);
		openState.setFromUser(false);
	}
</script>

<div {...rest} bind:this={ref}>
	<ZPopover
		gutter={4}
		matchWidth
		modal={false}
		onOpenChange={(next) => openState.setFromUser(next)}
		open={openState.current}
		{placement}
	>
		<ZPopoverTrigger
			{disabled}
			popupRole="tree"
			variant="secondary"
			data-state={openState.current ? 'open' : 'closed'}>{label}</ZPopoverTrigger
		>
		<ZPopoverContent ariaLabelledBy={null} role="presentation">
			<ZTree
				appearance="bare"
				aria-label={ariaLabelAttribute ?? resolvedAriaLabel}
				{disabled}
				expandedKeys={expandedState.current}
				{nodes}
				onExpandedChange={(keys) => expandedState.setFromUser(keys)}
				onSelectionChange={handleSelection}
				selectedKeys={valueState.current === undefined ? [] : [valueState.current]}
			/>
		</ZPopoverContent>
	</ZPopover>
	<input
		bind:this={proxy}
		aria-hidden="true"
		tabindex={-1}
		type="hidden"
		disabled
		{form}
		use:formReset={resetFromForm}
	/>
	{#if name && !disabled}<input type="hidden" {form} {name} value={serialized} />{/if}
</div>
