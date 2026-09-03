<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import { assertContiguousOptionGroups, type ZCollectionOption } from '../choice-option.js';
	import type { PopoverPlacement } from '../popover/ZPopover.svelte';

	export type ZComboboxOption = ZCollectionOption;

	export interface ZComboboxProps {
		readonly children?: Snippet;
		readonly controlId?: string;
		readonly defaultInputValue?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: SelectionKey;
		readonly disabled?: boolean;
		readonly emptyText?: string;
		readonly filter?: (textValue: string, query: string) => boolean;
		readonly form?: string;
		inputValue?: string;
		readonly invalid?: boolean;
		readonly loading?: boolean;
		readonly loadingText?: string;
		readonly loop?: boolean;
		readonly name?: string;
		readonly onInputValueChange?: (value: string) => void;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (value: SelectionKey | undefined) => void;
		open?: boolean;
		readonly openOnFocus?: boolean;
		readonly options?: readonly ZComboboxOption[];
		readonly placement?: PopoverPlacement;
		readonly readonly?: boolean;
		readonly required?: boolean;
		readonly shouldFilter?: boolean;
		readonly valueLabel?: (value: SelectionKey) => string;
		value?: SelectionKey;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'combobox',
		importStatement:
			"import { ZCombobox, ZComboboxInput, ZComboboxContent, ZComboboxItem } from '@zadmin/zui';",
		name: 'ZCombobox',
		bindings: [
			{ description: '当前单选业务key。', name: 'value', type: 'SelectionKey | undefined' },
			{ description: '当前输入文本。', name: 'inputValue', type: 'string' },
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
				description: '移动逻辑active option且不移动输入DOM焦点。',
				key: 'ArrowUp / ArrowDown / Home / End'
			},
			{ description: '选择active option。', key: 'Enter' },
			{ description: 'dismiss并保留输入焦点。', key: 'Escape' }
		],
		parts: [],
		props: [
			{
				default: 'Field controlId或自动生成的input ID',
				description: '覆盖Field生成并用于关联输入框与表单错误描述的控件ID。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: 'undefined（compound模式）',
				description: '权威typed-key数据源，支持分组与异步结果替换。',
				name: 'options',
				type: 'readonly ZComboboxOption[]',
				members: [
					{ description: '选项唯一业务值。', name: 'value', type: 'SelectionKey', required: true },
					{ description: '选项显示文本。', name: 'label', type: 'string', required: true },
					{ description: '禁用该选项。', name: 'disabled', type: 'boolean' },
					{ description: '连续分组标签。', name: 'group', type: 'string' }
				]
			},
			{
				bindable: true,
				default: 'undefined',
				description: '当前选择key；异步查询暂时缺项时仍保留。',
				name: 'value',
				type: 'SelectionKey'
			},
			{
				default: 'undefined',
				description: '非受控选择初值与reset目标。',
				name: 'defaultValue',
				type: 'SelectionKey'
			},
			{
				bindable: true,
				default: "''",
				description: '输入显示与查询文本，和value是独立受控轴。',
				name: 'inputValue',
				type: 'string'
			},
			{
				default: 'defaultValue标签',
				description: '非受控输入初值与reset目标。',
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
				default: 'false',
				description: '非受控初始打开状态。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				default: 'true',
				description: '输入获得焦点时打开建议。',
				name: 'openOnFocus',
				type: 'boolean'
			},
			{
				default: 'true',
				description: 'false时把options视为服务端已过滤结果。',
				name: 'shouldFilter',
				type: 'boolean'
			},
			{
				default: 'locale-sensitive contains',
				description: '本地过滤函数。',
				name: 'filter',
				type: '(textValue: string, query: string) => boolean'
			},
			{
				default: 'false',
				description: '显示加载状态并保留已有结果。',
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
				description: '无匹配结果文本。',
				name: 'emptyText',
				type: 'string'
			},
			{ default: 'true', description: '方向键是否首尾循环。', name: 'loop', type: 'boolean' },
			{ default: 'false', description: '禁用全部交互与提交。', name: 'disabled', type: 'boolean' },
			{
				default: 'false',
				description: '保留可聚焦和可复制文本，但禁止输入、打开和选择。',
				name: 'readonly',
				type: 'boolean'
			},
			{ default: '最近祖先form', description: '关联外部form的id。', name: 'form', type: 'string' },
			{
				default: 'Field context或false',
				description: '设置输入控件及其Field语义的无效状态。',
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
				description: '投射到Combobox输入的可访问必填语义；业务阻断由Form schema拥有。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'String(value)',
				description: 'options未包含当前异步孤儿key时的标签回退。',
				name: 'valueLabel',
				type: '(value: SelectionKey) => string'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Input与Content组合。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/combobox/ZCombobox.svelte',
		states: [],
		status: 'stable',
		summary:
			'把输入、选择与打开状态分离，并以完整LogicalCollection驱动过滤和真实active-descendant的单选Combobox。'
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
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { claimZFieldControlOwner } from '../../../runtime/form/field-context.js';
	import FormValueBridge from '../../../runtime/form/FormValueBridge.svelte';
	import { createChoiceVirtualMountBridge } from '../choice-virtualization.js';
	import ZPopover from '../popover/ZPopover.svelte';
	import {
		ComboboxSelectEvent,
		provideZCombobox,
		type ComboboxItemRecord,
		type ComboboxOpenFocusStrategy,
		type ZComboboxContext
	} from './context.svelte.js';

	let {
		children,
		controlId: controlIdProp,
		defaultInputValue,
		defaultOpen = false,
		defaultValue,
		disabled: disabledProp = false,
		emptyText,
		filter,
		form,
		inputValue = $bindable(),
		invalid,
		loading = false,
		loadingText,
		loop = true,
		name: nameProp,
		onInputValueChange,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		openOnFocus = true,
		options,
		placement = 'bottom-start',
		readonly: readonlyProp = false,
		required: requiredProp = false,
		shouldFilter = true,
		value = $bindable(),
		valueLabel = String
	}: ZComboboxProps = $props();
	const zui = useZui();
	const field = claimZFieldControlOwner().field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'combobox'));
	const controlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-input`);
	const describedBy = $derived(field?.describedBy);
	const disabled = $derived(disabledProp || (field?.disabled ?? false));
	const readonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.collection.empty);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedLoadingText = $derived(loadingText ?? zui.localePack.collection.loading);
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	// Labels survive remote result replacement so selected keys never need fake option nodes.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const labels = new Map<SelectionKey, string>();
	const readValueLabel = (itemValue: SelectionKey): string =>
		options?.find((option) => Object.is(option.value, itemValue))?.label ??
		labels.get(itemValue) ??
		valueLabel(itemValue);
	const readDefaultInputValue = () =>
		defaultInputValue ?? (defaultValue === undefined ? '' : readValueLabel(defaultValue));
	const valueState = new ControllableState<SelectionKey | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		undefinedIsValue: true,
		write: (next) => (value = next)
	});
	const inputState = new ControllableState<string>({
		defaultValue: readDefaultInputValue,
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
	const resolvedOpen = $derived(openState.current && !disabled && !readonly);
	const mounted = new MountedElements<SelectionKey>();
	const compound = new CompoundLogicalCollectionRegistry<SelectionKey, ComboboxItemRecord>(mounted);
	const collection = $derived.by(() => {
		if (options === undefined) return compound.collection;
		assertContiguousOptionGroups(options, 'ZCombobox');
		return new LogicalCollection<SelectionKey, ComboboxItemRecord>(
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
			{ name: 'ZCombobox options' }
		);
	});
	const filterCollator = $derived(
		new Intl.Collator(zui.locale, { sensitivity: 'base', usage: 'search' })
	);

	function localeContains(textValue: string, query: string): boolean {
		const source = [...textValue];
		const target = [...query];
		if (target.length === 0) return true;
		for (let index = 0; index <= source.length - target.length; index += 1) {
			if (
				filterCollator.compare(source.slice(index, index + target.length).join(''), query) === 0
			) {
				return true;
			}
		}
		return false;
	}

	const view = $derived.by(() => {
		const query = inputState.current.trim();
		if (!shouldFilter || query.length === 0) return collection.full;
		return collection.view({
			include: ({ textValue }) => (filter ?? localeContains)(textValue, query)
		});
	});
	let activeKey = $state<SelectionKey>();
	let openingStrategy = $state<ComboboxOpenFocusStrategy>('selected');
	const navigation = new CollectionNavigation<SelectionKey, ComboboxItemRecord>({
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
	const selection = new SelectionModel<SelectionKey, ComboboxItemRecord>({
		collection: () => collection,
		mode: () => 'single',
		read: () => singleSelection(valueState.current),
		view: () => view,
		write: ({ selection: next }) => valueState.setFromUser(readSingleValue(next))
	});

	function readSingleValue(next: Selection<SelectionKey>): SelectionKey | undefined {
		if (next === 'all') return undefined;
		for (const key of next) return key;
		return undefined;
	}

	function preferredActive(strategy: ComboboxOpenFocusStrategy): SelectionKey | undefined {
		if (strategy === 'first') return view.first();
		if (strategy === 'last') return view.last();
		const selected = valueState.current;
		const selectedItem = selected === undefined ? undefined : view.get(selected);
		return selectedItem && !selectedItem.disabled ? selected : view.first();
	}

	function setOpen(next: boolean, strategy: ComboboxOpenFocusStrategy = 'selected'): void {
		if (next && (disabled || readonly)) return;
		openingStrategy = strategy;
		openState.setFromUser(next);
		if (!next) navigation.set(undefined, 'programmatic');
	}

	const context: ZComboboxContext = {
		get activeId() {
			return activeDescendant.activeId;
		},
		get activeKey() {
			return activeDescendant.activeKey;
		},
		choose(itemValue, originalEvent) {
			const item = view.get(itemValue);
			const event = new ComboboxSelectEvent(originalEvent, itemValue);
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
			if (!event.defaultPrevented && item && !item.disabled && !item.selectionDisabled) {
				inputState.setFromUser(item.textValue);
				setOpen(false);
			}
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
		get inputDefaultValue() {
			return readDefaultInputValue();
		},
		get inputValue() {
			return inputState.current;
		},
		get invalid() {
			return resolvedInvalid;
		},
		isSelected(itemValue) {
			return selection.isSelected(itemValue);
		},
		isVisible(itemValue) {
			return view.get(itemValue) !== undefined;
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
		get openOnFocus() {
			return openOnFocus;
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
					`ZComboboxItem value "${String(current.key)}" is not present in authoritative options.`
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
			return resolvedRequired;
		},
		setActive(itemValue) {
			activeDescendant.set(itemValue, 'pointer');
		},
		setInputValue(next) {
			if (disabled || readonly) return;
			inputState.setFromUser(next);
			navigation.set(undefined, 'filter');
			setOpen(true, 'first');
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
	provideZCombobox(context);

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
		inputState.reset();
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
	{placement}>{@render children?.()}</ZPopover
>
<FormValueBridge
	{disabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={valueState.current}
/>
