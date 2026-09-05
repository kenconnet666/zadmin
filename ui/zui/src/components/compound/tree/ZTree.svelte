<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey, SelectionMode } from '../../../runtime/collection/selection.js';
	import type { VirtualAlign } from '../../../runtime/collection/virtualizer.js';
	import type {
		TreeEntry as PublicTreeEntry,
		TreeNode as PublicTreeNode
	} from '../../../runtime/tree.js';
	import type { ZVirtualListController } from '../../data-display/ZVirtualList.svelte';

	export type TreeSelectionMode = SelectionMode;
	export type TreeSelectionStyle = 'checkbox' | 'highlight';

	export interface TreeLoadContext<TKey extends SelectionKey = SelectionKey> {
		readonly key: TKey;
		readonly signal: AbortSignal;
	}

	export interface ZTreeController<TKey extends SelectionKey = SelectionKey> {
		readonly activeKey: TKey | undefined;
		readonly errorKeys: readonly TKey[];
		readonly loadingKeys: readonly TKey[];

		focusKey(key: TKey, options?: { readonly expandAncestors?: boolean }): boolean;

		getNode(key: TKey): PublicTreeNode<TKey> | undefined;

		retryLoad(key: TKey): boolean;

		scrollToKey(key: TKey, align?: VirtualAlign): boolean;
	}

	export interface ZTreeProps<TKey extends SelectionKey = SelectionKey> extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'role'
	> {
		readonly appearance?: 'bare' | 'tree';
		controller?: ZTreeController<TKey> | null;
		readonly defaultExpandedKeys?: readonly TKey[];
		readonly defaultSelectedKeys?: readonly TKey[];
		readonly disabled?: boolean;
		readonly disallowEmptySelection?: boolean;
		readonly empty?: Snippet;
		readonly emptyText?: string;
		expandedKeys?: readonly TKey[];
		readonly form?: string;
		readonly height?: number;
		readonly item?: Snippet<[PublicTreeNode<TKey>, PublicTreeEntry<TKey>]>;
		readonly itemSize?: number;
		readonly name?: string;
		readonly nodes: readonly PublicTreeNode<TKey>[];
		readonly onExpandedChange?: (keys: readonly TKey[]) => void;
		readonly onLoadChildren?: (
			node: PublicTreeNode<TKey>,
			context: TreeLoadContext<TKey>
		) => void | Promise<void>;
		readonly onLoadError?: (key: TKey, error: unknown) => void;
		readonly onSelectionChange?: (keys: readonly TKey[]) => void;
		readonly overscan?: number;
		ref?: HTMLDivElement | null;
		readonly resetOnForm?: boolean;
		selectedKeys?: readonly TKey[];
		readonly selectionMode?: TreeSelectionMode;
		readonly selectionStyle?: TreeSelectionStyle;
		readonly ssrViewportSize?: number;
		readonly virtualized?: boolean;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'tree',
		importStatement: "import { ZTree } from '@zadmin/zui';",
		name: 'ZTree',
		bindings: [
			{ description: '展开key集合。', name: 'expandedKeys', type: 'readonly SelectionKey[]' },
			{ description: '选择key集合。', name: 'selectedKeys', type: 'readonly SelectionKey[]' },
			{ description: '真实tree焦点owner引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{
				description: '聚焦、按key滚动和懒加载重试的窄控制器。',
				name: 'controller',
				type: 'ZTreeController<TKey> | null'
			}
		],
		dependencies: [
			'LogicalTree',
			'LogicalCollection',
			'SelectionModel',
			'CollectionNavigation',
			'ActiveDescendant',
			'ZVirtualList',
			'FormValueBridge'
		],
		events: [
			{
				description: '用户展开、折叠或展开同级branch后调用一次。',
				name: 'onExpandedChange',
				type: '(keys: readonly TKey[]) => void'
			},
			{
				description: '用户选择、切换、范围选择或全选后调用一次。',
				name: 'onSelectionChange',
				type: '(keys: readonly TKey[]) => void'
			},
			{
				description: '首次展开未加载branch时调用；调用方负责更新nodes。',
				name: 'onLoadChildren',
				type: '(node: TreeNode<TKey>, context: { key: TKey; signal: AbortSignal }) => void | Promise<void>'
			},
			{
				description: '懒加载失败后的诊断回调；调用方可通过controller.retryLoad重试。',
				name: 'onLoadError',
				type: '(key: TKey, error: unknown) => void'
			}
		],
		keyboard: [
			{ description: '在可见且enabled节点间移动active。', key: 'ArrowUp / ArrowDown / Home / End' },
			{
				description: '按书写方向展开/进入子节点或折叠/返回父节点。',
				key: 'ArrowLeft / ArrowRight'
			},
			{ description: '选择当前节点；multiple模式不要求修饰键。', key: 'Enter / Space' },
			{ description: '展开当前节点全部同级branch。', key: '*' },
			{ description: 'multiple模式选择完整logical tree。', key: 'Ctrl/Cmd+A' },
			{ description: '按当前locale标签前缀移动active。', key: 'Printable characters' }
		],
		parts: [
			{ description: '完整tree焦点owner或虚拟viewport。', name: 'root' },
			{ description: '可见treeitem视觉内容。', name: 'item' },
			{ description: 'branch展开、加载或重试指示。', name: 'switcher' },
			{ description: 'checkbox选择样式的视觉标记。', name: 'selection' },
			{ description: '空树状态。', name: 'empty' }
		],
		props: [
			{
				default: '[]',
				description: '非受控模式下的初始展开key集合。',
				name: 'defaultExpandedKeys',
				type: 'readonly TKey[]'
			},
			{
				default: '[]',
				description: '非受控模式下的初始选择key集合。',
				name: 'defaultSelectedKeys',
				type: 'readonly TKey[]'
			},
			{
				default: '必填',
				description: '完整扁平业务节点；parentKey建立层级，hasChildren声明未加载branch。',
				name: 'nodes',
				required: true,
				type: 'readonly TreeNode<TKey>[]',
				members: [
					{
						description: '节点唯一业务key；保留TKey类型身份。',
						name: 'key',
						type: 'TKey',
						required: true
					},
					{ description: '显示标签。', name: 'label', type: 'string', required: true },
					{ description: '父节点key；根节点省略。', name: 'parentKey', type: 'TKey' },
					{ description: '声明存在尚未加载的子节点。', name: 'hasChildren', type: 'boolean' },
					{ description: '禁用该节点。', name: 'disabled', type: 'boolean' },
					{ description: '禁止选择但允许导航。', name: 'selectionDisabled', type: 'boolean' },
					{
						description: '搜索/typeahead文本；省略时回退label。',
						name: 'textValue',
						type: 'string'
					}
				]
			},
			{
				default: 'Provider localePack.collection.empty',
				description: 'nodes为空且未提供empty snippet时的空树文本。',
				name: 'emptyText',
				type: 'string'
			},
			{
				bindable: true,
				default: '[]',
				description: '受控或非受控展开key集合。',
				name: 'expandedKeys',
				type: 'readonly TKey[]'
			},
			{
				bindable: true,
				default: '[]',
				description: '受控或非受控选择key集合；异步缺失key保持不丢失。',
				name: 'selectedKeys',
				type: 'readonly TKey[]'
			},
			{
				default: "'single'",
				description: '选择策略；active与selection始终独立。',
				name: 'selectionMode',
				type: "'none' | 'single' | 'multiple'"
			},
			{
				default: "'highlight'",
				description: '高亮或checkbox视觉；当前checkbox为strict key选择，不级联或伪造half-check。',
				name: 'selectionStyle',
				type: "'highlight' | 'checkbox'"
			},
			{
				default: 'false',
				description: '阻止清空最后一个选择。',
				name: 'disallowEmptySelection',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '禁用整个Tree交互与表单值。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: "'tree'",
				description: '独立shell或浮层内bare布局。',
				name: 'appearance',
				type: "'tree' | 'bare'"
			},
			{
				default: 'false',
				description: '复用ZVirtualList进行keyed窗口化。',
				name: 'virtualized',
				type: 'boolean'
			},
			{
				default: '36',
				description: '虚拟模式固定项高px。',
				name: 'itemSize',
				type: 'number'
			},
			{
				default: '320',
				description: '虚拟viewport高度px。',
				name: 'height',
				type: 'number'
			},
			{
				default: '4',
				description: '可见区前后额外挂载项数。',
				name: 'overscan',
				type: 'number'
			},
			{
				default: 'height',
				description: 'SSR首帧虚拟窗口估算高度。',
				name: 'ssrViewportSize',
				type: 'number'
			},
			{
				default: '最近祖先form',
				description: '关联原生form的id；与name一起提交选中的key。',
				name: 'form',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '重复提交每个selected key。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'true',
				description: '是否响应原生form reset。',
				name: 'resetOnForm',
				type: 'boolean'
			}
		],
		since: '0.2.0',
		snippets: [
			{
				description: '类型安全节点正文；层级、选择、加载和ARIA仍由Tree拥有。',
				name: 'item',
				type: 'Snippet<[TreeNode<TKey>, TreeEntry<TKey>]>'
			},
			{ description: '空树内容。', name: 'empty', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/tree/ZTree.svelte',
		states: [
			{ description: '当前容器active key。', name: 'data-active-key', values: ['typed key'] },
			{ description: '可导航但不可选择。', name: 'data-selection-disabled', values: ['true'] },
			{ description: 'branch展开状态。', name: 'aria-expanded', values: ['true', 'false'] },
			{ description: '选择状态。', name: 'aria-selected', values: ['true', 'false'] },
			{ description: 'lazy branch状态。', name: 'data-load-state', values: ['loading', 'error'] },
			{ description: 'ZVirtualList大数据模式。', name: 'data-virtualized', values: ['true'] }
		],
		status: 'stable',
		summary:
			'在LogicalCollection之上提供typed层级、容器焦点、选择、lazy请求与ZVirtualList握手的ARIA Tree。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts" generics="TKey extends SelectionKey">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Logical snapshots are immutable; request handles are lifecycle-owned. */
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Circle from '@lucide/svelte/icons/circle';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Square from '@lucide/svelte/icons/square';
	import SquareCheck from '@lucide/svelte/icons/square-check-big';
	import { onDestroy, untrack } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { ActiveDescendant } from '../../../runtime/collection/active-descendant.svelte.js';
	import {
		CollectionNavigation,
		isKeyboardComposing
	} from '../../../runtime/collection/collection-navigation.svelte.js';
	import {
		navigationIntent,
		type NavigationIntent
	} from '../../../runtime/collection/list-navigation.js';
	import { MountedElements } from '../../../runtime/collection/mounted-elements.svelte.js';
	import {
		SelectionModel,
		type SelectionChange
	} from '../../../runtime/collection/selection-model.js';
	import type { Selection } from '../../../runtime/collection/selection.js';
	import { Typeahead } from '../../../runtime/collection/typeahead.js';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import FormValueBridge from '../../../runtime/form/FormValueBridge.svelte';
	import { isDomElement } from '../../../runtime/layer/dom-realm.js';
	import { LogicalTree, type TreeEntry, type TreeNode } from '../../../runtime/tree.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import ZVirtualList from '../../data-display/ZVirtualList.svelte';
	import ZSpinner from '../../feedback/ZSpinner.svelte';

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.position.relative;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset._outer;
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			appearance: {
				bare: () => undefined,
				tree: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.padding._small;
				}
			},
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled }
		},
		defaultVariants: { appearance: 'tree', disabled: false }
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.boxSizing.borderBox;
			s.display.flex;
			s.gap._small;
			s.height._full;
			s.minHeight._medium;
			s.paddingBlock._small;
			s.paddingInlineEnd._small;
			s.userSelect.none;
		},
		variants: {
			active: { false: () => undefined, true: (s) => s.backgroundColor._surface },
			disabled: {
				false: (s) => s.cursor.pointer,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			selected: { false: () => undefined, true: (s) => s.color._primary }
		},
		defaultVariants: { active: false, disabled: false, selected: false }
	});
	const switcherRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.inlineFlex;
			s.flexShrink(0);
			s.justifyContent.center;
			s.minHeight._small;
			s.minWidth._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const stateRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.padding._large;
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [rootRecipe, itemRecipe, switcherRecipe, stateRecipe]) {
		registerRecipeHmr(import.meta, recipe);
	}

	let {
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		appearance = 'tree',
		class: className,
		controller = $bindable(null),
		defaultExpandedKeys = [],
		defaultSelectedKeys = [],
		disabled = false,
		disallowEmptySelection = false,
		empty: renderEmpty,
		emptyText,
		expandedKeys = $bindable(),
		form,
		height = 320,
		item: renderItem,
		itemSize = 36,
		name,
		nodes,
		onExpandedChange,
		onclick,
		onfocus,
		onkeydown,
		onLoadChildren,
		onLoadError,
		onpointermove,
		onSelectionChange,
		overscan = 4,
		ref = $bindable(null),
		resetOnForm = true,
		selectedKeys = $bindable(),
		selectionMode = 'single',
		selectionStyle = 'highlight',
		ssrViewportSize,
		style,
		virtualized = false,
		...rest
	}: ZTreeProps<TKey> = $props();

	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'tree'));
	const tree = $derived(new LogicalTree<TKey>(nodes));
	const resolvedAriaLabel = $derived.by(() => {
		if (!ariaLabel && !ariaLabelledBy) {
			throw new Error('ZTree requires aria-label or aria-labelledby.');
		}
		return ariaLabel;
	});
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.collection.empty);
	const expandedState = new ControllableState<readonly TKey[]>({
		defaultValue: () => normalizeKeys(defaultExpandedKeys, 'defaultExpandedKeys'),
		onChange: () => onExpandedChange,
		read: () => expandedKeys,
		write: (next) => (expandedKeys = next)
	});
	const selectedState = new ControllableState<readonly TKey[]>({
		defaultValue: () => normalizeSelection(defaultSelectedKeys),
		onChange: () => onSelectionChange,
		read: () => selectedKeys,
		write: (next) => (selectedKeys = next)
	});
	const expanded = $derived(new Set(normalizeKeys(expandedState.current, 'expandedKeys')));
	const selected = $derived(new Set(normalizeSelection(selectedState.current)));
	const treeView = $derived(tree.view(expanded));
	let activeKey = $state<TKey>();
	let virtualController = $state<ZVirtualListController<TKey> | null>(null);
	const mountedElements = new MountedElements<TKey>();
	const elementKeys = new WeakMap<HTMLElement, TKey>();
	const virtualBridge = {
		ensureKey(key: TKey, align: VirtualAlign = 'nearest'): void {
			virtualController?.ensureKey(key, align);
		},
		isRendered(key: TKey): boolean {
			return virtualized ? (virtualController?.isRendered(key) ?? false) : mountedElements.has(key);
		},
		scrollToKey(key: TKey, align: VirtualAlign = 'nearest'): void {
			virtualController?.scrollToKey(key, align);
		}
	};
	const navigation = new CollectionNavigation<TKey, TreeNode<TKey>>({
		direction: () => zui.direction,
		disabled: () => disabled,
		loop: () => false,
		orientation: () => 'vertical',
		readActive: () => activeKey,
		view: () => treeView.collection,
		writeActive: (key) => (activeKey = key)
	});
	const activeDescendant = new ActiveDescendant({
		idBase: () => idBase,
		mounted: mountedElements,
		navigation,
		virtualizer: virtualBridge
	});
	const activeId = $derived(activeDescendant.activeId);
	const selectionModel = new SelectionModel<TKey, TreeNode<TKey>>({
		collection: () => tree.collection,
		disallowEmpty: () => disallowEmptySelection,
		mode: () => selectionMode,
		read: () => selected,
		view: () => treeView.collection,
		write: commitSelection
	});
	const typeahead = new Typeahead<TKey>({ locale: () => zui.locale });
	const loadingKeys = new SvelteSet<TKey>();
	const errorKeys = new SvelteMap<TKey, unknown>();
	const loadedKeys = new Set<TKey>();
	const requests = new Map<
		TKey,
		{ readonly controller: AbortController; readonly generation: number }
	>();
	let loadGeneration = 0;

	const rootClass = $derived(zui.recipe(rootRecipe, { appearance, disabled }));
	const switcherClass = $derived(zui.recipe(switcherRecipe));
	const stateClass = $derived(zui.recipe(stateRecipe));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	const publicController: ZTreeController<TKey> = {
		get activeKey() {
			return activeDescendant.activeKey;
		},
		get errorKeys() {
			return Object.freeze([...errorKeys.keys()]);
		},
		get loadingKeys() {
			return Object.freeze([...loadingKeys]);
		},
		focusKey(key, options = {}) {
			return focusKey(key, options.expandAncestors ?? true);
		},
		getNode(key) {
			return tree.nodes.get(key);
		},
		retryLoad,
		scrollToKey
	};

	$effect(() => {
		controller = publicController;
		const publishedController = untrack(() => controller);
		return () => {
			if (untrack(() => controller) === publishedController) controller = null;
		};
	});

	$effect(() => {
		const allKeys = tree.collection.full.keys;
		const visibleKeys = treeView.keys;
		selected;
		disabled;
		onLoadChildren;
		activeDescendant.prune(allKeys);
		const retained = new Set(allKeys);
		for (const [key, request] of requests) {
			if (!disabled && onLoadChildren && retained.has(key)) continue;
			request.controller.abort();
			requests.delete(key);
			loadingKeys.delete(key);
			errorKeys.delete(key);
			loadedKeys.delete(key);
		}
		for (const entry of treeView.entries) {
			if (entry.childCount > 0) {
				loadedKeys.add(entry.key);
				errorKeys.delete(entry.key);
			}
		}
		if (visibleKeys.length === 0 || disabled) return;
		if (activeKey === undefined) {
			const selectedCandidate = treeView.entries.find(
				(entry) => selected.has(entry.key) && !entry.disabled
			)?.key;
			if (selectedCandidate !== undefined) activeDescendant.set(selectedCandidate, 'open');
			else activeDescendant.reconcile();
		} else {
			activeDescendant.reconcile();
		}
	});

	$effect(() => {
		if (!onLoadChildren || disabled) return;
		for (const entry of treeView.entries) {
			if (
				expanded.has(entry.key) &&
				entry.hasChildren &&
				entry.childCount === 0 &&
				!loadedKeys.has(entry.key) &&
				!loadingKeys.has(entry.key) &&
				!errorKeys.has(entry.key)
			) {
				void loadChildren(entry.node);
			}
		}
	});

	onDestroy(() => {
		for (const request of requests.values()) request.controller.abort();
		requests.clear();
		mountedElements.clear();
	});

	function normalizeKeys(values: readonly TKey[], name: string): readonly TKey[] {
		const seen = new Set<TKey>();
		const normalized: TKey[] = [];
		for (const key of values) {
			if (typeof key === 'number' && (!Number.isFinite(key) || Object.is(key, -0))) {
				throw new TypeError(`ZTree ${name} keys must be strings or finite numbers other than -0.`);
			}
			if (seen.has(key)) continue;
			seen.add(key);
			normalized.push(key);
		}
		return Object.freeze(normalized);
	}

	function normalizeSelection(values: readonly TKey[]): readonly TKey[] {
		const normalized = normalizeKeys(values, 'selected');
		if (selectionMode === 'none') return Object.freeze([]);
		return selectionMode === 'single' ? Object.freeze(normalized.slice(0, 1)) : normalized;
	}

	function orderedKeys(selection: Selection<TKey>): readonly TKey[] {
		const materialized =
			selection === 'all'
				? new Set(
						tree.collection.full.keys.filter((key) => {
							const item = tree.collection.get(key);
							return item && !item.disabled && !item.selectionDisabled;
						})
					)
				: new Set(selection);
		const known = tree.collection.full.keys.filter((key) => materialized.delete(key));
		return Object.freeze([...known, ...materialized]);
	}

	function commitSelection(change: SelectionChange<TKey>): void {
		selectedState.setFromUser(orderedKeys(change.selection));
	}

	function orderedExpanded(keys: ReadonlySet<TKey>): readonly TKey[] {
		const remaining = new Set(keys);
		const known = tree.collection.full.keys.filter((key) => remaining.delete(key));
		return Object.freeze([...known, ...remaining]);
	}

	function setExpanded(key: TKey, next: boolean): boolean {
		const entry = treeView.get(key) ?? tree.view(new Set(tree.collection.full.keys)).get(key);
		if (!entry?.hasChildren || entry.disabled || disabled) return false;
		const keys = new Set(expanded);
		if (next) keys.add(key);
		else {
			keys.delete(key);
			if (activeKey !== undefined && tree.isDescendant(activeKey, key)) {
				activeDescendant.set(key, 'collection-change');
			}
		}
		expandedState.setFromUser(orderedExpanded(keys));
		if (next && entry.childCount === 0 && entry.node.hasChildren) void loadChildren(entry.node);
		return true;
	}

	function toggleExpanded(entry: TreeEntry<TKey>): void {
		if (errorKeys.has(entry.key)) {
			retryLoad(entry.key);
			return;
		}
		setExpanded(entry.key, !expanded.has(entry.key));
	}

	function expandSiblings(entry: TreeEntry<TKey>): void {
		const keys = new Set(expanded);
		const siblings = tree.childrenOf(entry.parentKey);
		const allEntries = tree.view(new Set(tree.collection.full.keys));
		let changed = false;
		for (const node of siblings) {
			const sibling = allEntries.get(node.key);
			if (!sibling?.hasChildren || sibling.disabled || keys.has(node.key)) continue;
			keys.add(node.key);
			changed = true;
			if (sibling.childCount === 0 && sibling.node.hasChildren) void loadChildren(sibling.node);
		}
		if (changed) expandedState.setFromUser(orderedExpanded(keys));
	}

	function selectKey(key: TKey, extend = false): void {
		if (selectionMode === 'none' || disabled) return;
		if (extend && selectionMode === 'multiple') selectionModel.extend(key);
		else selectionModel.toggle(key);
	}

	function focusKey(key: TKey, expandAncestors: boolean): boolean {
		if (!tree.has(key) || tree.collection.get(key)?.disabled || disabled) return false;
		if (expandAncestors) {
			const next = new Set(expanded);
			for (const ancestor of tree.pathTo(key).slice(0, -1)) next.add(ancestor.key);
			if (next.size !== expanded.size) expandedState.setFromUser(orderedExpanded(next));
		}
		queueMicrotask(() => {
			activeDescendant.set(key, 'programmatic');
			ref?.focus({ preventScroll: true });
		});
		return true;
	}

	function scrollToKey(key: TKey, align: VirtualAlign = 'nearest'): boolean {
		if (!tree.has(key)) return false;
		if (virtualized) return virtualController?.scrollToKey(key, align) ?? false;
		const element = mountedElements.get(key)?.element;
		if (!element) return false;
		element.scrollIntoView({ block: align === 'center' ? 'center' : align, inline: 'nearest' });
		return true;
	}

	async function loadChildren(node: TreeNode<TKey>, retry = false): Promise<void> {
		if (!onLoadChildren || disabled || requests.has(node.key)) return;
		if (!retry && loadedKeys.has(node.key)) return;
		const AbortControllerConstructor = ref?.ownerDocument.defaultView?.AbortController;
		if (!AbortControllerConstructor) return;
		const abortController = new AbortControllerConstructor();
		const generation = (loadGeneration += 1);
		requests.set(node.key, { controller: abortController, generation });
		loadingKeys.add(node.key);
		errorKeys.delete(node.key);
		try {
			await onLoadChildren(node, { key: node.key, signal: abortController.signal });
			if (requests.get(node.key)?.generation !== generation || abortController.signal.aborted)
				return;
			loadedKeys.add(node.key);
		} catch (error) {
			if (requests.get(node.key)?.generation !== generation || abortController.signal.aborted)
				return;
			errorKeys.set(node.key, error);
			onLoadError?.(node.key, error);
		} finally {
			if (requests.get(node.key)?.generation === generation) {
				requests.delete(node.key);
				loadingKeys.delete(node.key);
			}
		}
	}

	function retryLoad(key: TKey): boolean {
		const node = tree.nodes.get(key);
		if (!node?.hasChildren || requests.has(key) || !onLoadChildren) return false;
		loadedKeys.delete(key);
		errorKeys.delete(key);
		void loadChildren(node, true);
		return true;
	}

	function mountItem(key: TKey, element: HTMLElement): () => void {
		elementKeys.set(element, key);
		const cleanup = activeDescendant.mount(key, element);
		return () => {
			elementKeys.delete(element);
			cleanup();
		};
	}

	function mountTreeItem(element: HTMLElement, key: TKey): { destroy(): void } {
		return { destroy: mountItem(key, element) };
	}

	function eventEntry(
		event: MouseEvent | PointerEvent,
		currentTarget: HTMLDivElement
	): { readonly element: HTMLElement; readonly entry: TreeEntry<TKey> } | undefined {
		if (!isDomElement(event.target)) return undefined;
		const element = event.target.closest<HTMLElement>('[role="treeitem"]');
		if (!element || !currentTarget.contains(element)) return undefined;
		const key = elementKeys.get(element);
		const entry = key === undefined ? undefined : treeView.get(key);
		return entry ? { element, entry } : undefined;
	}

	function handleRootPointerMove(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		onpointermove?.(event);
		if (event.defaultPrevented) return;
		const match = eventEntry(event, event.currentTarget);
		if (match && !match.entry.disabled && !disabled) {
			activeDescendant.set(match.entry.key, 'pointer');
		}
	}

	function handleRootClick(event: MouseEvent & { currentTarget: HTMLDivElement }): void {
		onclick?.(event);
		if (event.defaultPrevented) return;
		const match = eventEntry(event, event.currentTarget);
		if (!match) return;
		const { element, entry } = match;
		if (entry.disabled || disabled) return;
		activeDescendant.set(entry.key, 'pointer');
		ref?.focus({ preventScroll: true });
		const target = isDomElement(event.target)
			? event.target.closest('[data-slot="switcher"]')
			: null;
		if (target && element.contains(target)) toggleExpanded(entry);
		else selectKey(entry.key, event.shiftKey);
	}

	function handleFocus(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		onfocus?.(event);
		if (!event.defaultPrevented && activeDescendant.activeKey === undefined) {
			activeDescendant.reconcile();
		}
	}

	function move(intent: NavigationIntent, extend: boolean): void {
		const key = activeDescendant.move(intent);
		if (key !== undefined && extend && selectionMode === 'multiple') selectionModel.extend(key);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented || disabled || isKeyboardComposing(event)) return;
		if (activeDescendant.activeKey === undefined) activeDescendant.reconcile();
		const currentKey = activeDescendant.activeKey;
		const entry = currentKey === undefined ? undefined : treeView.get(currentKey);
		const intent = navigationIntent(event.key, 'vertical');
		if (intent) {
			event.preventDefault();
			move(intent, event.shiftKey);
			return;
		}
		if (!entry) return;
		const expandKey = zui.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
		const collapseKey = zui.direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
		if (event.key === expandKey) {
			if (!entry.hasChildren) return;
			event.preventDefault();
			if (errorKeys.has(entry.key)) {
				retryLoad(entry.key);
				return;
			}
			if (!expanded.has(entry.key)) setExpanded(entry.key, true);
			else {
				const child = tree.childrenOf(entry.key).find((node) => !node.disabled);
				if (child) activeDescendant.set(child.key, 'keyboard');
			}
			return;
		}
		if (event.key === collapseKey) {
			if (!expanded.has(entry.key) && entry.parentKey === undefined) return;
			event.preventDefault();
			if (expanded.has(entry.key)) setExpanded(entry.key, false);
			else if (entry.parentKey !== undefined) activeDescendant.set(entry.parentKey, 'keyboard');
			return;
		}
		switch (event.key) {
			case 'Enter':
			case ' ':
				event.preventDefault();
				selectKey(entry.key, event.shiftKey);
				return;
			case '*':
				event.preventDefault();
				expandSiblings(entry);
				return;
			default: {
				if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
					if (selectionMode === 'multiple') {
						event.preventDefault();
						selectionModel.selectAll();
					}
					return;
				}
				const match = typeahead.search(
					event.key,
					treeView.entries.map((item) => ({
						disabled: item.disabled,
						key: item.key,
						textValue: item.textValue
					})),
					entry.key
				);
				if (match !== undefined) {
					event.preventDefault();
					activeDescendant.set(match, 'keyboard');
				}
			}
		}
	}

	function cssLength(value: number | string): string {
		return typeof value === 'number' ? `${value}px` : value;
	}

	function itemPadding(entry: TreeEntry<TKey>): string {
		if (typeof zui.theme.space.medium === 'number' && typeof zui.theme.space.large === 'number') {
			return `${zui.theme.space.medium + (entry.level - 1) * zui.theme.space.large}px`;
		}
		const base = cssLength(zui.theme.space.medium);
		if (entry.level === 1) return base;
		const indent = cssLength(zui.theme.space.large);
		return `calc(${[base, ...Array.from({ length: entry.level - 1 }, () => indent)].join(' + ')})`;
	}
</script>

{#snippet emptyState()}
	<div class={stateClass} data-slot="empty" role="status">
		{#if renderEmpty}{@render renderEmpty()}{:else}{resolvedEmptyText}{/if}
	</div>
{/snippet}

{#snippet itemBody(entry: TreeEntry<TKey>)}
	<div
		class={zui.recipe(itemRecipe, {
			active: Object.is(entry.key, activeDescendant.activeKey),
			disabled: disabled || entry.disabled,
			selected: selected.has(entry.key)
		})}
		data-slot="item"
		data-active={Object.is(entry.key, activeDescendant.activeKey) || undefined}
		data-selected={selected.has(entry.key) || undefined}
		data-selection-disabled={entry.selectionDisabled || undefined}
		data-load-state={loadingKeys.has(entry.key)
			? 'loading'
			: errorKeys.has(entry.key)
				? 'error'
				: undefined}
		style={`padding-inline-start: ${itemPadding(entry)};`}
	>
		<span class={switcherClass} data-slot="switcher" aria-hidden="true">
			{#if loadingKeys.has(entry.key)}
				<ZSpinner aria-hidden="true" size="small" tone="inherit" />
			{:else if errorKeys.has(entry.key)}
				<RotateCcw size={15} />
			{:else if entry.hasChildren}
				{#if expanded.has(entry.key)}
					<ChevronDown size={15} />
				{:else if zui.direction === 'rtl'}
					<ChevronLeft size={15} />
				{:else}
					<ChevronRight size={15} />
				{/if}
			{:else}
				<Circle fill="currentColor" size={6} />
			{/if}
		</span>
		{#if selectionStyle === 'checkbox' && selectionMode !== 'none' && !entry.selectionDisabled}
			<span data-slot="selection" aria-hidden="true">
				{#if selected.has(entry.key)}<SquareCheck size={16} />{:else}<Square size={16} />{/if}
			</span>
		{/if}
		{#if renderItem}{@render renderItem(entry.node, entry)}{:else}<span>{entry.label}</span>{/if}
		{#if errorKeys.has(entry.key)}
			<span data-slot="load-error" role="status" aria-live="polite"
				>{zui.localePack.collection.treeLoadError(entry.label)}</span
			>
		{/if}
	</div>
{/snippet}

{#if virtualized}
	<ZVirtualList
		{...rest}
		aria-label={resolvedAriaLabel}
		aria-labelledby={ariaLabelledBy}
		aria-activedescendant={activeId}
		aria-busy={loadingKeys.size > 0 || undefined}
		aria-disabled={disabled || undefined}
		aria-multiselectable={selectionMode === 'multiple' || undefined}
		bind:controller={virtualController}
		bind:ref
		class={[rootClass, className]}
		data-active-key={activeDescendant.activeKey === undefined
			? undefined
			: String(activeDescendant.activeKey)}
		data-virtualized="true"
		{height}
		itemDisabled={(entry) => disabled || entry.disabled}
		itemExpanded={(entry) => (entry.hasChildren ? expanded.has(entry.key) : undefined)}
		itemId={(entry) => activeDescendant.idFor(entry.key)}
		itemKey={(entry) => entry.key}
		itemLevel={(entry) => entry.level}
		itemPosInSet={(entry) => entry.posInSet}
		itemRole="treeitem"
		itemSelected={(entry) => (selectionMode === 'none' ? undefined : selected.has(entry.key))}
		itemSetSize={(entry) => entry.setSize}
		{itemSize}
		items={treeView.entries}
		onItemMount={mountItem}
		{overscan}
		role="tree"
		{ssrViewportSize}
		style={initialStyle}
		tabindex={disabled ? undefined : 0}
		onclick={handleRootClick}
		onfocus={handleFocus}
		onkeydown={handleKeydown}
		onpointermove={handleRootPointerMove}
	>
		{#snippet item(entry)}{@render itemBody(entry)}{/snippet}
		{#snippet empty()}{@render emptyState()}{/snippet}
	</ZVirtualList>
{:else}
	<div
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		role="tree"
		aria-label={resolvedAriaLabel}
		aria-labelledby={ariaLabelledBy}
		aria-activedescendant={activeId}
		aria-busy={loadingKeys.size > 0 || undefined}
		aria-disabled={disabled || undefined}
		aria-multiselectable={selectionMode === 'multiple' || undefined}
		data-active-key={activeDescendant.activeKey === undefined
			? undefined
			: String(activeDescendant.activeKey)}
		tabindex={disabled ? undefined : 0}
		onclick={handleRootClick}
		onfocus={handleFocus}
		onkeydown={handleKeydown}
		onpointermove={handleRootPointerMove}
	>
		{#each treeView.entries as entry (entry.key)}
			<div
				id={activeDescendant.idFor(entry.key)}
				role="treeitem"
				aria-disabled={entry.disabled || undefined}
				aria-expanded={entry.hasChildren ? expanded.has(entry.key) : undefined}
				aria-level={entry.level}
				aria-posinset={entry.posInSet}
				aria-selected={selectionMode === 'none' ? undefined : selected.has(entry.key)}
				aria-setsize={entry.setSize}
				data-key={String(entry.key)}
				use:mountTreeItem={entry.key}
			>
				{@render itemBody(entry)}
			</div>
		{/each}
		{#if treeView.entries.length === 0}{@render emptyState()}{/if}
	</div>
{/if}

{#if name || resetOnForm}
	<FormValueBridge
		{form}
		{name}
		{disabled}
		onReset={resetOnForm
			? () => {
					expandedState.reset();
					selectedState.reset();
					selectionModel.resetTransient();
					activeKey = undefined;
				}
			: () => undefined}
		value={orderedKeys(selected)}
	/>
{/if}
