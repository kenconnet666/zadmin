<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { TreeNode } from '../../../runtime/tree.js';
	export type TreeSelectionMode = 'multiple' | 'none' | 'single';
	export interface ZTreeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
		readonly appearance?: 'bare' | 'tree';
		readonly defaultExpandedKeys?: readonly SelectionKey[];
		readonly defaultSelectedKeys?: readonly SelectionKey[];
		readonly disabled?: boolean;
		expandedKeys?: readonly SelectionKey[];
		readonly form?: string;
		readonly name?: string;
		readonly nodes: readonly TreeNode[];
		readonly onExpandedChange?: (keys: readonly SelectionKey[]) => void;
		readonly onSelectionChange?: (keys: readonly SelectionKey[]) => void;
		ref?: HTMLDivElement | null;
		selectedKeys?: readonly SelectionKey[];
		readonly selectionMode?: TreeSelectionMode;
		readonly height?: number;
		readonly itemSize?: number;
		readonly overscan?: number;
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
			{ description: '真实tree引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['TreeIndex', 'selection', 'typeahead', 'fixed-size virtualizer'],
		events: [
			{
				description: '展开变化后调用。',
				name: 'onExpandedChange',
				type: '(keys: readonly SelectionKey[]) => void'
			},
			{
				description: '选择变化后调用。',
				name: 'onSelectionChange',
				type: '(keys: readonly SelectionKey[]) => void'
			}
		],
		keyboard: [
			{ description: '在可见节点移动。', key: 'ArrowUp / ArrowDown / Home / End' },
			{ description: '展开或进入首个子节点。', key: 'ArrowRight' },
			{ description: '折叠或返回父节点。', key: 'ArrowLeft' },
			{ description: '选择当前节点。', key: 'Enter / Space' },
			{ description: '按标签前缀移动。', key: 'Printable characters' }
		],
		parts: [{ description: '可见treeitem。', name: 'item' }],
		props: [
			{
				default: "'tree'",
				description: '独立Tree shell或浮层内bare布局。',
				name: 'appearance',
				type: "'tree' | 'bare'"
			},
			{
				default: '必填',
				description: '扁平节点与parentKey关系。',
				name: 'nodes',
				required: true,
				type: 'readonly TreeNode[]'
			},
			{
				bindable: true,
				default: '[]',
				description: '展开key。',
				name: 'expandedKeys',
				type: 'readonly SelectionKey[]'
			},
			{
				bindable: true,
				default: '[]',
				description: '选择key。',
				name: 'selectedKeys',
				type: 'readonly SelectionKey[]'
			},
			{
				default: "'single'",
				description: '选择模式。',
				name: 'selectionMode',
				type: "'none' | 'single' | 'multiple'"
			},
			{ default: 'false', description: '禁用全部交互与提交。', name: 'disabled', type: 'boolean' },
			{
				default: 'undefined',
				description: '选择值重复使用的表单字段名。',
				name: 'name',
				type: 'string'
			},
			{
				default: 'false',
				description: '启用固定itemSize大数据窗口化。',
				name: 'virtualized',
				type: 'boolean'
			},
			{
				default: '36 / 320 / 4',
				description: '虚拟项高、viewport高度与overscan。',
				name: 'itemSize / height / overscan',
				type: 'number'
			}
		],
		since: '0.4.0',
		snippets: [],
		source: 'ui/zui/src/components/compound/tree/ZTree.svelte',
		states: [
			{ description: '展开状态。', name: 'aria-expanded', values: ['true', 'false'] },
			{ description: '选择状态。', name: 'aria-selected', values: ['true', 'false'] },
			{ description: '虚拟大数据模式。', name: 'data-virtualized', values: ['true'] }
		],
		status: 'experimental',
		summary: '基于扁平节点索引的ARIA Tree，拥有展开、选择、typeahead、键盘与表单合同。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Sets are immutable derived snapshots. */
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Circle from '@lucide/svelte/icons/circle';
	import { onMount, untrack } from 'svelte';
	import { ControllableState } from '../../../runtime/foundation/controllable-state.svelte.js';
	import { formReset } from '../../../runtime/form/form-control.svelte.js';
	import { serializeFormValue } from '../../../runtime/form/form-value.js';
	import { createTreeIndex } from '../../../runtime/tree.js';
	import {
		navigationIntent,
		type NavigationIntent
	} from '../../../runtime/collection/list-navigation.js';
	import { Typeahead } from '../../../runtime/collection/typeahead.js';
	import {
		calculateVirtualRange,
		virtualScrollOffset
	} from '../../../runtime/collection/virtualizer.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	const rootRecipe = defineRecipe({
		base: () => undefined,
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
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled },
			virtualized: {
				false: () => undefined,
				true: (s) => {
					s.height.raw('var(--zui-tree-height)');
					s.overflow.auto;
					s.position.relative;
				}
			}
		},
		defaultVariants: { appearance: 'tree', disabled: false, virtualized: false }
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.cursor.pointer;
			s.display.flex;
			s.gap._small;
			s.paddingBlock._small;
			s.paddingInline._small;
			s.userSelect.none;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(-2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			focused: { false: () => undefined, true: (s) => s.backgroundColor._surface },
			selected: { false: () => undefined, true: (s) => s.color._primary },
			virtualized: {
				false: () => undefined,
				true: (s) => {
					s.insetInlineStart.px(0);
					s.position.absolute;
					s.width.percent(100);
				}
			}
		},
		defaultVariants: { disabled: false, focused: false, selected: false, virtualized: false }
	});
	const spacerRecipe = defineRecipe({
		base: () => undefined,
		variants: {
			virtualized: {
				false: (s) => s.display.contents,
				true: (s) => {
					s.height.raw('var(--zui-tree-total-size)');
					s.position.relative;
				}
			}
		},
		defaultVariants: { virtualized: false }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, itemRecipe);
	registerRecipeHmr(import.meta, spacerRecipe);
	const unique = (keys: readonly SelectionKey[]) => Object.freeze([...new Set(keys)]);
	let {
		appearance = 'tree',
		class: className,
		defaultExpandedKeys = [],
		defaultSelectedKeys = [],
		disabled = false,
		expandedKeys = $bindable(),
		form,
		height = 320,
		itemSize = 36,
		name,
		nodes,
		onExpandedChange,
		onSelectionChange,
		overscan = 4,
		ref = $bindable(null),
		selectedKeys = $bindable(),
		selectionMode = 'single',
		style,
		virtualized = false,
		...rest
	}: ZTreeProps = $props();
	const zui = useZui();
	const CollapsedIcon = $derived(zui.direction === 'rtl' ? ChevronLeft : ChevronRight);
	const elements = $state<(HTMLDivElement | null)[]>([]);
	let focusKey = $state<SelectionKey>();
	let proxy = $state<HTMLInputElement | null>(null);
	let scrollOffset = $state(0);
	let viewportSize = $state(untrack(() => height));
	const index = $derived(createTreeIndex(nodes));
	const expandedState = new ControllableState<readonly SelectionKey[]>({
		defaultValue: () => unique(defaultExpandedKeys),
		onChange: () => onExpandedChange,
		read: () => expandedKeys,
		write: (next) => (expandedKeys = next)
	});
	const selectedState = new ControllableState<readonly SelectionKey[]>({
		defaultValue: () => unique(defaultSelectedKeys),
		onChange: () => onSelectionChange,
		read: () => selectedKeys,
		write: (next) => (selectedKeys = next)
	});
	const expanded = $derived(new Set(expandedState.current));
	const selected = $derived(new Set(selectedState.current));
	const visible = $derived(index.flatten(expanded));
	const enabled = $derived(
		visible
			.map((entry, itemIndex) => ({ entry, itemIndex }))
			.filter(({ entry }) => !disabled && !entry.disabled)
	);
	const resolvedFocusKey = $derived(
		enabled.some(({ entry }) => Object.is(entry.key, focusKey))
			? focusKey
			: (enabled.find(({ entry }) => selected.has(entry.key))?.entry.key ?? enabled[0]?.entry.key)
	);
	const typeahead = new Typeahead<SelectionKey>({ locale: zui.locale });
	const virtualRange = $derived.by(() =>
		virtualized
			? calculateVirtualRange({
					count: visible.length,
					itemSize,
					overscan,
					scrollOffset,
					viewportSize
				})
			: {
					endIndex: visible.length,
					items: Object.freeze([]),
					startIndex: 0,
					totalSize: visible.length * itemSize
				}
	);
	const rendered = $derived(
		virtualized
			? virtualRange.items.map((virtual) => ({ entry: visible[virtual.index]!, ...virtual }))
			: visible.map((entry, itemIndex) => ({
					end: 0,
					entry,
					index: itemIndex,
					size: 0,
					start: 0
				}))
	);
	const rootClass = $derived(zui.recipe(rootRecipe, { appearance, disabled, virtualized }));
	const spacerClass = $derived(zui.recipe(spacerRecipe, { virtualized }));
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-tree-height': `${height}px`,
		'--zui-tree-total-size': `${virtualRange.totalSize}px`
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	function resetFromForm(): void {
		expandedState.reset();
		selectedState.reset();
	}
	onMount(() => {
		if (!ref || !virtualized) return;
		const observer = new ResizeObserver(() => {
			if (ref) viewportSize = ref.clientHeight;
		});
		observer.observe(ref);
		const initialIndex = visible.findIndex((entry) => Object.is(entry.key, resolvedFocusKey));
		if (initialIndex >= 0) {
			const offset = virtualScrollOffset(initialIndex, {
				count: visible.length,
				itemSize,
				viewportSize,
				align: 'nearest'
			});
			ref.scrollTop = offset;
			scrollOffset = offset;
		}
		return () => observer.disconnect();
	});
	function focus(key: SelectionKey): void {
		const itemIndex = visible.findIndex((entry) => Object.is(entry.key, key));
		if (itemIndex < 0 || visible[itemIndex]?.disabled || disabled) return;
		focusKey = key;
		if (virtualized && ref) {
			const offset = virtualScrollOffset(itemIndex, {
				count: visible.length,
				currentOffset: ref.scrollTop,
				itemSize,
				viewportSize,
				align: 'nearest'
			});
			ref.scrollTop = offset;
			scrollOffset = offset;
		}
		if (virtualized) queueMicrotask(() => elements[itemIndex]?.focus({ preventScroll: true }));
		else elements[itemIndex]?.focus({ preventScroll: true });
	}
	function toggleExpanded(key: SelectionKey): void {
		if (disabled) return;
		const next = new Set(expanded);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		expandedState.setFromUser(Object.freeze([...next]));
	}
	function select(key: SelectionKey): void {
		const entry = visible.find((candidate) => Object.is(candidate.key, key));
		if (!entry || entry.disabled || disabled || selectionMode === 'none') return;
		const next =
			selectionMode === 'single'
				? [key]
				: selected.has(key)
					? [...selected].filter((entryKey) => !Object.is(entryKey, key))
					: [...selected, key];
		selectedState.setFromUser(Object.freeze(next));
	}
	function move(intent: NavigationIntent): void {
		const current = enabled.findIndex(({ entry }) => Object.is(entry.key, resolvedFocusKey));
		const offset =
			intent === 'first'
				? 0
				: intent === 'last'
					? enabled.length - 1
					: current + (intent === 'next' ? 1 : -1);
		const target = enabled[Math.max(0, Math.min(enabled.length - 1, offset))];
		if (target) focus(target.entry.key);
	}
	function handleKeydown(event: KeyboardEvent, entry: (typeof visible)[number]): void {
		const intent = navigationIntent(event.key, 'vertical');
		if (intent) {
			event.preventDefault();
			move(intent);
			return;
		}
		switch (event.key) {
			case 'ArrowRight':
				if (entry.childCount === 0) return;
				event.preventDefault();
				if (!expanded.has(entry.key)) toggleExpanded(entry.key);
				else {
					const child = index.children.get(entry.key)?.find((node) => !node.disabled);
					if (child) focus(child.key);
				}
				return;
			case 'ArrowLeft':
				event.preventDefault();
				if (expanded.has(entry.key)) toggleExpanded(entry.key);
				else if (entry.parentKey !== undefined) focus(entry.parentKey);
				return;
			case 'Enter':
			case ' ':
				event.preventDefault();
				select(entry.key);
				return;
			default: {
				const match = typeahead.search(
					event.key,
					visible.map((item) => ({
						disabled: item.disabled,
						key: item.key,
						textValue: item.label
					})),
					resolvedFocusKey
				);
				if (match !== undefined) {
					event.preventDefault();
					focus(match);
				}
			}
		}
	}
	const serializedSelected = $derived(
		selectedState.current.flatMap((key) => {
			const value = serializeFormValue(key);
			return value === undefined ? [] : [value];
		})
	);
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="tree"
	aria-disabled={disabled || undefined}
	aria-multiselectable={selectionMode === 'multiple' || undefined}
	data-virtualized={virtualized || undefined}
	data-range-start={virtualRange.startIndex}
	data-range-end={virtualRange.endIndex}
	onscroll={(event) => (scrollOffset = event.currentTarget.scrollTop)}
>
	<div class={spacerClass} data-slot="spacer">
		{#each rendered as virtual (virtual.entry.key)}
			{@const entry = virtual.entry}
			{@const itemIndex = virtual.index}
			<div
				bind:this={elements[itemIndex]}
				class={zui.recipe(itemRecipe, {
					disabled: disabled || entry.disabled,
					focused: Object.is(entry.key, resolvedFocusKey),
					selected: selected.has(entry.key),
					virtualized
				})}
				style={`padding-inline-start: ${8 + (entry.level - 1) * 16}px;${virtualized ? ` height: ${virtual.size}px; transform: translateY(${virtual.start}px);` : ''}`}
				role="treeitem"
				aria-level={entry.level}
				aria-posinset={entry.position}
				aria-setsize={entry.setSize}
				aria-disabled={entry.disabled || undefined}
				aria-expanded={entry.childCount > 0 ? expanded.has(entry.key) : undefined}
				aria-selected={selectionMode === 'none' ? undefined : selected.has(entry.key)}
				tabindex={Object.is(entry.key, resolvedFocusKey) ? 0 : -1}
				data-key={String(entry.key)}
				onclick={() => select(entry.key)}
				ondblclick={() => {
					if (entry.childCount > 0) toggleExpanded(entry.key);
				}}
				onfocus={() => (focusKey = entry.key)}
				onkeydown={(event) => handleKeydown(event, entry)}
			>
				<span aria-hidden="true">
					{#if entry.childCount > 0}
						{#if expanded.has(entry.key)}<ChevronDown size={15} />{:else}<CollapsedIcon
								size={15}
							/>{/if}
					{:else}
						<Circle fill="currentColor" size={6} />
					{/if}
				</span><span>{entry.label}</span>
			</div>
		{/each}
	</div>
</div>
<input
	bind:this={proxy}
	aria-hidden="true"
	tabindex={-1}
	type="hidden"
	disabled
	{form}
	use:formReset={resetFromForm}
/>
{#if name && !disabled}{#each serializedSelected as value (value)}<input
			type="hidden"
			{form}
			{name}
			{value}
		/>{/each}{/if}
