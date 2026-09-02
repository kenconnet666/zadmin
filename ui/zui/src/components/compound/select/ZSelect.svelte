<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import { assertContiguousOptionGroups, type ZCollectionOption } from '../choice-option.js';
	import type { PopoverPlacement } from '../popover/ZPopover.svelte';

	export type ZSelectOption = ZCollectionOption;

	export interface ZSelectProps {
		readonly children?: Snippet;
		readonly controlId?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: SelectionKey;
		readonly disabled?: boolean;
		readonly emptyText?: string;
		readonly form?: string;
		readonly invalid?: boolean;
		readonly loading?: boolean;
		readonly loadingText?: string;
		readonly loop?: boolean;
		readonly name?: string;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: SelectionKey | undefined) => void;
		open?: boolean;
		readonly options?: readonly ZSelectOption[];
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		readonly readonly?: boolean;
		readonly required?: boolean;
		readonly valueLabel?: (value: SelectionKey) => string;
		value?: SelectionKey;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'select',
		importStatement:
			"import { ZSelect, ZSelectTrigger, ZSelectContent, ZSelectItem } from '@zadmin/zui';",
		name: 'ZSelect',
		bindings: [
			{ description: '当前单选值。', name: 'value', type: 'SelectionKey | undefined' },
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
				description: '用户选择或清空后调用一次；异步options变化不会伪造回调。',
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
			{
				description: '打开listbox并初始化active key。',
				key: 'Enter / Space / ArrowUp / ArrowDown'
			},
			{ description: '在完整逻辑view中移动active key。', key: 'ArrowUp / ArrowDown / Home / End' },
			{ description: '按本地化文本前缀移动active key。', key: 'Printable characters' },
			{ description: '选择active option并关闭。', key: 'Enter / Space' },
			{ description: 'dismiss并恢复Trigger焦点。', key: 'Escape' }
		],
		parts: [],
		props: [
			{
				default: 'Field controlId或自动生成的trigger ID',
				description: '覆盖Field生成并用于关联Trigger与表单错误描述的控件ID。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: 'undefined（compound模式）',
				description: '权威数据源；提供后Content从完整typed-key集合渲染、分组并支持异步替换。',
				name: 'options',
				type: 'readonly ZSelectOption[]'
			},
			{
				bindable: true,
				default: 'undefined',
				description: '当前单选值；不在当前options中的异步孤儿值默认保留。',
				name: 'value',
				type: 'SelectionKey'
			},
			{
				default: 'undefined',
				description: '非受控初值与form reset目标。',
				name: 'defaultValue',
				type: 'SelectionKey'
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
				default: 'Provider localePack.collection.selectOption',
				description: '无值时的Trigger文本。',
				name: 'placeholder',
				type: 'string'
			},
			{
				default: 'false',
				description: '显示异步加载状态但保留已有options。',
				name: 'loading',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.collection.loading',
				description: '加载状态文本。',
				name: 'loadingText',
				type: 'string'
			},
			{
				default: 'Provider localePack.collection.empty',
				description: '空集合文本。',
				name: 'emptyText',
				type: 'string'
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
				description: '保持可聚焦和值可读，但阻止打开和选择。',
				name: 'readonly',
				type: 'boolean'
			},
			{ default: '最近祖先form', description: '关联外部form的id。', name: 'form', type: 'string' },
			{
				default: 'Field context或false',
				description: '设置选择控件及其Field语义的无效状态。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'Field context或undefined',
				description: '原生FormData提交使用的字段名；未传时继承Field。',
				name: 'name',
				type: 'string'
			},
			{
				default: "'bottom-start'",
				description: 'Content首选位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				default: 'Field context或false',
				description: '向Field与自定义Trigger公开必填状态；业务阻断由Form schema拥有。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'String(value)',
				description: '异步孤儿值的Trigger回退标签。',
				name: 'valueLabel',
				type: '(value: SelectionKey) => string'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Trigger与Content组合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/select/ZSelect.svelte',
		states: [],
		status: 'experimental',
		summary:
			'以LogicalCollection为唯一顺序事实、以ActiveDescendant承载焦点并保留异步孤儿值的单选Select。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { ActiveDescendant } from '../../../runtime/collection/active-descendant.svelte.js';
	import { CollectionNavigation } from '../../../runtime/collection/collection-navigation.svelte.js';
	import { CompoundLogicalCollectionRegistry } from '../../../runtime/collection/compound-logical-collection.svelte.js';
	import { LogicalCollection } from '../../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import { SelectionModel } from '../../../runtime/collection/selection-model.js';
	import { singleSelection, type Selection } from '../../../runtime/collection/selection.js';
	import { Typeahead } from '../../../runtime/collection/typeahead.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../../runtime/form/field-context.js';
	import FormValueBridge from '../../../runtime/form/FormValueBridge.svelte';
	import { createChoiceVirtualMountBridge } from '../choice-virtualization.js';
	import ZPopover from '../popover/ZPopover.svelte';
	import {
		provideZSelect,
		SelectEvent,
		type SelectItemRecord,
		type SelectOpenFocusStrategy,
		type ZSelectContext
	} from './context.svelte.js';

	let {
		children,
		controlId: controlIdProp,
		defaultOpen = false,
		defaultValue,
		disabled: disabledProp = false,
		emptyText,
		form,
		invalid,
		loading = false,
		loadingText,
		loop = true,
		name: nameProp,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		options,
		placeholder,
		placement = 'bottom-start',
		readonly: readonlyProp = false,
		required: requiredProp = false,
		valueLabel = String,
		value = $bindable()
	}: ZSelectProps = $props();
	const zui = useZui();
	const field = claimZFieldControlOwner().field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'select'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-trigger`);
	const describedBy = $derived(field?.describedBy);
	const disabled = $derived(disabledProp || (field?.disabled ?? false));
	const readonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.collection.empty);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedLoadingText = $derived(loadingText ?? zui.localePack.collection.loading);
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.collection.selectOption);
	const required = $derived(requiredProp || (field?.required ?? false));
	const valueState = new ControllableState<SelectionKey | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		undefinedIsValue: true,
		write: (next) => (value = next)
	});
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const resolvedOpen = $derived(openState.current && !disabled && !readonly);
	const mounted = new MountedElements<SelectionKey>();
	const compound = new CompoundLogicalCollectionRegistry<SelectionKey, SelectItemRecord>(mounted);
	const collection = $derived.by(() => {
		if (options === undefined) return compound.collection;
		assertContiguousOptionGroups(options, 'ZSelect');
		return new LogicalCollection<SelectionKey, SelectItemRecord>(
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
			{ name: 'ZSelect options' }
		);
	});
	const view = $derived(collection.full);
	let activeKey = $state<SelectionKey>();
	let openingStrategy = $state<SelectOpenFocusStrategy>('selected');
	const navigation = new CollectionNavigation<SelectionKey, SelectItemRecord>({
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
	const selection = new SelectionModel<SelectionKey, SelectItemRecord>({
		collection: () => collection,
		mode: () => 'single',
		read: () => singleSelection(valueState.current),
		view: () => view,
		write: ({ selection: next }) => valueState.setFromUser(readSingleValue(next))
	});
	const typeahead = new Typeahead<SelectionKey>({ locale: () => zui.locale });
	// This cache intentionally preserves labels for async values that temporarily leave options.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const labels = new Map<SelectionKey, string>();

	function readSingleValue(next: Selection<SelectionKey>): SelectionKey | undefined {
		if (next === 'all') return undefined;
		for (const key of next) return key;
		return undefined;
	}

	function preferredActive(strategy: SelectOpenFocusStrategy): SelectionKey | undefined {
		if (strategy === 'first') return view.first();
		if (strategy === 'last') return view.last();
		const selected = valueState.current;
		const selectedItem = selected === undefined ? undefined : view.get(selected);
		return selectedItem && !selectedItem.disabled ? selected : view.first();
	}

	function setOpen(next: boolean, strategy: SelectOpenFocusStrategy = 'selected'): void {
		if (next && (disabled || readonly)) return;
		openingStrategy = strategy;
		openState.setFromUser(next);
		if (!next) navigation.set(undefined, 'programmatic');
	}

	const context: ZSelectContext = {
		get activeId() {
			return activeDescendant.activeId;
		},
		get activeKey() {
			return activeDescendant.activeKey;
		},
		choose(itemValue, originalEvent) {
			const item = collection.get(itemValue);
			const event = new SelectEvent(originalEvent, itemValue);
			item?.value.onSelect?.(event);
			if (
				!event.defaultPrevented &&
				!disabled &&
				!readonly &&
				item &&
				selection.replace(itemValue)
			) {
				labels.set(itemValue, item.textValue);
			}
			if (!event.defaultPrevented && item && !item.disabled && !item.selectionDisabled)
				setOpen(false);
			return event;
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
		get open() {
			return resolvedOpen;
		},
		get placeholder() {
			return resolvedPlaceholder;
		},
		get readonly() {
			return readonly;
		},
		register(read) {
			const current = read();
			labels.set(current.key, current.textValue);
			const stopLogical = options === undefined ? compound.register(read) : () => undefined;
			if (options !== undefined && collection.get(current.key) === undefined) {
				stopLogical();
				throw new Error(
					`ZSelectItem value "${String(current.key)}" is not present in authoritative options.`
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
		get required() {
			return required;
		},
		search(key) {
			return typeahead.search(key, view.items, activeDescendant.activeKey);
		},
		get selectedText() {
			const current = valueState.current;
			if (current === undefined) return resolvedPlaceholder;
			const item = collection.get(current);
			if (item) labels.set(current, item.textValue);
			return item?.textValue ?? labels.get(current) ?? valueLabel(current);
		},
		setActive(itemValue) {
			activeDescendant.set(itemValue, 'pointer');
		},
		setOpen,
		setVirtualizer(next) {
			virtualBridge.connect(next, activeDescendant.activeKey);
		},
		get value() {
			return valueState.current;
		},
		get view() {
			return view;
		}
	};
	provideZSelect(context);

	$effect(() => {
		for (const item of collection.full) labels.set(item.key, item.textValue);
		if (options !== undefined) activeDescendant.prune(collection.full.keys);
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
	value={valueState.current}
/>
