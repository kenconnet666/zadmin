<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { PopoverPlacement } from '../popover/ZPopover.svelte';

	export interface ZSelectProps {
		readonly children?: Snippet;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: SelectionKey;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly name?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: SelectionKey | undefined) => void;
		open?: boolean;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		readonly required?: boolean;
		value?: SelectionKey;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'select',
		importStatement:
			"import { ZSelect, ZSelectTrigger, ZSelectContent, ZSelectItem } from '@zadmin/zui';",
		name: 'ZSelect',
		bindings: [
			{ description: '当前选择值。', name: 'value', type: 'string | number | undefined' },
			{ description: '当前打开状态。', name: 'open', type: 'boolean' }
		],
		dependencies: ['Collection', 'RovingFocus', 'Typeahead', 'ZPopover', 'FormValue'],
		events: [
			{
				description: '用户选择后调用一次。',
				name: 'onValueChange',
				type: '(value: SelectionKey | undefined) => void'
			},
			{
				description: '打开或dismiss后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [
			{ description: '打开listbox。', key: 'Enter / Space / ArrowUp / ArrowDown' },
			{ description: '在option间移动。', key: 'ArrowUp / ArrowDown / Home / End / Typeahead' },
			{ description: '选择option并关闭。', key: 'Enter / Space' },
			{ description: 'dismiss并恢复Trigger焦点。', key: 'Escape' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前选择值。',
				name: 'value',
				type: 'string | number'
			},
			{
				default: 'undefined',
				description: '非受控初始值。',
				name: 'defaultValue',
				type: 'string | number'
			},
			{
				bindable: true,
				default: 'undefined',
				description: '当前打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控初始打开状态。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				default: "'Select an option'",
				description: '无值时的Trigger文本。',
				name: 'placeholder',
				type: 'string'
			},
			{
				default: "'bottom-start'",
				description: 'Content首选位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				default: 'false',
				description: '禁用Trigger、选择与表单提交。',
				name: 'disabled',
				type: 'boolean'
			},
			{ default: 'false', description: '声明Trigger必填语义。', name: 'required', type: 'boolean' },
			{ default: 'undefined', description: '隐藏表单字段名称。', name: 'name', type: 'string' },
			{ default: 'undefined', description: '关联外部form id。', name: 'form', type: 'string' }
		],
		since: '0.4.0',
		snippets: [{ description: 'Trigger、Content与Item。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/select/ZSelect.svelte',
		states: [],
		status: 'experimental',
		summary: '拥有单选值、listbox集合键盘、Popover定位与表单reset合同的Select根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { CollectionStore } from '../../../runtime/collection/collection.svelte.js';
	import { RovingFocus } from '../../../runtime/collection/roving-focus.svelte.js';
	import { Typeahead } from '../../../runtime/collection/typeahead.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { listenForFormReset } from '../../../runtime/form/form-control.svelte.js';
	import { serializeFormValue } from '../../../runtime/form/form-value.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopover from '../popover/ZPopover.svelte';
	import {
		provideZSelect,
		SelectEvent,
		type SelectItemRecord,
		type ZSelectContext
	} from './context.svelte.js';

	let {
		children,
		defaultOpen = false,
		defaultValue,
		disabled = false,
		form,
		name,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placeholder = 'Select an option',
		placement = 'bottom-start',
		required = false,
		value = $bindable()
	}: ZSelectProps = $props();
	const zui = useZui();
	const valueState = new ControllableState<SelectionKey | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const collection = new CollectionStore<SelectItemRecord>();
	const labels = new Map<SelectionKey, string>();
	let focusKey = $state<SelectionKey>();
	let hidden = $state<HTMLInputElement | null>(null);
	const roving = new RovingFocus({
		collection,
		direction: () => zui.direction,
		loop: () => true,
		orientation: () => 'vertical',
		read: () => focusKey ?? valueState.current,
		write: (key) => (focusKey = key)
	});
	const typeahead = new Typeahead<SelectionKey>({ locale: zui.locale });
	const context: ZSelectContext = {
		choose(itemValue, originalEvent, onSelect) {
			const event = new SelectEvent(originalEvent, itemValue);
			onSelect?.(event);
			const item = collection.get(itemValue);
			if (!event.defaultPrevented && !disabled && item && !item.disabled) {
				if (item.textValue) labels.set(itemValue, item.textValue);
				focusKey = itemValue;
				valueState.setFromUser(itemValue);
				openState.setFromUser(false);
			}
			return event;
		},
		collection,
		get disabled() {
			return disabled;
		},
		get open() {
			return openState.current;
		},
		get placeholder() {
			return placeholder;
		},
		register(read) {
			return collection.register(() => {
				const item = read();
				if (item.textValue) labels.set(item.key, item.textValue);
				return item;
			});
		},
		get required() {
			return required;
		},
		roving,
		get selectedText() {
			const current = valueState.current;
			if (current === undefined) return placeholder;
			return collection.get(current)?.textValue ?? labels.get(current) ?? String(current);
		},
		setOpen(next) {
			if (!disabled) openState.setFromUser(next);
		},
		typeahead,
		get value() {
			return valueState.current;
		}
	};
	provideZSelect(context);
	$effect(() => {
		if (!hidden) return;
		return listenForFormReset(hidden, () => valueState.reset());
	});
	const serializedValue = $derived(serializeFormValue(valueState.current) ?? '');
</script>

<ZPopover
	gutter={4}
	matchWidth
	modal={false}
	onOpenChange={(next) => openState.setFromUser(next)}
	open={openState.current}
	{placement}
>
	{@render children?.()}
</ZPopover>
{#if name}
	<input
		bind:this={hidden}
		aria-hidden="true"
		tabindex={-1}
		type="hidden"
		{disabled}
		{form}
		{name}
		value={serializedValue}
	/>
{/if}
