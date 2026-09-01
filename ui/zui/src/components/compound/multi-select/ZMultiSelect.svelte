<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { PopoverPlacement } from '../popover/ZPopover.svelte';
	export interface ZMultiSelectProps {
		readonly children?: Snippet;
		readonly controlId?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValues?: readonly SelectionKey[];
		readonly disabled?: boolean;
		readonly form?: string;
		readonly invalid?: boolean;
		readonly name?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (values: readonly SelectionKey[]) => void;
		open?: boolean;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		readonly required?: boolean;
		readonly valueLabel?: (value: SelectionKey) => string;
		values?: readonly SelectionKey[];
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'multi-select',
		importStatement:
			"import { ZMultiSelect, ZMultiSelectTrigger, ZMultiSelectContent, ZMultiSelectItem } from '@zadmin/zui';",
		name: 'ZMultiSelect',
		bindings: [
			{ description: '当前有序选择值。', name: 'values', type: 'readonly (string | number)[]' },
			{ description: '当前打开状态。', name: 'open', type: 'boolean' }
		],
		dependencies: ['Collection', 'multiple selection', 'ZPopover', 'FormValue'],
		events: [
			{
				description: '用户toggle后调用一次。',
				name: 'onValueChange',
				type: '(values: readonly SelectionKey[]) => void'
			},
			{ description: '打开状态变化后调用。', name: 'onOpenChange', type: '(open: boolean) => void' }
		],
		keyboard: [
			{ description: '打开多选listbox。', key: 'Enter / Space / Arrow keys' },
			{ description: 'toggle active option且保持打开。', key: 'Enter / Space' },
			{ description: 'dismiss并恢复Trigger。', key: 'Escape' }
		],
		parts: [],
		props: [
			{
				default: '继承Field或自动生成',
				description: '真实Trigger焦点owner的id。',
				name: 'controlId',
				type: 'string'
			},
			{
				bindable: true,
				default: '[]',
				description: '当前有序去重选择值。',
				name: 'values',
				type: 'readonly (string | number)[]'
			},
			{
				default: '[]',
				description: '非受控初始选择。',
				name: 'defaultValues',
				type: 'readonly (string | number)[]'
			},
			{
				bindable: true,
				default: 'false',
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
				default: "'Select options'",
				description: '空选择提示。',
				name: 'placeholder',
				type: 'string'
			},
			{
				default: "'bottom-start'",
				description: 'Content首选位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{ default: 'false', description: '禁用交互和提交。', name: 'disabled', type: 'boolean' },
			{
				default: '继承Field或false',
				description: '声明Trigger与业务值无效。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: '继承Field或false',
				description: '声明Trigger与业务值必填语义。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: '继承Field或undefined',
				description: '每个值重复使用的表单字段名。',
				name: 'name',
				type: 'string'
			},
			{ default: 'undefined', description: '关联外部form id。', name: 'form', type: 'string' },
			{
				default: 'String(value)',
				description: 'Item尚未挂载时格式化Trigger中的初始多选值标签。',
				name: 'valueLabel',
				type: '(value: SelectionKey) => string'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Trigger、Content与Items。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/multi-select/ZMultiSelect.svelte',
		states: [],
		status: 'experimental',
		summary: '拥有有序多选、标签摘要、listbox键盘、多值表单与reset合同的MultiSelect。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { CollectionStore } from '../../../runtime/collection/collection.svelte.js';
	import { RovingFocus } from '../../../runtime/collection/roving-focus.svelte.js';
	import { Typeahead } from '../../../runtime/collection/typeahead.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../../runtime/form/field-context.js';
	import FormResetSignal from '../../../runtime/form/FormResetSignal.svelte';
	import { serializeFormValue } from '../../../runtime/form/form-value.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopover from '../popover/ZPopover.svelte';
	import {
		MultiSelectEvent,
		provideZMultiSelect,
		type MultiSelectItemRecord,
		type ZMultiSelectContext
	} from './context.svelte.js';
	const unique = (source: readonly SelectionKey[]) => Object.freeze([...new Set(source)]);
	let {
		children,
		controlId: controlIdProp,
		defaultOpen = false,
		defaultValues = [],
		disabled: disabledProp = false,
		form,
		invalid,
		name: nameProp,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placeholder = 'Select options',
		placement = 'bottom-start',
		required: requiredProp = false,
		valueLabel = String,
		values = $bindable()
	}: ZMultiSelectProps = $props();
	const zui = useZui();
	const field = claimZFieldControlOwner().field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'multi-select'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-trigger`);
	const describedBy = $derived(field?.describedBy);
	const disabled = $derived(disabledProp || (field?.disabled ?? false));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedName = $derived(nameProp ?? field?.name);
	const required = $derived(requiredProp || (field?.required ?? false));
	const collection = new CollectionStore<MultiSelectItemRecord>();
	// Labels are registration metadata; collection updates provide the reactive invalidation.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const labelCache = new Map<SelectionKey, string>();
	let focusKey = $state<SelectionKey>();
	let proxy = $state<HTMLInputElement | null>(null);
	const valueState = new ControllableState<readonly SelectionKey[]>({
		defaultValue: () => unique(defaultValues),
		onChange: () => onValueChange,
		read: () => values,
		write: (next) => (values = next)
	});
	const resolvedValues = $derived(unique(valueState.current));
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const roving = new RovingFocus({
		collection,
		direction: () => zui.direction,
		loop: () => true,
		orientation: () => 'vertical',
		read: () => focusKey ?? resolvedValues[0],
		write: (key) => (focusKey = key)
	});
	const typeahead = new Typeahead<SelectionKey>({ locale: zui.locale });
	const context: ZMultiSelectContext = {
		collection,
		get controlId() {
			return controlId;
		},
		get describedBy() {
			return describedBy;
		},
		get disabled() {
			return disabled;
		},
		get invalid() {
			return resolvedInvalid;
		},
		isSelected(itemValue) {
			return resolvedValues.some((entry) => Object.is(entry, itemValue));
		},
		get labels() {
			return resolvedValues.map(
				(itemValue) =>
					collection.get(itemValue)?.textValue ?? labelCache.get(itemValue) ?? valueLabel(itemValue)
			);
		},
		get open() {
			return openState.current;
		},
		get placeholder() {
			return placeholder;
		},
		get required() {
			return required;
		},
		register(read) {
			return collection.register(() => {
				const item = read();
				if (item.textValue) labelCache.set(item.key, item.textValue);
				return item;
			});
		},
		roving,
		setOpen(next) {
			if (!disabled) openState.setFromUser(next);
		},
		toggle(itemValue, originalEvent, onSelect) {
			const event = new MultiSelectEvent(originalEvent, itemValue);
			onSelect?.(event);
			const item = collection.get(itemValue);
			if (event.defaultPrevented || disabled || !item || item.disabled) return;
			const current = resolvedValues;
			const next = context.isSelected(itemValue)
				? current.filter((entry) => !Object.is(entry, itemValue))
				: [...current, itemValue];
			focusKey = itemValue;
			valueState.setFromUser(Object.freeze(next));
		},
		typeahead,
		get values() {
			return resolvedValues;
		}
	};
	provideZMultiSelect(context);
	const serializedValues = $derived(
		resolvedValues.flatMap((item) => {
			const serialized = serializeFormValue(item);
			return serialized === undefined ? [] : [serialized];
		})
	);
</script>

<ZPopover
	gutter={4}
	matchWidth
	modal={false}
	onOpenChange={(next) => openState.setFromUser(next)}
	open={openState.current}
	{placement}
	triggerId={controlId}>{@render children?.()}</ZPopover
>
<input bind:this={proxy} aria-hidden="true" tabindex={-1} type="hidden" disabled {form} />
<FormResetSignal association={form} control={proxy} onReset={() => valueState.reset()} />
{#if resolvedName && !disabled}{#each serializedValues as serialized, index (`${serialized}-${index}`)}<input
			type="hidden"
			{form}
			name={resolvedName}
			value={serialized}
		/>{/each}{/if}
