<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { ZCollectionOption } from '../choice-option.js';
	import type { PopoverPlacement } from '../popover/ZPopover.svelte';

	export type ZMultiSelectOption = ZCollectionOption;

	export interface ZMultiSelectProps {
		readonly children?: Snippet;
		readonly clearable?: boolean;
		readonly controlId?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: readonly SelectionKey[];
		/** @deprecated Use `defaultValue`. */
		readonly defaultValues?: readonly SelectionKey[];
		readonly disabled?: boolean;
		readonly emptyText?: string;
		readonly form?: string;
		readonly invalid?: boolean;
		readonly loading?: boolean;
		readonly loadingText?: string;
		readonly loop?: boolean;
		readonly maxTagCount?: number;
		readonly name?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: readonly SelectionKey[]) => void;
		/** @deprecated Use `onValueChange`. */
		readonly onValuesChange?: (values: readonly SelectionKey[]) => void;
		open?: boolean;
		readonly options?: readonly ZMultiSelectOption[];
		readonly overflowLabel?: (hiddenCount: number) => string;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		readonly readonly?: boolean;
		readonly required?: boolean;
		value?: readonly SelectionKey[];
		readonly valueLabel?: (value: SelectionKey) => string;
		/** @deprecated Use `value`. */
		values?: readonly SelectionKey[];
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'multi-select',
		importStatement:
			"import { ZMultiSelect, ZMultiSelectTrigger, ZMultiSelectContent, ZMultiSelectItem } from '@zadmin/zui';",
		name: 'ZMultiSelect',
		bindings: [
			{ description: '当前有序多选key。', name: 'value', type: 'readonly SelectionKey[]' },
			{
				description: 'deprecated value兼容绑定别名；不得与value同时传入。',
				name: 'values',
				type: 'readonly SelectionKey[]'
			},
			{ description: '当前打开状态。', name: 'open', type: 'boolean' }
		],
		dependencies: [
			'LogicalCollection',
			'SelectionModel',
			'CollectionNavigation',
			'ActiveDescendant',
			'ZPopover',
			'FormValueBridge'
		],
		events: [
			{
				description: '用户toggle、移除或清空后调用一次；options变化和reset不会伪造回调。',
				name: 'onValueChange',
				type: '(value: readonly SelectionKey[]) => void'
			},
			{
				description: 'deprecated回调别名；不得与onValueChange同时传入。',
				name: 'onValuesChange',
				type: '(values: readonly SelectionKey[]) => void'
			},
			{
				description: '打开或dismiss后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [
			{ description: '打开并初始化active key。', key: 'Enter / Space / ArrowUp / ArrowDown' },
			{ description: '在完整逻辑view中移动active key。', key: 'ArrowUp / ArrowDown / Home / End' },
			{ description: '按Provider locale文本前缀移动active key。', key: 'Printable characters' },
			{ description: 'toggle active option且保持打开。', key: 'Enter / Space' },
			{ description: 'Trigger聚焦时移除最后一个tag。', key: 'Backspace / Delete' },
			{ description: 'clearable时清空全部选择。', key: 'Control/Command + Backspace' },
			{ description: 'dismiss并恢复Trigger焦点。', key: 'Escape' }
		],
		parts: [],
		props: [
			{
				default: 'undefined（compound模式）',
				description: '权威数据源；提供后Content从完整typed-key集合渲染、分组并支持异步替换。',
				name: 'options',
				type: 'readonly ZMultiSelectOption[]'
			},
			{
				bindable: true,
				default: '[]',
				description: '推荐主值API；有序去重并保留暂时不在options中的异步孤儿key。',
				name: 'value',
				type: 'readonly SelectionKey[]'
			},
			{
				default: '[]',
				description: '非受控初值与form reset目标。',
				name: 'defaultValue',
				type: 'readonly SelectionKey[]'
			},
			{
				bindable: true,
				default: 'undefined',
				description: 'deprecated values兼容别名；不得与value同时传入。',
				name: 'values',
				type: 'readonly SelectionKey[]'
			},
			{
				default: 'undefined',
				description: 'deprecated defaultValues兼容别名；不得与defaultValue同时传入。',
				name: 'defaultValues',
				type: 'readonly SelectionKey[]'
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
				default: 'Provider localePack.collection.selectOptions',
				description: '空选择Trigger文本。',
				name: 'placeholder',
				type: 'string'
			},
			{
				default: 'Provider localePack.collection.empty',
				description: '权威options为空且未加载时的状态文本。',
				name: 'emptyText',
				type: 'string'
			},
			{
				default: 'Provider localePack.collection.loading',
				description: '异步加载状态文本。',
				name: 'loadingText',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '最多显示的标签数；非负整数，省略时显示全部。',
				name: 'maxTagCount',
				type: 'number'
			},
			{
				default: '按Provider locale格式化为 +N',
				description: '自定义被折叠标签的摘要文本。',
				name: 'overflowLabel',
				type: '(hiddenCount: number) => string'
			},
			{
				default: 'false',
				description: '显示清空入口，并允许Control/Command+Backspace清空全部值。',
				name: 'clearable',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '保留已有options并显示异步加载状态。',
				name: 'loading',
				type: 'boolean'
			},
			{ default: 'true', description: '方向键是否首尾循环。', name: 'loop', type: 'boolean' },
			{
				default: 'false',
				description: '禁用Trigger、选择与表单提交。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '保持Trigger可聚焦和值可读，但阻止打开、toggle、移除与清空。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: "'bottom-start'",
				description: 'Content首选位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				default: 'String(value)',
				description: '异步孤儿key或compound Item未挂载时的标签回退。',
				name: 'valueLabel',
				type: '(value: SelectionKey) => string'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Trigger与Content组合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/multi-select/ZMultiSelect.svelte',
		states: [],
		status: 'experimental',
		summary:
			'以LogicalCollection为唯一顺序事实、以SelectionModel拥有多选并支持标签摘要、异步孤儿、多值FormData与可选虚拟化的MultiSelect。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { ActiveDescendant } from '../../../runtime/collection/active-descendant.svelte.js';
	import { CollectionNavigation } from '../../../runtime/collection/collection-navigation.svelte.js';
	import { CompoundLogicalCollectionRegistry } from '../../../runtime/collection/compound-logical-collection.svelte.js';
	import { LogicalCollection } from '../../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import { SelectionModel } from '../../../runtime/collection/selection-model.js';
	import type { Selection } from '../../../runtime/collection/selection.js';
	import { Typeahead } from '../../../runtime/collection/typeahead.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../../runtime/form/field-context.js';
	import FormValueBridge from '../../../runtime/form/FormValueBridge.svelte';
	import { assertContiguousOptionGroups } from '../choice-option.js';
	import { createChoiceVirtualMountBridge } from '../choice-virtualization.js';
	import ZPopover from '../popover/ZPopover.svelte';
	import {
		MultiSelectEvent,
		provideZMultiSelect,
		type MultiSelectItemRecord,
		type MultiSelectOpenFocusStrategy,
		type ZMultiSelectContext
	} from './context.svelte.js';

	function normalizeValues(source: readonly SelectionKey[], name: string): readonly SelectionKey[] {
		const unique = new Set<SelectionKey>();
		for (const key of source) {
			if (typeof key !== 'string' && typeof key !== 'number') {
				throw new TypeError(`${name} keys must be strings or finite numbers other than -0.`);
			}
			if (typeof key === 'number' && (!Number.isFinite(key) || Object.is(key, -0))) {
				throw new TypeError(`${name} keys must be strings or finite numbers other than -0.`);
			}
			unique.add(key);
		}
		return Object.freeze([...unique]);
	}

	function valuesFromSelection(
		selection: Selection<SelectionKey>,
		allKeys: readonly SelectionKey[]
	): readonly SelectionKey[] {
		if (selection === 'all') return Object.freeze([...allKeys]);
		return Object.freeze([...selection]);
	}

	let {
		children,
		clearable = false,
		controlId: controlIdProp,
		defaultOpen = false,
		defaultValue,
		defaultValues,
		disabled: disabledProp = false,
		emptyText,
		form,
		invalid,
		loading = false,
		loadingText,
		loop = true,
		maxTagCount,
		name: nameProp,
		onOpenChange,
		onValueChange,
		onValuesChange,
		open = $bindable(),
		options,
		overflowLabel,
		placeholder,
		placement = 'bottom-start',
		readonly: readonlyProp = false,
		required: requiredProp = false,
		value = $bindable(),
		valueLabel = String,
		values = $bindable()
	}: ZMultiSelectProps = $props();

	function assertPublicContract(): void {
		if (value !== undefined && values !== undefined) {
			throw new TypeError('ZMultiSelect value and deprecated values are mutually exclusive.');
		}
		if (defaultValue !== undefined && defaultValues !== undefined) {
			throw new TypeError(
				'ZMultiSelect defaultValue and deprecated defaultValues are mutually exclusive.'
			);
		}
		if (onValueChange && onValuesChange) {
			throw new TypeError(
				'ZMultiSelect onValueChange and deprecated onValuesChange are mutually exclusive.'
			);
		}
		if (maxTagCount !== undefined && (!Number.isInteger(maxTagCount) || maxTagCount < 0)) {
			throw new TypeError('ZMultiSelect maxTagCount must be a non-negative integer.');
		}
	}

	untrack(assertPublicContract);
	const zui = useZui();
	const field = claimZFieldControlOwner().field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'multi-select'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-trigger`);
	const describedBy = $derived(field?.describedBy);
	const disabled = $derived(disabledProp || (field?.disabled ?? false));
	const readonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.collection.empty);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedLoadingText = $derived(loadingText ?? zui.localePack.collection.loading);
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.collection.selectOptions);
	const required = $derived(requiredProp || (field?.required ?? false));
	const valueState = new ControllableState<readonly SelectionKey[]>({
		defaultValue: () =>
			normalizeValues(defaultValue ?? defaultValues ?? [], 'ZMultiSelect defaultValue'),
		onChange: () => onValueChange ?? onValuesChange,
		read: () => value ?? values,
		write: (next) => {
			if (value !== undefined || values === undefined) value = next;
			else values = next;
		}
	});
	const resolvedValues = $derived(normalizeValues(valueState.current, 'ZMultiSelect value'));
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const resolvedOpen = $derived(openState.current && !disabled && !readonly);
	const mounted = new MountedElements<SelectionKey>();
	const compound = new CompoundLogicalCollectionRegistry<SelectionKey, MultiSelectItemRecord>(
		mounted
	);
	const collection = $derived.by(() => {
		if (options === undefined) return compound.collection;
		assertContiguousOptionGroups(options, 'ZMultiSelect');
		return new LogicalCollection<SelectionKey, MultiSelectItemRecord>(
			options.map((option) => ({
				disabled: option.disabled ?? false,
				groupKey: option.group,
				key: option.value,
				option,
				selectionDisabled: false,
				textValue: option.label
			})),
			{
				disabled: (item) => item.disabled ?? false,
				groupKey: (item) => item.groupKey,
				key: (item) => item.key,
				selectionDisabled: (item) => item.selectionDisabled ?? false,
				textValue: (item) => item.textValue
			},
			{ name: 'ZMultiSelect options' }
		);
	});
	const view = $derived(collection.full);
	let activeKey = $state<SelectionKey>();
	let openingStrategy = $state<MultiSelectOpenFocusStrategy>('selected');
	const navigation = new CollectionNavigation<SelectionKey, MultiSelectItemRecord>({
		direction: () => zui.direction,
		disabled: () => disabled || readonly,
		loop: () => loop,
		orientation: () => 'vertical',
		readActive: () => activeKey,
		view: () => view,
		writeActive: (next) => (activeKey = next)
	});
	const virtualBridge = createChoiceVirtualMountBridge(mounted);
	const activeDescendant = new ActiveDescendant({
		idBase: () => idBase,
		mounted,
		navigation,
		virtualizer: virtualBridge
	});
	const selection = new SelectionModel<SelectionKey, MultiSelectItemRecord>({
		collection: () => collection,
		mode: () => 'multiple',
		read: () => new Set(resolvedValues),
		view: () => view,
		write: ({ selection: next }) =>
			valueState.setFromUser(
				valuesFromSelection(
					next,
					collection.full.items
						.filter((item) => !item.disabled && !item.selectionDisabled)
						.map((item) => item.key)
				)
			)
	});
	const typeahead = new Typeahead<SelectionKey>({ locale: () => zui.locale });
	// The cache lets a remote selected key keep its last known label between result pages.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const labels = new Map<SelectionKey, string>();
	const tags = $derived(
		resolvedValues.map((itemValue) => {
			const item = collection.get(itemValue);
			if (item) labels.set(itemValue, item.textValue);
			return {
				disabled: item?.disabled ?? false,
				label: item?.textValue ?? labels.get(itemValue) ?? valueLabel(itemValue),
				value: itemValue
			};
		})
	);

	function preferredActive(strategy: MultiSelectOpenFocusStrategy): SelectionKey | undefined {
		if (strategy === 'first') return view.first();
		if (strategy === 'last') return view.last();
		for (const selected of resolvedValues) {
			const item = view.get(selected);
			if (item && !item.disabled) return selected;
		}
		return view.first();
	}

	function setOpen(next: boolean, strategy: MultiSelectOpenFocusStrategy = 'selected'): void {
		if (next && (disabled || readonly)) return;
		openingStrategy = strategy;
		openState.setFromUser(next);
		if (!next) navigation.set(undefined, 'programmatic');
	}

	const context: ZMultiSelectContext = {
		get activeId() {
			return activeDescendant.activeId;
		},
		get activeKey() {
			return activeDescendant.activeKey;
		},
		clear() {
			return !disabled && !readonly && selection.clear();
		},
		get clearable() {
			return clearable;
		},
		get controlId() {
			return controlId;
		},
		get dataMode() {
			return options !== undefined;
		},
		get describedBy() {
			return describedBy;
		},
		get disabled() {
			return disabled;
		},
		get emptyText() {
			return resolvedEmptyText;
		},
		get grouped() {
			return collection.full.items.some((item) => item.groupKey !== undefined);
		},
		handleKey(event) {
			return activeDescendant.handleKey(event);
		},
		idFor(itemValue) {
			return activeDescendant.idFor(itemValue);
		},
		get invalid() {
			return resolvedInvalid;
		},
		isSelected(itemValue) {
			return selection.isSelected(itemValue);
		},
		get loading() {
			return loading;
		},
		get loadingText() {
			return resolvedLoadingText;
		},
		get maxTagCount() {
			return maxTagCount;
		},
		get open() {
			return resolvedOpen;
		},
		overflowLabel(hiddenCount) {
			return (
				overflowLabel?.(hiddenCount) ?? `+${new Intl.NumberFormat(zui.locale).format(hiddenCount)}`
			);
		},
		get placeholder() {
			return resolvedPlaceholder;
		},
		get readonly() {
			return readonly;
		},
		register(read) {
			const current = read();
			if (untrack(() => selection.isSelected(current.key))) {
				labels.set(current.key, current.textValue);
			}
			const stopLogical = options === undefined ? compound.register(read) : () => undefined;
			if (options !== undefined && collection.get(current.key) === undefined) {
				stopLogical();
				throw new Error(
					`ZMultiSelectItem value "${String(current.key)}" is not present in authoritative options.`
				);
			}
			const stopMount = current.element
				? activeDescendant.mount(current.key, current.element)
				: () => undefined;
			return () => {
				stopMount();
				stopLogical();
			};
		},
		remove(itemValue) {
			if (disabled || readonly || !context.isSelected(itemValue)) return false;
			if (collection.get(itemValue)) return selection.toggle(itemValue);
			valueState.setFromUser(
				Object.freeze(resolvedValues.filter((entry) => !Object.is(entry, itemValue)))
			);
			return true;
		},
		get required() {
			return required;
		},
		search(key) {
			return typeahead.search(key, view.items, activeDescendant.activeKey);
		},
		setActive(itemValue) {
			activeDescendant.set(itemValue, 'pointer');
		},
		setOpen,
		setVirtualizer(next) {
			virtualBridge.connect(next, activeDescendant.activeKey);
		},
		get tags() {
			return tags;
		},
		toggle(itemValue, originalEvent) {
			const item = collection.get(itemValue);
			const event = new MultiSelectEvent(originalEvent, itemValue);
			item?.value.onSelect?.(event);
			if (!event.defaultPrevented && !disabled && !readonly && item) {
				selection.toggle(itemValue);
				labels.set(itemValue, item.textValue);
			}
			return event;
		},
		get values() {
			return resolvedValues;
		},
		get view() {
			return view;
		}
	};
	provideZMultiSelect(context);

	$effect(() => {
		assertPublicContract();
		for (const key of labels.keys()) {
			if (!resolvedValues.some((selected) => Object.is(selected, key))) labels.delete(key);
		}
		for (const selected of resolvedValues) {
			const item = collection.get(selected);
			if (item) labels.set(selected, item.textValue);
		}
		if (options !== undefined || resolvedOpen) activeDescendant.prune(collection.full.keys);
		if (!resolvedOpen) {
			navigation.set(undefined, 'programmatic');
			return;
		}
		const preferred = preferredActive(openingStrategy);
		if (activeDescendant.activeKey === undefined && preferred !== undefined) {
			activeDescendant.set(preferred, 'open');
		} else {
			activeDescendant.reconcile();
		}
	});

	function resetFromForm(): void {
		valueState.reset();
		selection.resetTransient();
		navigation.set(undefined, 'programmatic');
	}
</script>

<ZPopover
	gutter={4}
	matchWidth
	modal={false}
	onOpenChange={(next) => setOpen(next)}
	open={resolvedOpen}
	{placement}
	triggerId={controlId}
>
	{@render children?.()}
</ZPopover>
<FormValueBridge
	{disabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={resolvedValues}
/>
