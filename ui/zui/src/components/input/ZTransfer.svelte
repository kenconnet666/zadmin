<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';

	export interface TransferItem {
		readonly description?: string;
		readonly disabled?: boolean;
		readonly key: SelectionKey;
		readonly label: string;
	}

	export interface ZTransferProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly controlId?: string;
		readonly defaultValue?: readonly SelectionKey[];
		readonly disabled?: boolean;
		readonly emptyText?: string;
		readonly filter?: (item: TransferItem, query: string) => boolean;
		readonly filterable?: boolean;
		readonly form?: string;
		readonly invalid?: boolean;
		readonly items: readonly TransferItem[];
		readonly loading?: boolean;
		readonly loadingText?: string;
		readonly moveToSourceLabel?: string;
		readonly moveToTargetLabel?: string;
		readonly name?: string;
		readonly onValueChange?: (value: readonly SelectionKey[]) => void;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly searchPlaceholder?: string;
		readonly sourceTitle?: string;
		readonly targetTitle?: string;
		value?: readonly SelectionKey[];
		readonly virtual?: boolean;
		readonly virtualHeight?: number;
		readonly virtualItemSize?: number;
		readonly virtualOverscan?: number;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'transfer',
		importStatement: "import { ZTransfer } from '@zadmin/zui';",
		name: 'ZTransfer',
		bindings: [
			{ description: '目标集合的有序typed key。', name: 'value', type: 'readonly SelectionKey[]' },
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'LogicalCollection',
			'SelectionModel',
			'CollectionNavigation',
			'ActiveDescendant',
			'ZVirtualList',
			'FormValueBridge'
		],
		events: [
			{
				description: '用户移动项目后调用一次，loaded key按items顺序、异步孤儿按原顺序保留。',
				name: 'onValueChange',
				type: '(value: readonly SelectionKey[]) => void'
			}
		],
		keyboard: [
			{
				description: '在当前pane view的enabled项目间移动active key。',
				key: 'ArrowUp / ArrowDown / Home / End'
			},
			{ description: '切换当前active项目的临时勾选。', key: 'Enter / Space' },
			{ description: '选择当前pane过滤view中的全部enabled项目。', key: 'Ctrl / Meta + A' },
			{ description: '按Provider locale标签前缀移动active key。', key: 'Typeahead' },
			{ description: '从筛选输入进入对应listbox。', key: 'ArrowUp / ArrowDown' }
		],
		parts: [
			{ description: '来源或目标pane。', name: 'panel' },
			{ description: '容器焦点的多选listbox。', name: 'list' },
			{ description: '真实option或虚拟option wrapper。', name: 'item' },
			{ description: 'option可见正文。', name: 'item-content' },
			{ description: '双向移动操作区。', name: 'controls' },
			{ description: '加载、空集合或异步孤儿状态。', name: 'status' }
		],
		props: [
			{
				default: '继承Field或自动生成',
				description: '来源listbox这一业务值焦点owner的id。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: '必填',
				description: '权威完整数据源；key必须是唯一string或有限number且不能为-0。',
				name: 'items',
				required: true,
				type: 'readonly TransferItem[]',
				members: [
					{
						description: '唯一业务身份；排序、筛选和移动后保持不变。',
						name: 'key',
						type: 'SelectionKey',
						required: true
					},
					{ description: '选项显示文本。', name: 'label', type: 'string', required: true },
					{ description: '选项补充说明。', name: 'description', type: 'string' },
					{ description: '禁止选择或移动该项。', name: 'disabled', type: 'boolean' }
				]
			},
			{
				bindable: true,
				default: '[]',
				description: '目标集合typed key；未加载的异步孤儿默认保留并继续提交。',
				name: 'value',
				type: 'readonly SelectionKey[]'
			},
			{
				default: '[]',
				description: '非受控初始目标集合与form reset目标。',
				name: 'defaultValue',
				type: 'readonly SelectionKey[]'
			},
			{
				default: 'Provider localePack.transfer.empty',
				description: 'pane view为空且不在loading时的状态文本；异步孤儿使用独立locale状态。',
				name: 'emptyText',
				type: 'string'
			},
			{
				default: '最近祖先form',
				description: '把最终value的重复同名entries关联到DOM外部form；两侧筛选草稿不会参与。',
				name: 'form',
				type: 'string'
			},
			{
				default: 'true',
				description: '显示两侧辅助过滤输入。',
				name: 'filterable',
				type: 'boolean'
			},
			{
				default: 'Provider locale的标签与说明contains',
				description: '只产生pane view；不修改临时勾选或最终value。',
				name: 'filter',
				type: '(item: TransferItem, query: string) => boolean'
			},
			{
				default: 'false',
				description: '保留现有items并向两栏暴露aria-busy。',
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
				default: '继承Field或false',
				description: '投射到根和来源业务listbox，不把筛选输入伪装成业务值owner。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '禁用焦点、勾选、移动与FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.transfer.moveToSource',
				description: '返回来源pane按钮的可访问名称。',
				name: 'moveToSourceLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.transfer.moveToTarget',
				description: '移入目标pane按钮的可访问名称。',
				name: 'moveToTargetLabel',
				type: 'string'
			},
			{
				default: 'false',
				description: '保持listbox可聚焦导航和值可提交，但禁止筛选编辑、勾选与移动。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '启用两栏固定行虚拟窗口。',
				name: 'virtual',
				type: 'boolean'
			},
			{
				default: '256',
				description: '每个虚拟pane viewport高度，单位px。',
				name: 'virtualHeight',
				type: 'number'
			},
			{
				default: '52',
				description: '虚拟option固定高度，单位px。',
				name: 'virtualItemSize',
				type: 'number'
			},
			{
				default: '4',
				description: '每栏虚拟窗口上下额外项数。',
				name: 'virtualOverscan',
				type: 'number'
			},
			{
				default: '继承Field或false',
				description: '投射到来源业务listbox；最终value校验仍由Field/Form schema拥有。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.transfer.filterPlaceholder',
				description: '两侧辅助筛选输入的placeholder；查询不是表单字段。',
				name: 'searchPlaceholder',
				type: 'string'
			},
			{
				default: 'Provider localePack.transfer.sourceTitle',
				description: '来源pane标题和listbox可访问名称。',
				name: 'sourceTitle',
				type: 'string'
			},
			{
				default: 'Provider localePack.transfer.targetTitle',
				description: '目标pane标题和listbox可访问名称。',
				name: 'targetTitle',
				type: 'string'
			},
			{
				default: '继承Field或undefined',
				description: '每个最终value重复使用的FormData字段名。',
				name: 'name',
				type: 'string'
			}
		],
		since: '0.2.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTransfer.svelte',
		states: [
			{ description: '整个Transfer或项目禁用。', name: 'data-disabled', values: ['true'] },
			{ description: '整个Transfer只读。', name: 'data-readonly', values: ['true'] },
			{ description: '整个Transfer无效。', name: 'data-invalid', values: ['true'] },
			{ description: '异步数据仍在加载。', name: 'data-loading', values: ['true'] },
			{
				description: '项目是否被临时勾选。',
				name: 'data-state',
				values: ['selected', 'unselected']
			}
		],
		status: 'stable',
		summary:
			'以一个完整LogicalCollection派生双pane view、以独立SelectionModel管理临时勾选，并支持异步孤儿、多值FormData和固定行虚拟化的Transfer。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Sets use immutable replacement or are local normalization scratch. */
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { onDestroy, untrack } from 'svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { ActiveDescendant } from '../../runtime/collection/active-descendant.svelte.js';
	import {
		CollectionNavigation,
		isKeyboardComposing
	} from '../../runtime/collection/collection-navigation.svelte.js';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { MountedElements } from '../../runtime/collection/mounted-elements.svelte.js';
	import { SelectionModel } from '../../runtime/collection/selection-model.js';
	import type { Selection } from '../../runtime/collection/selection.js';
	import { Typeahead } from '../../runtime/collection/typeahead.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import {
		createChoiceVirtualMountBridge,
		type ChoiceVirtualController
	} from '../compound/choice-virtualization.js';
	import ZButton from '../gene/ZButton.svelte';
	import TransferPane from './TransferPane.svelte';

	type Side = 'source' | 'target';
	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.stretch;
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._medium;
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled }
		},
		defaultVariants: { disabled: false }
	});
	const controlsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.flexDirection.column;
			s.gap._small;
			s.justifyContent.center;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, controlsRecipe);

	function normalizeKeys(source: readonly SelectionKey[], name: string): readonly SelectionKey[] {
		const keys = new Set<SelectionKey>();
		for (const key of source) {
			if (
				(typeof key !== 'string' && typeof key !== 'number') ||
				(typeof key === 'number' && (!Number.isFinite(key) || Object.is(key, -0)))
			) {
				throw new TypeError(`${name} keys must be strings or finite numbers other than -0.`);
			}
			keys.add(key);
		}
		return Object.freeze([...keys]);
	}

	function selectionKeys(
		selection: Selection<SelectionKey>,
		viewKeys: readonly SelectionKey[]
	): ReadonlySet<SelectionKey> {
		return new Set(selection === 'all' ? viewKeys : selection);
	}

	function equalSets(left: ReadonlySet<SelectionKey>, right: ReadonlySet<SelectionKey>): boolean {
		if (left.size !== right.size) return false;
		for (const key of left) if (!right.has(key)) return false;
		return true;
	}

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-labelledby': ariaLabelledBy,
		class: className,
		controlId: controlIdProp,
		defaultValue = [],
		disabled: disabledProp = false,
		emptyText,
		filter,
		filterable = true,
		form,
		id,
		invalid,
		items,
		loading = false,
		loadingText,
		moveToSourceLabel,
		moveToTargetLabel,
		name: nameProp,
		onValueChange,
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		searchPlaceholder,
		sourceTitle,
		style,
		targetTitle,
		value = $bindable(),
		virtual = false,
		virtualHeight = 256,
		virtualItemSize = 52,
		virtualOverscan = 4,
		...rest
	}: ZTransferProps = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'transfer'));
	const disabled = $derived(disabledProp || (field?.disabled ?? false));
	const readonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedControlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-source-list`);
	const resolvedRootId = $derived(id ?? `${idBase}-root`);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.transfer.empty);
	const resolvedLoadingText = $derived(loadingText ?? zui.localePack.collection.loading);
	const resolvedMoveToSourceLabel = $derived(
		moveToSourceLabel ?? zui.localePack.transfer.moveToSource
	);
	const resolvedMoveToTargetLabel = $derived(
		moveToTargetLabel ?? zui.localePack.transfer.moveToTarget
	);
	const resolvedSearchPlaceholder = $derived(
		searchPlaceholder ?? zui.localePack.transfer.filterPlaceholder
	);
	const resolvedSourceTitle = $derived(sourceTitle ?? zui.localePack.transfer.sourceTitle);
	const resolvedTargetTitle = $derived(targetTitle ?? zui.localePack.transfer.targetTitle);
	const collection = $derived(
		new LogicalCollection<SelectionKey, TransferItem>(
			items,
			{
				disabled: (item) => item.disabled ?? false,
				key: (item) => item.key,
				textValue: (item) => item.label
			},
			{ name: 'ZTransfer items' }
		)
	);
	const valueState = new ControllableState<readonly SelectionKey[]>({
		defaultValue: () => normalizeKeys(defaultValue, 'ZTransfer defaultValue'),
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived(normalizeKeys(valueState.current, 'ZTransfer value'));
	const targetKeys = $derived(new Set(resolvedValue));
	const sourceFullView = $derived(
		collection.view({ include: (item) => !targetKeys.has(item.key) })
	);
	const targetFullView = $derived(collection.view({ include: (item) => targetKeys.has(item.key) }));
	let sourceQuery = $state('');
	let targetQuery = $state('');
	const filterCollator = $derived(
		new Intl.Collator(zui.locale, { sensitivity: 'base', usage: 'search' })
	);

	function localeContains(text: string, query: string): boolean {
		const source = [...text];
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

	function matches(item: TransferItem, query: string): boolean {
		if (!query) return true;
		return (
			filter ??
			((candidate, value) =>
				localeContains(`${candidate.label} ${candidate.description ?? ''}`, value))
		)(item, query);
	}

	const sourceView = $derived(
		collection.view({
			include: (item) => !targetKeys.has(item.key) && matches(item.value, sourceQuery.trim())
		})
	);
	const targetView = $derived(
		collection.view({
			include: (item) => targetKeys.has(item.key) && matches(item.value, targetQuery.trim())
		})
	);
	const orphanKeys = $derived(resolvedValue.filter((key) => collection.get(key) === undefined));
	const orphanText = $derived(
		orphanKeys.length === 0
			? undefined
			: zui.localePack.transfer.selectedNotLoaded(
					new Intl.NumberFormat(zui.locale).format(orphanKeys.length),
					orphanKeys.length
				)
	);
	let sourceChecked = $state<ReadonlySet<SelectionKey>>(new Set());
	let targetChecked = $state<ReadonlySet<SelectionKey>>(new Set());
	let sourceActiveKey = $state<SelectionKey>();
	let targetActiveKey = $state<SelectionKey>();
	let sourceListRef = $state<HTMLDivElement | null>(null);
	let targetListRef = $state<HTMLDivElement | null>(null);
	const sourceMounted = new MountedElements<SelectionKey>();
	const targetMounted = new MountedElements<SelectionKey>();
	const sourceNavigation = new CollectionNavigation<SelectionKey, TransferItem>({
		direction: () => zui.direction,
		disabled: () => disabled,
		loop: () => true,
		orientation: () => 'vertical',
		readActive: () => sourceActiveKey,
		view: () => sourceView,
		writeActive: (next) => (sourceActiveKey = next)
	});
	const targetNavigation = new CollectionNavigation<SelectionKey, TransferItem>({
		direction: () => zui.direction,
		disabled: () => disabled,
		loop: () => true,
		orientation: () => 'vertical',
		readActive: () => targetActiveKey,
		view: () => targetView,
		writeActive: (next) => (targetActiveKey = next)
	});
	const sourceVirtualBridge = createChoiceVirtualMountBridge(sourceMounted);
	const targetVirtualBridge = createChoiceVirtualMountBridge(targetMounted);
	const sourceActive = new ActiveDescendant({
		idBase: () => `${idBase}-source`,
		mounted: sourceMounted,
		navigation: sourceNavigation,
		virtualizer: sourceVirtualBridge
	});
	const targetActive = new ActiveDescendant({
		idBase: () => `${idBase}-target`,
		mounted: targetMounted,
		navigation: targetNavigation,
		virtualizer: targetVirtualBridge
	});
	const sourceSelection = new SelectionModel<SelectionKey, TransferItem>({
		collection: () => collection,
		mode: () => (disabled || readonly ? 'none' : 'multiple'),
		read: () => new Set(sourceChecked),
		selectAllScope: () => 'view',
		view: () => sourceView,
		write: ({ selection }) => (sourceChecked = selectionKeys(selection, sourceView.keys))
	});
	const targetSelection = new SelectionModel<SelectionKey, TransferItem>({
		collection: () => collection,
		mode: () => (disabled || readonly ? 'none' : 'multiple'),
		read: () => new Set(targetChecked),
		selectAllScope: () => 'view',
		view: () => targetView,
		write: ({ selection }) => (targetChecked = selectionKeys(selection, targetView.keys))
	});
	const sourceTypeahead = new Typeahead<SelectionKey>({ locale: () => zui.locale });
	const targetTypeahead = new Typeahead<SelectionKey>({ locale: () => zui.locale });
	const rootClass = $derived(zui.recipe(rootRecipe, { disabled }));
	const controlsClass = $derived(zui.recipe(controlsRecipe));
	const MoveToTargetIcon = $derived(zui.direction === 'rtl' ? ArrowLeft : ArrowRight);
	const MoveToSourceIcon = $derived(zui.direction === 'rtl' ? ArrowRight : ArrowLeft);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function paneRuntime(side: Side) {
		return side === 'source'
			? {
					active: sourceActive,
					selection: sourceSelection,
					typeahead: sourceTypeahead,
					view: () => sourceView
				}
			: {
					active: targetActive,
					selection: targetSelection,
					typeahead: targetTypeahead,
					view: () => targetView
				};
	}

	function handleListKey(event: KeyboardEvent, side: Side): void {
		if (isKeyboardComposing(event) || disabled) return;
		const runtime = paneRuntime(side);
		if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'a') {
			event.preventDefault();
			runtime.selection.selectAll();
			return;
		}
		if (event.key === 'Enter' || event.key === ' ') {
			const key = runtime.active.activeKey;
			if (key === undefined) return;
			event.preventDefault();
			runtime.selection.toggle(key);
			return;
		}
		if (runtime.active.handleKey(event)) return;
		const match = runtime.typeahead.search(
			event.key,
			runtime.view().items,
			runtime.active.activeKey
		);
		if (match !== undefined) {
			event.preventDefault();
			runtime.active.set(match, 'keyboard');
		}
	}

	function handleFilterKey(event: KeyboardEvent, side: Side): void {
		if (isKeyboardComposing(event) || disabled) return;
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		const runtime = paneRuntime(side);
		const target = event.key === 'ArrowUp' ? runtime.view().last() : runtime.view().first();
		if (target === undefined) return;
		event.preventDefault();
		(side === 'source' ? sourceListRef : targetListRef)?.focus({ preventScroll: true });
		runtime.active.set(target, 'keyboard');
	}

	function move(to: Side): void {
		if (disabled || readonly) return;
		const moving = to === 'target' ? sourceChecked : targetChecked;
		if (moving.size === 0) return;
		const nextKeys = new Set(targetKeys);
		for (const item of collection.full) {
			if (!moving.has(item.key) || item.disabled) continue;
			if (to === 'target') nextKeys.add(item.key);
			else nextKeys.delete(item.key);
		}
		const loaded = collection.full.keys.filter((key) => nextKeys.has(key));
		const orphans = resolvedValue.filter(
			(key) => collection.get(key) === undefined && nextKeys.has(key)
		);
		valueState.setFromUser(Object.freeze([...loaded, ...orphans]));
		if (to === 'target') {
			sourceChecked = new Set();
			sourceSelection.resetTransient();
		} else {
			targetChecked = new Set();
			targetSelection.resetTransient();
		}
	}

	function resetFromForm(): void {
		valueState.reset();
		sourceChecked = new Set();
		targetChecked = new Set();
		sourceQuery = '';
		targetQuery = '';
		sourceSelection.resetTransient();
		targetSelection.resetTransient();
		sourceTypeahead.clear();
		targetTypeahead.clear();
		sourceNavigation.set(undefined, 'programmatic');
		targetNavigation.set(undefined, 'programmatic');
	}

	function focusPrimaryControl(): void {
		if (disabled) return;
		sourceListRef?.focus({ preventScroll: true });
		sourceActive.reconcile();
	}

	onDestroy(fieldOwner.registerFocusOwner(focusPrimaryControl));
	$effect(() => {
		void sourceQuery;
		sourceTypeahead.clear();
	});
	$effect(() => {
		void targetQuery;
		targetTypeahead.clear();
	});
	$effect(() => {
		const keys = collection.full.keys;
		sourceActive.prune(keys);
		targetActive.prune(keys);
		sourceActive.reconcile();
		targetActive.reconcile();

		const sourcePaneKeys = new Set(sourceFullView.keys);
		const targetPaneKeys = new Set(targetFullView.keys);
		const nextSource = new Set(
			[...sourceChecked].filter((key) => {
				const item = collection.get(key);
				return sourcePaneKeys.has(key) && item !== undefined && !item.disabled;
			})
		);
		const nextTarget = new Set(
			[...targetChecked].filter((key) => {
				const item = collection.get(key);
				return targetPaneKeys.has(key) && item !== undefined && !item.disabled;
			})
		);
		if (!equalSets(nextSource, sourceChecked)) {
			sourceChecked = nextSource;
			sourceSelection.resetTransient();
		}
		if (!equalSets(nextTarget, targetChecked)) {
			targetChecked = nextTarget;
			targetSelection.resetTransient();
		}
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={resolvedRootId}
	role="group"
	aria-busy={loading || undefined}
	aria-disabled={disabled || undefined}
	aria-describedby={resolvedDescribedBy}
	aria-labelledby={resolvedLabelledBy}
	data-disabled={disabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-loading={loading || undefined}
	data-readonly={readonly || undefined}
>
	<TransferPane
		active={sourceActive}
		bind:listRef={sourceListRef}
		bind:query={sourceQuery}
		checked={sourceChecked}
		controlId={resolvedControlId}
		describedBy={resolvedDescribedBy}
		{disabled}
		emptyText={resolvedEmptyText}
		{filterable}
		invalid={resolvedInvalid}
		label={resolvedSourceTitle}
		labelId={`${idBase}-source-title`}
		labelledBy={mergeAriaIds(resolvedLabelledBy, `${idBase}-source-title`) ??
			`${idBase}-source-title`}
		{loading}
		loadingText={resolvedLoadingText}
		onControllerChange={(controller: ChoiceVirtualController<SelectionKey> | null) =>
			sourceVirtualBridge.connect(controller, sourceActive.activeKey)}
		onFilterKeydown={(event) => handleFilterKey(event, 'source')}
		onListKeydown={(event) => handleListKey(event, 'source')}
		onToggle={(item) => sourceSelection.toggle(item.key)}
		{readonly}
		required={resolvedRequired}
		searchPlaceholder={resolvedSearchPlaceholder}
		totalCount={sourceFullView.size}
		view={sourceView}
		{virtual}
		{virtualHeight}
		{virtualItemSize}
		{virtualOverscan}
	/>

	<div class={controlsClass} data-slot="controls">
		<ZButton
			aria-label={resolvedMoveToTargetLabel}
			disabled={disabled || readonly || sourceChecked.size === 0}
			onclick={() => move('target')}
		>
			<MoveToTargetIcon aria-hidden="true" size={18} />
		</ZButton>
		<ZButton
			aria-label={resolvedMoveToSourceLabel}
			disabled={disabled || readonly || targetChecked.size === 0}
			onclick={() => move('source')}
			variant="secondary"
		>
			<MoveToSourceIcon aria-hidden="true" size={18} />
		</ZButton>
	</div>

	<TransferPane
		active={targetActive}
		bind:listRef={targetListRef}
		bind:query={targetQuery}
		checked={targetChecked}
		controlId={`${idBase}-target-list`}
		{disabled}
		emptyText={resolvedEmptyText}
		{filterable}
		invalid={false}
		label={resolvedTargetTitle}
		labelId={`${idBase}-target-title`}
		labelledBy={`${idBase}-target-title`}
		{loading}
		loadingText={resolvedLoadingText}
		onControllerChange={(controller: ChoiceVirtualController<SelectionKey> | null) =>
			targetVirtualBridge.connect(controller, targetActive.activeKey)}
		onFilterKeydown={(event) => handleFilterKey(event, 'target')}
		onListKeydown={(event) => handleListKey(event, 'target')}
		onToggle={(item) => targetSelection.toggle(item.key)}
		{orphanText}
		{readonly}
		required={false}
		searchPlaceholder={resolvedSearchPlaceholder}
		totalCount={resolvedValue.length}
		view={targetView}
		{virtual}
		{virtualHeight}
		{virtualItemSize}
		{virtualOverscan}
	/>
</div>
<FormValueBridge
	{disabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={resolvedValue}
/>
