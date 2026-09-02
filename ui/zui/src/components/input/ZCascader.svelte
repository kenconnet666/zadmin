<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey as PublicSelectionKey } from '../../runtime/collection/selection.js';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { TreeNode as PublicTreeNode } from '../../runtime/tree.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	import type { TreeLoadContext } from '../compound/tree/ZTree.svelte';

	export type CascaderFilter<TKey extends PublicSelectionKey = PublicSelectionKey> = (
		path: readonly PublicTreeNode<TKey>[],
		query: string
	) => boolean;

	export interface ZCascaderProps<
		TKey extends PublicSelectionKey = PublicSelectionKey
	> extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly clearable?: boolean;
		readonly clearLabel?: string;
		readonly controlId?: string;
		readonly defaultOpen?: boolean;
		readonly defaultValue?: readonly TKey[];
		readonly disabled?: boolean;
		readonly emptyText?: string;
		readonly filter?: CascaderFilter<TKey>;
		readonly form?: string;
		readonly gutter?: number;
		readonly invalid?: boolean;
		readonly loading?: boolean;
		readonly loadingText?: string;
		readonly matchWidth?: boolean;
		readonly name?: string;
		readonly nodes: readonly PublicTreeNode<TKey>[];
		readonly onLoadChildren?: (
			node: PublicTreeNode<TKey>,
			context: TreeLoadContext<TKey>
		) => Promise<void> | void;
		readonly onLoadError?: (key: TKey, error: unknown) => void;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (path: readonly TKey[]) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
		readonly placeholder?: string;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly searchable?: boolean;
		readonly searchLimit?: number;
		readonly searchPlaceholder?: string;
		readonly separator?: string;
		readonly serializeValue?: (path: readonly TKey[]) => string;
		readonly size?: ZControlSize;
		value?: readonly TKey[];
		readonly virtual?: boolean;
		readonly virtualHeight?: number;
		readonly virtualItemSize?: number;
		readonly virtualOverscan?: number;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'cascader',
		importStatement: "import { ZCascader } from '@zadmin/zui';",
		name: 'ZCascader',
		bindings: [
			{ description: '当前完整typed路径。', name: 'value', type: 'readonly SelectionKey[]' },
			{ description: 'Popover打开状态。', name: 'open', type: 'boolean' },
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'LogicalTree',
			'LogicalCollection',
			'CollectionNavigation',
			'ActiveDescendant',
			'ZVirtualList',
			'ZPopover',
			'FormValueBridge'
		],
		events: [
			{
				description: '选择叶节点或清空后返回完整typed路径。',
				name: 'onValueChange',
				type: '(path: readonly SelectionKey[]) => void'
			},
			{
				description: 'Popover打开状态变化。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			},
			{
				description: 'lazy branch加载失败；组件保留可重试状态。',
				name: 'onLoadError',
				type: '(key: SelectionKey, error: unknown) => void'
			}
		],
		keyboard: [
			{
				description: '在当前列的enabled节点间移动active。',
				key: 'ArrowUp / ArrowDown / Home / End'
			},
			{ description: '按逻辑方向进入子列，RTL自动翻转。', key: 'ArrowRight / ArrowLeft' },
			{ description: '推进branch、重试错误或提交叶节点。', key: 'Enter / Space' },
			{ description: '按Provider locale在当前列typeahead。', key: 'Typeahead' },
			{ description: 'Trigger清空已选路径。', key: 'Delete / Backspace' }
		],
		parts: [
			{ description: '路径与Popover trigger。', name: 'trigger' },
			{ description: '清空路径操作。', name: 'clear' },
			{ description: 'loaded路径筛选输入。', name: 'search' },
			{ description: '横向逐级列容器。', name: 'columns' },
			{ description: '独立active-descendant listbox列。', name: 'column' },
			{ description: '列option正文。', name: 'item-content' },
			{ description: 'loading、empty、lazy error公告。', name: 'status' }
		],
		props: [
			{
				default: '必填',
				description: '扁平typed层级事实源；支持hasChildren声明lazy branch。',
				name: 'nodes',
				required: true,
				type: 'readonly TreeNode[]'
			},
			{
				bindable: true,
				default: '[]',
				description: '完整路径；string "1"和number 1保持不同，异步缺失尾部可保留。',
				name: 'value',
				type: 'readonly SelectionKey[]'
			},
			{
				default: '[]',
				description: '非受控初始路径与form reset目标。',
				name: 'defaultValue',
				type: 'readonly SelectionKey[]'
			},
			{
				default: 'true',
				description: '显示独立清空操作并支持Trigger上的删除键。',
				name: 'clearable',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '筛选当前已经加载的完整叶子路径。',
				name: 'searchable',
				type: 'boolean'
			},
			{
				default: '50',
				description: 'loaded路径筛选最多展示的正整数结果数。',
				name: 'searchLimit',
				type: 'number'
			},
			{ default: 'false', description: '启用每列固定行窗口化。', name: 'virtual', type: 'boolean' },
			{
				default: '240',
				description: '每列虚拟viewport高度px。',
				name: 'virtualHeight',
				type: 'number'
			},
			{
				default: '36',
				description: '虚拟option固定行高px。',
				name: 'virtualItemSize',
				type: 'number'
			},
			{
				default: '4',
				description: '每列虚拟窗口前后额外挂载项数。',
				name: 'virtualOverscan',
				type: 'number'
			},
			{
				default: "' / '",
				description: 'Trigger和搜索路径标签分隔符。',
				name: 'separator',
				type: 'string'
			},
			{
				default: "path.map(String).join('/')",
				description: 'FormValueBridge单值序列化。',
				name: 'serializeValue',
				type: '(path: readonly SelectionKey[]) => string'
			},
			{
				default: 'false',
				description: '保留焦点、路径和FormData，禁止打开、清空与选择。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '保留已加载列并投射aria-busy，阻止写入。',
				name: 'loading',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '禁用Trigger、路径交互和FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Field context',
				description: 'FormValueBridge字段名。',
				name: 'name',
				type: 'string'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZCascader.svelte',
		states: [
			{ description: 'Popover打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '整个控件只读。', name: 'data-readonly', values: ['true'] },
			{ description: '整个控件正在加载。', name: 'data-loading', values: ['true'] },
			{ description: '路径无效。', name: 'data-invalid', values: ['true'] },
			{ description: '当前解析尺寸。', name: 'data-size', values: ['small', 'medium', 'large'] }
		],
		status: 'experimental',
		summary:
			'按列推进的typed单路径Cascader，复用LogicalTree、每列Collection导航、lazy owner、loaded-path搜索、固定行虚拟化和统一表单合同。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts" generics="TKey extends SelectionKey">
	/* eslint-disable svelte/prefer-svelte-reactivity -- request registries and label caches are imperative lifecycle state. */
	import X from '@lucide/svelte/icons/x';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import { LogicalTree, type TreeNode } from '../../runtime/tree.js';
	import ZButton from '../gene/ZButton.svelte';
	import ZVisuallyHidden from '../gene/ZVisuallyHidden.svelte';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import CascaderColumn, {
		type CascaderColumnController,
		type CascaderColumnItem
	} from './CascaderColumn.svelte';
	import ZInput from './ZInput.svelte';

	interface CascaderColumnModel<TKey extends SelectionKey> {
		readonly items: readonly CascaderColumnItem<TKey>[];
		readonly parentKey: TKey | undefined;
	}

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.inlineFlex;
			s.gap._small;
			s.maxWidth._full;
		},
		variants: {
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled }
		},
		defaultVariants: { disabled: false }
	});
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.flexDirection.column;
			s.gap._small;
			s.maxWidth.raw('min(92vw, 64rem)');
		},
		variants: {},
		defaultVariants: {}
	});
	const columnsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.stretch;
			s.display.flex;
			s.maxWidth._full;
			s.overflow.auto;
			s._selector('& > [data-slot="column"] + [data-slot="column"]', (column) => {
				column.borderInlineStartColor._border;
				column.borderInlineStartStyle.solid;
				column.borderInlineStartWidth._hairline;
			});
		},
		variants: {},
		defaultVariants: {}
	});
	for (const recipe of [rootRecipe, contentRecipe, columnsRecipe])
		registerRecipeHmr(import.meta, recipe);

	function assertKey(key: SelectionKey, name: string): void {
		if (typeof key === 'string') return;
		if (typeof key !== 'number' || !Number.isFinite(key) || Object.is(key, -0)) {
			throw new TypeError(`${name} keys must be strings or finite numbers other than -0.`);
		}
	}
	function normalizePath<TPathKey extends SelectionKey>(
		source: readonly TPathKey[],
		name: string
	): readonly TPathKey[] {
		const keys = new Set<TPathKey>();
		const result: TPathKey[] = [];
		for (const key of source) {
			assertKey(key, name);
			if (keys.has(key)) throw new TypeError(`${name} cannot repeat a key.`);
			keys.add(key);
			result.push(key);
		}
		return Object.freeze(result);
	}
	function keyIdentity(key: SelectionKey): string {
		return `${typeof key}:${String(key)}`;
	}
	function pathIdentity(path: readonly SelectionKey[]): string {
		return path.map(keyIdentity).join('\u0000');
	}
	function samePath(left: readonly SelectionKey[], right: readonly SelectionKey[]): boolean {
		return left.length === right.length && left.every((key, index) => Object.is(key, right[index]));
	}

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		clearable = true,
		clearLabel,
		class: className,
		controlId,
		defaultOpen = false,
		defaultValue = [],
		disabled = false,
		emptyText,
		filter,
		form,
		gutter = 4,
		invalid,
		loading = false,
		loadingText,
		matchWidth = false,
		name,
		nodes,
		onLoadChildren,
		onLoadError,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placement = 'bottom-start',
		placeholder,
		readonly = false,
		ref = $bindable(null),
		required = false,
		searchable = false,
		searchLimit = 50,
		searchPlaceholder,
		separator = ' / ',
		serializeValue = (path) => path.map(String).join('/'),
		size,
		style,
		value = $bindable(),
		virtual = false,
		virtualHeight = 240,
		virtualItemSize = 36,
		virtualOverscan = 4,
		...rest
	}: ZCascaderProps<TKey> = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'cascader'));
	const resolvedControlId = $derived(controlId ?? field?.controlId ?? `${idBase}-trigger`);
	const resolvedPlaceholder = $derived(placeholder ?? zui.localePack.collection.selectPath);
	const resolvedSearchPlaceholder = $derived(searchPlaceholder ?? resolvedPlaceholder);
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.collection.empty);
	const resolvedLoadingText = $derived(loadingText ?? zui.localePack.collection.loading);
	const resolvedClearLabel = $derived(clearLabel ?? zui.localePack.common.clear);
	const resolvedDisabled = $derived(disabled || field?.disabled || false);
	const resolvedReadonly = $derived(readonly || field?.readonly || false);
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedRequired = $derived(required || field?.required || false);
	const resolvedName = $derived(name ?? field?.name);
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const tree = $derived(new LogicalTree<TKey>(nodes));
	const labelCache = new Map<TKey, string>();
	const valueState = new ControllableState<readonly TKey[]>({
		defaultValue: () => normalizePath(defaultValue, 'ZCascader defaultValue'),
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
	const resolvedValue = $derived(normalizePath(valueState.current, 'ZCascader value'));
	const resolvedOpen = $derived(openState.current && !resolvedDisabled && !resolvedReadonly);
	let draft = $state<readonly TKey[]>(canonicalLoadedPath(untrack(() => resolvedValue)));
	let query = $state('');
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let observedValueIdentity = $state(pathIdentity(untrack(() => resolvedValue)));
	let loadGeneration = 0;
	let loadStatus = $state('');
	const loadingKeys = new SvelteSet<TKey>();
	const errorKeys = new SvelteMap<TKey, unknown>();
	const requests = new Map<
		TKey,
		{ readonly controller: AbortController; readonly generation: number }
	>();
	const columnControllers = new Map<number, CascaderColumnController<TKey>>();
	const rootClass = $derived(zui.recipe(rootRecipe, { disabled: resolvedDisabled }));
	const contentClass = $derived(zui.recipe(contentRecipe));
	const columnsClass = $derived(zui.recipe(columnsRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const levelFormatter = $derived(new Intl.NumberFormat(zui.locale));

	$effect(() => {
		for (const node of nodes) labelCache.set(node.key, node.label);
	});
	$effect(() => {
		const identity = pathIdentity(resolvedValue);
		if (identity === observedValueIdentity) return;
		observedValueIdentity = identity;
		if (resolvedOpen) draft = canonicalLoadedPath(resolvedValue);
	});
	$effect(() => {
		const retained = new Set(tree.nodes.keys());
		for (const [key, request] of requests) {
			if (retained.has(key) && !resolvedDisabled && !resolvedReadonly && onLoadChildren) continue;
			request.controller.abort();
			requests.delete(key);
			loadingKeys.delete(key);
		}
	});

	function canonicalLoadedPath(source: readonly TKey[]): readonly TKey[] {
		const result: TKey[] = [];
		for (const key of source) {
			const node = tree.nodes.get(key);
			if (!node) break;
			const parent = result.at(-1);
			if (result.length === 0 ? node.parentKey !== undefined : !Object.is(node.parentKey, parent))
				break;
			result.push(key);
		}
		return Object.freeze(result);
	}
	function pathLabel(path: readonly TKey[]): string {
		return path
			.map((key) => tree.nodes.get(key)?.label ?? labelCache.get(key) ?? String(key))
			.join(separator);
	}
	const triggerLabel = $derived(
		resolvedValue.length === 0 ? resolvedPlaceholder : pathLabel(resolvedValue)
	);
	const serializedValue = $derived(
		resolvedValue.length === 0 ? undefined : serializeValue(resolvedValue)
	);
	const searchQuery = $derived(query.trim());
	const searching = $derived(searchable && searchQuery.length > 0);
	const searchResults = $derived.by(() => {
		if (!searching) return Object.freeze([]) as readonly CascaderColumnItem<TKey>[];
		if (!Number.isInteger(searchLimit) || searchLimit < 1)
			throw new TypeError('ZCascader searchLimit must be a positive integer.');
		const result: CascaderColumnItem<TKey>[] = [];
		for (const node of nodes) {
			if (tree.childrenOf(node.key).length > 0 || node.hasChildren) continue;
			const path = tree.pathTo(node.key);
			const matches = filter
				? filter(path, searchQuery)
				: path.some((entry) =>
						(entry.textValue ?? entry.label)
							.toLocaleLowerCase(zui.locale)
							.includes(searchQuery.toLocaleLowerCase(zui.locale))
					);
			if (!matches) continue;
			result.push({
				disabled: path.some((entry) => entry.disabled),
				hasChildren: false,
				key: node.key,
				label: path.map(({ label }) => label).join(separator),
				textValue: path.map((entry) => entry.textValue ?? entry.label).join(' ')
			});
			if (result.length >= searchLimit) break;
		}
		return Object.freeze(result);
	});
	function columnItems(parentKey: TKey | undefined): readonly CascaderColumnItem<TKey>[] {
		const ancestorDisabled =
			parentKey !== undefined && tree.pathTo(parentKey).some((entry) => entry.disabled);
		return Object.freeze(
			tree.childrenOf(parentKey).map((node) => ({
				disabled: ancestorDisabled || (node.disabled ?? false),
				hasChildren: tree.childrenOf(node.key).length > 0 || node.hasChildren === true,
				key: node.key,
				label: node.label,
				loadState: loadingKeys.has(node.key)
					? ('loading' as const)
					: errorKeys.has(node.key)
						? ('error' as const)
						: undefined,
				textValue: node.textValue ?? node.label
			}))
		);
	}
	const columns = $derived.by(() => {
		if (searching) {
			return Object.freeze([
				{ items: searchResults, parentKey: undefined }
			]) as readonly CascaderColumnModel<TKey>[];
		}
		const result: CascaderColumnModel<TKey>[] = [
			{ items: columnItems(undefined), parentKey: undefined }
		];
		for (const key of draft) {
			const children = columnItems(key);
			if (children.length === 0) break;
			result.push({ items: children, parentKey: key });
		}
		return Object.freeze(result);
	});

	function setOpen(next: boolean): void {
		if (next && (resolvedDisabled || resolvedReadonly)) return;
		if (next) draft = canonicalLoadedPath(resolvedValue);
		else query = '';
		openState.setFromUser(next);
	}
	function commitPath(path: readonly TreeNode<TKey>[]): void {
		const keys = Object.freeze(path.map(({ key }) => key));
		draft = keys;
		if (!samePath(resolvedValue, keys)) valueState.setFromUser(keys);
		setOpen(false);
	}
	async function loadChildren(node: TreeNode<TKey>, retry = false): Promise<void> {
		if (
			!onLoadChildren ||
			resolvedDisabled ||
			resolvedReadonly ||
			loading ||
			requests.has(node.key)
		)
			return;
		if (!retry && tree.childrenOf(node.key).length > 0) return;
		const AbortControllerConstructor = ref?.ownerDocument.defaultView?.AbortController;
		if (!AbortControllerConstructor) return;
		const controller = new AbortControllerConstructor();
		const generation = (loadGeneration += 1);
		requests.set(node.key, { controller, generation });
		loadingKeys.add(node.key);
		errorKeys.delete(node.key);
		loadStatus = zui.localePack.collection.treeLoading(node.label);
		try {
			await onLoadChildren(node, { key: node.key, signal: controller.signal });
			if (requests.get(node.key)?.generation !== generation || controller.signal.aborted) return;
			loadStatus = '';
		} catch (error) {
			if (requests.get(node.key)?.generation !== generation || controller.signal.aborted) return;
			errorKeys.set(node.key, error);
			loadStatus = zui.localePack.collection.treeLoadError(node.label);
			onLoadError?.(node.key, error);
		} finally {
			if (requests.get(node.key)?.generation === generation) {
				requests.delete(node.key);
				loadingKeys.delete(node.key);
			}
		}
	}
	function choose(item: CascaderColumnItem<TKey>, level: number): void {
		if (resolvedDisabled || resolvedReadonly || loading || item.disabled) return;
		const node = tree.nodes.get(item.key);
		if (!node) return;
		const path = tree.pathTo(node.key);
		draft = Object.freeze(path.map(({ key }) => key));
		if (item.loadState === 'error') {
			void loadChildren(node, true).then(() =>
				queueMicrotask(() => columnControllers.get(level + 1)?.focus())
			);
			return;
		}
		if (item.hasChildren) {
			if (tree.childrenOf(node.key).length === 0) {
				void loadChildren(node).then(() =>
					queueMicrotask(() => columnControllers.get(level + 1)?.focus())
				);
			} else queueMicrotask(() => columnControllers.get(level + 1)?.focus());
			return;
		}
		commitPath(path);
	}
	function focusParent(level: number): void {
		const parentKey = draft[level - 1];
		columnControllers.get(level - 1)?.focus(parentKey);
	}
	function registerColumnController(
		level: number,
		controller: CascaderColumnController<TKey> | null
	): void {
		if (controller) columnControllers.set(level, controller);
		else columnControllers.delete(level);
	}
	function clear(): void {
		if (!clearable || resolvedDisabled || resolvedReadonly || resolvedValue.length === 0) return;
		const empty = Object.freeze([]) as readonly TKey[];
		draft = empty;
		query = '';
		valueState.setFromUser(empty);
		setOpen(false);
		triggerRef?.focus({ preventScroll: true });
	}
	function resetFromForm(): void {
		valueState.reset();
		openState.reset();
		draft = canonicalLoadedPath(normalizePath(defaultValue, 'ZCascader defaultValue'));
		query = '';
		loadStatus = '';
	}
	function abortRequests(): void {
		for (const request of requests.values()) request.controller.abort();
		requests.clear();
		loadingKeys.clear();
	}
	function handleTriggerKeydown(event: KeyboardEvent): void {
		if (
			clearable &&
			!resolvedDisabled &&
			!resolvedReadonly &&
			resolvedValue.length > 0 &&
			(event.key === 'Backspace' || event.key === 'Delete')
		) {
			event.preventDefault();
			clear();
		}
	}
	function handleSearchKeydown(event: KeyboardEvent): void {
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		event.preventDefault();
		columnControllers.get(0)?.focus();
	}

	onMount(() => fieldOwner.registerFocusOwner(() => triggerRef?.focus({ preventScroll: true })));
	onDestroy(abortRequests);
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	data-disabled={resolvedDisabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-loading={loading || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-size={resolvedSize}
	data-state={resolvedOpen ? 'open' : 'closed'}
>
	<ZPopover
		{gutter}
		{matchWidth}
		modal={false}
		onOpenChange={setOpen}
		open={resolvedOpen}
		{placement}
		triggerId={resolvedControlId}
	>
		<ZPopoverTrigger
			bind:ref={triggerRef}
			aria-describedby={resolvedDescribedBy}
			aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
			aria-label={resolvedLabelledBy ? undefined : ariaLabel}
			aria-labelledby={resolvedLabelledBy}
			data-slot="trigger"
			data-required={resolvedRequired || undefined}
			disabled={resolvedDisabled}
			id={resolvedControlId}
			onkeydown={handleTriggerKeydown}
			popupRole="listbox"
			size={resolvedSize}
			variant="secondary"
		>
			{triggerLabel}
		</ZPopoverTrigger>
		<ZPopoverContent ariaLabelledBy={null} role="presentation">
			<div class={contentClass} data-slot="content">
				{#if searchable}
					<ZInput
						aria-controls={`${idBase}-column-1`}
						aria-label={resolvedSearchPlaceholder}
						bind:value={query}
						data-slot="search"
						disabled={loading}
						name=""
						onkeydown={handleSearchKeydown}
						placeholder={resolvedSearchPlaceholder}
						resetOnForm={false}
						size="small"
					/>
				{/if}
				<div class={columnsClass} data-slot="columns">
					{#each columns as column, level (`${idBase}:${searching ? 'search' : `${level}:${column.parentKey === undefined ? 'root' : keyIdentity(column.parentKey)}`}`)}
						<CascaderColumn
							busy={loading || column.items.some(({ loadState }) => loadState === 'loading')}
							columnId={`${idBase}-column-${level + 1}`}
							disabled={resolvedDisabled || resolvedReadonly || loading}
							emptyText={resolvedEmptyText}
							items={column.items}
							label={zui.localePack.collection.cascaderLevel(levelFormatter.format(level + 1))}
							{level}
							loadingText={resolvedLoadingText}
							onChoose={(item) => choose(item, level)}
							onControllerChange={registerColumnController}
							onFocusParent={focusParent}
							selectedKey={searching ? resolvedValue.at(-1) : draft[level]}
							{virtual}
							{virtualHeight}
							{virtualItemSize}
							{virtualOverscan}
						/>
					{/each}
				</div>
				<ZVisuallyHidden aria-atomic="true" aria-live="polite" data-slot="status" role="status">
					{#if loadStatus}{loadStatus}{:else if searching}{zui.localePack.collection.searchResults(
							levelFormatter.format(searchResults.length)
						)}{:else if loading}{resolvedLoadingText}{/if}
				</ZVisuallyHidden>
			</div>
		</ZPopoverContent>
	</ZPopover>
	{#if clearable && resolvedValue.length > 0 && !resolvedDisabled && !resolvedReadonly}
		<ZButton
			aria-label={resolvedClearLabel}
			data-slot="clear"
			onclick={clear}
			shape="square"
			size={resolvedSize}
			title={resolvedClearLabel}
			variant="secondary"
		>
			<X aria-hidden="true" size={16} />
		</ZButton>
	{/if}
</div>
<FormValueBridge
	disabled={resolvedDisabled}
	{form}
	name={resolvedName}
	value={serializedValue}
	onReset={resetFromForm}
/>
