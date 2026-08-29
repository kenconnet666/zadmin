<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { PopoverPlacement } from '../popover/ZPopover.svelte';
	export interface ZComboboxProps {
		readonly children?: Snippet;
		readonly defaultInputValue?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: SelectionKey;
		readonly disabled?: boolean;
		readonly filter?: (textValue: string, query: string) => boolean;
		readonly form?: string;
		inputValue?: string;
		readonly name?: string;
		readonly onInputValueChange?: (value: string) => void;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: SelectionKey | undefined) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
		value?: SelectionKey;
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'combobox',
		importStatement:
			"import { ZCombobox, ZComboboxInput, ZComboboxContent, ZComboboxItem } from '@zadmin/zui';",
		name: 'ZCombobox',
		bindings: [
			{ description: '当前选择值。', name: 'value', type: 'string | number | undefined' },
			{ description: '当前输入文本。', name: 'inputValue', type: 'string' },
			{ description: '当前打开状态。', name: 'open', type: 'boolean' }
		],
		dependencies: ['Collection', 'active-descendant', 'filter', 'ZPopover', 'FormValue'],
		events: [
			{
				description: '选择后调用一次。',
				name: 'onValueChange',
				type: '(value: SelectionKey | undefined) => void'
			},
			{
				description: '输入文本变化后调用。',
				name: 'onInputValueChange',
				type: '(value: string) => void'
			},
			{ description: '打开状态变化后调用。', name: 'onOpenChange', type: '(open: boolean) => void' }
		],
		keyboard: [
			{
				description: '移动active option而不移动DOM焦点。',
				key: 'ArrowUp / ArrowDown / Home / End'
			},
			{ description: '选择active option。', key: 'Enter' },
			{ description: 'dismiss并保留输入焦点。', key: 'Escape' }
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
				description: '非受控初始选择。',
				name: 'defaultValue',
				type: 'string | number'
			},
			{
				bindable: true,
				default: "''",
				description: '当前输入文本。',
				name: 'inputValue',
				type: 'string'
			},
			{
				default: 'value文本',
				description: '非受控初始输入。',
				name: 'defaultInputValue',
				type: 'string'
			},
			{
				bindable: true,
				default: 'false',
				description: '当前打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'includes',
				description: '本地过滤函数。',
				name: 'filter',
				type: '(textValue: string, query: string) => boolean'
			},
			{ default: 'false', description: '禁用全部交互与提交。', name: 'disabled', type: 'boolean' },
			{ default: 'undefined', description: '隐藏表单字段名。', name: 'name', type: 'string' }
		],
		since: '0.4.0',
		snippets: [{ description: 'Input、Content与Item。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/combobox/ZCombobox.svelte',
		states: [],
		status: 'experimental',
		summary: '保持输入DOM焦点，以aria-activedescendant驱动过滤listbox的Combobox根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { CollectionStore } from '../../../runtime/collection/collection.svelte.js';
	import { moveIndex, navigationIntent } from '../../../runtime/collection/list-navigation.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { listenForFormReset } from '../../../runtime/form/form-control.svelte.js';
	import { serializeFormValue } from '../../../runtime/form/form-value.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopover from '../popover/ZPopover.svelte';
	import {
		ComboboxSelectEvent,
		provideZCombobox,
		type ComboboxItemRecord,
		type ZComboboxContext
	} from './context.svelte.js';
	let {
		children,
		defaultInputValue,
		defaultOpen = false,
		defaultValue,
		disabled = false,
		filter,
		form,
		inputValue = $bindable(),
		name,
		onInputValueChange,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placement = 'bottom-start',
		value = $bindable()
	}: ZComboboxProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'combobox'));
	const collection = new CollectionStore<ComboboxItemRecord>();
	const ids = new Map<SelectionKey, string>();
	let nextId = 0;
	let active = $state<SelectionKey>();
	let hidden = $state<HTMLInputElement | null>(null);
	const valueState = new ControllableState<SelectionKey | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const inputState = new ControllableState<string>({
		defaultValue: () =>
			defaultInputValue ?? (defaultValue === undefined ? '' : String(defaultValue)),
		onChange: () => onInputValueChange,
		read: () => inputValue,
		write: (next) => (inputValue = next)
	});
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const defaultFilter = (textValue: string, query: string) =>
		textValue.toLocaleLowerCase(zui.locale).includes(query.toLocaleLowerCase(zui.locale));
	const context: ZComboboxContext = {
		get activeId() {
			const key = context.activeKey;
			return key === undefined ? undefined : context.idFor(key);
		},
		get activeKey() {
			const enabled = collection.enabledItems;
			const candidate = active ?? valueState.current;
			return enabled.some(({ key }) => Object.is(key, candidate)) ? candidate : enabled[0]?.key;
		},
		choose(itemValue, originalEvent, onSelect) {
			const event = new ComboboxSelectEvent(originalEvent, itemValue);
			onSelect?.(event);
			const item = collection.get(itemValue);
			if (!event.defaultPrevented && !disabled && item && !item.disabled) {
				active = itemValue;
				valueState.setFromUser(itemValue);
				inputState.setFromUser(item.textValue ?? String(itemValue));
				openState.setFromUser(false);
			}
		},
		collection,
		get disabled() {
			return disabled;
		},
		idFor(itemValue) {
			let id = ids.get(itemValue);
			if (!id) {
				nextId += 1;
				id = `${idBase}-option-${nextId}`;
				ids.set(itemValue, id);
			}
			return id;
		},
		get inputValue() {
			return inputState.current;
		},
		matches(textValue) {
			const query = inputState.current.trim();
			return query.length === 0 || (filter ?? defaultFilter)(textValue, query);
		},
		move(key) {
			const intent = navigationIntent(key, 'vertical', zui.direction);
			if (!intent) return undefined;
			const items = collection.enabledItems;
			const current = items.findIndex(({ key: itemKey }) => Object.is(itemKey, context.activeKey));
			const target = items[moveIndex(items.length, current, intent, true)];
			if (target) active = target.key;
			return target?.key;
		},
		get open() {
			return openState.current;
		},
		register(read) {
			const stop = collection.register(read);
			const item = read();
			if (!item.disabled && active === undefined) active = item.key;
			return stop;
		},
		setActive(itemValue) {
			if (collection.get(itemValue)?.disabled !== true) active = itemValue;
		},
		setInputValue(next) {
			inputState.setFromUser(next);
			active = undefined;
			if (!disabled) openState.setFromUser(true);
		},
		setOpen(next) {
			if (!disabled) openState.setFromUser(next);
		},
		get value() {
			return valueState.current;
		}
	};
	provideZCombobox(context);
	$effect(() => {
		if (!hidden) return;
		return listenForFormReset(hidden, () => {
			valueState.reset();
			inputState.reset();
		});
	});
	const serializedValue = $derived(
		valueState.current === undefined ? '' : (serializeFormValue(valueState.current) ?? '')
	);
</script>

<ZPopover
	gutter={4}
	matchWidth
	modal={false}
	onOpenChange={(next) => openState.setFromUser(next)}
	open={openState.current}
	{placement}>{@render children?.()}</ZPopover
>
{#if name}<input
		bind:this={hidden}
		aria-hidden="true"
		tabindex={-1}
		type="hidden"
		{disabled}
		{form}
		{name}
		value={serializedValue}
	/>{/if}
