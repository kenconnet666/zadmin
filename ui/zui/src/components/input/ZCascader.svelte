<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import type { TreeNode } from '../../runtime/tree.js';
	import type { PopoverPlacement } from '../compound/popover/ZPopover.svelte';
	export interface ZCascaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		readonly defaultOpen?: boolean;
		readonly defaultValue?: readonly SelectionKey[];
		readonly disabled?: boolean;
		readonly form?: string;
		readonly name?: string;
		readonly nodes: readonly TreeNode[];
		readonly onOpenChange?: (open: boolean) => void;
		readonly onValueChange?: (path: readonly SelectionKey[]) => void;
		open?: boolean;
		readonly placeholder?: string;
		readonly placement?: PopoverPlacement;
		ref?: HTMLDivElement | null;
		readonly separator?: string;
		readonly serializeValue?: (path: readonly SelectionKey[]) => string;
		value?: readonly SelectionKey[];
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'cascader',
		importStatement: "import { ZCascader } from '@zadmin/zui';",
		name: 'ZCascader',
		bindings: [
			{ description: '当前完整路径。', name: 'value', type: 'readonly SelectionKey[]' },
			{ description: '打开状态。', name: 'open', type: 'boolean' }
		],
		dependencies: ['TreeIndex', 'layered listboxes', 'ZPopover', 'FormValue'],
		events: [
			{
				description: '选择叶节点后返回完整路径。',
				name: 'onValueChange',
				type: '(path: readonly SelectionKey[]) => void'
			},
			{ description: '打开变化。', name: 'onOpenChange', type: '(open: boolean) => void' }
		],
		keyboard: [
			{ description: '同列移动。', key: 'ArrowUp / ArrowDown / Home / End' },
			{ description: '进入子列。', key: 'ArrowRight' },
			{ description: '返回父列。', key: 'ArrowLeft' },
			{ description: '推进父节点或提交叶节点。', key: 'Enter / Space' }
		],
		parts: [
			{ description: '路径Trigger。', name: 'trigger' },
			{ description: '逐级listbox列。', name: 'column' },
			{ description: '层级option。', name: 'item' }
		],
		props: [
			{
				default: '必填',
				description: '扁平层级nodes。',
				name: 'nodes',
				required: true,
				type: 'readonly TreeNode[]'
			},
			{
				bindable: true,
				default: '[]',
				description: '完整选择路径。',
				name: 'value',
				type: 'readonly SelectionKey[]'
			},
			{
				default: '[]',
				description: '非受控初始路径。',
				name: 'defaultValue',
				type: 'readonly SelectionKey[]'
			},
			{ default: "' / '", description: 'Trigger标签分隔符。', name: 'separator', type: 'string' },
			{
				default: "path.join('/')",
				description: '表单序列化。',
				name: 'serializeValue',
				type: '(path: readonly SelectionKey[]) => string'
			},
			{ default: 'false', description: '禁用。', name: 'disabled', type: 'boolean' },
			{ default: 'undefined', description: '表单字段名。', name: 'name', type: 'string' }
		],
		since: '0.4.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZCascader.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '按列推进层级、只在叶节点提交完整路径的Cascader。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { listenForFormReset } from '../../runtime/form/form-control.svelte.js';
	import { createTreeIndex } from '../../runtime/tree.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import ZPopover from '../compound/popover/ZPopover.svelte';
	import ZPopoverTrigger from '../compound/popover/ZPopoverTrigger.svelte';
	import ZPopoverContent from '../compound/popover/ZPopoverContent.svelte';
	const columnsRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.gap._small;
			s.overflow.auto;
		},
		variants: {},
		defaultVariants: {}
	});
	const columnRecipe = defineRecipe({
		base: (s) => {
			s.borderInlineEndStyle.solid;
			s.borderInlineEndWidth._hairline;
			s.minWidth._menu;
			s.paddingInlineEnd._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.color._text;
			s.cursor.pointer;
			s.display.flex;
			s.justifyContent.spaceBetween;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s.userSelect.none;
			s.width.percent(100);
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(-2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			active: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._surface;
					s.color._primary;
				}
			},
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			}
		},
		defaultVariants: { active: false, disabled: false }
	});
	registerRecipeHmr(import.meta, columnsRecipe);
	registerRecipeHmr(import.meta, columnRecipe);
	registerRecipeHmr(import.meta, itemRecipe);
	let {
		class: className,
		defaultOpen = false,
		defaultValue = [],
		disabled = false,
		form,
		name,
		nodes,
		onOpenChange,
		onValueChange,
		open = $bindable(),
		placeholder = 'Select a path',
		placement = 'bottom-start',
		ref = $bindable(null),
		separator = ' / ',
		serializeValue = (path) => path.map(String).join('/'),
		style,
		value = $bindable(),
		...rest
	}: ZCascaderProps = $props();
	const zui = useZui();
	const tree = $derived(createTreeIndex(nodes));
	let draft = $state<readonly SelectionKey[]>(Object.freeze([...untrack(() => defaultValue)]));
	let proxy = $state<HTMLInputElement | null>(null);
	// DOM references are an imperative focus cache, not reactive application state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const options = new Map<string, HTMLDivElement>();
	const valueState = new ControllableState<readonly SelectionKey[]>({
		defaultValue: () => Object.freeze([...defaultValue]),
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
	const columns = $derived.by(() => {
		const result: (readonly TreeNode[])[] = [tree.children.get(undefined) ?? []];
		for (const key of draft) {
			const children = tree.children.get(key) ?? [];
			if (children.length === 0) break;
			result.push(children);
		}
		return result;
	});
	const triggerLabel = $derived(
		valueState.current.length === 0
			? placeholder
			: valueState.current.map((key) => tree.nodes.get(key)?.label ?? String(key)).join(separator)
	);
	const columnsClass = $derived(zui.recipe(columnsRecipe));
	const columnClass = $derived(zui.recipe(columnRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() => {
		if (!proxy) return;
		return listenForFormReset(proxy, () => valueState.reset());
	});
	function setOpen(next: boolean): void {
		if (disabled) return;
		if (next) draft = Object.freeze([...valueState.current]);
		openState.setFromUser(next);
	}
	function choose(level: number, node: TreeNode): void {
		if (disabled || node.disabled) return;
		const next = Object.freeze([...draft.slice(0, level), node.key]);
		draft = next;
		if ((tree.children.get(node.key)?.length ?? 0) === 0) {
			valueState.setFromUser(next);
			openState.setFromUser(false);
		}
	}
	function buttonKey(level: number, key: SelectionKey): string {
		return `${level}:${typeof key}:${String(key)}`;
	}
	function registerOption(
		node: HTMLDivElement,
		registration: { key: SelectionKey; level: number }
	) {
		let current = registration;
		options.set(buttonKey(current.level, current.key), node);
		return {
			destroy() {
				options.delete(buttonKey(current.level, current.key));
			},
			update(next: { key: SelectionKey; level: number }) {
				options.delete(buttonKey(current.level, current.key));
				current = next;
				options.set(buttonKey(current.level, current.key), node);
			}
		};
	}
	function focus(level: number, key: SelectionKey): void {
		options.get(buttonKey(level, key))?.focus({ preventScroll: true });
	}
	function isTabStop(level: number, node: TreeNode): boolean {
		const enabled = columns[level]?.filter((entry) => !entry.disabled) ?? [];
		const selected = enabled.find((entry) => Object.is(entry.key, draft[level])) ?? enabled[0];
		return selected !== undefined && Object.is(selected.key, node.key);
	}
	function handleKey(event: KeyboardEvent, level: number, nodeIndex: number): void {
		const siblings = columns[level]?.filter((node) => !node.disabled) ?? [];
		const node = columns[level]?.[nodeIndex];
		if (!node) return;
		const current = siblings.findIndex((entry) => Object.is(entry.key, node.key));
		if (
			event.key === 'ArrowDown' ||
			event.key === 'ArrowUp' ||
			event.key === 'Home' ||
			event.key === 'End'
		) {
			event.preventDefault();
			const target =
				event.key === 'Home'
					? siblings[0]
					: event.key === 'End'
						? siblings.at(-1)
						: siblings[
								Math.max(
									0,
									Math.min(siblings.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1))
								)
							];
			if (target) focus(level, target.key);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			choose(level, node);
			const child = tree.children.get(node.key)?.find((entry) => !entry.disabled);
			if (child) queueMicrotask(() => focus(level + 1, child.key));
		} else if (event.key === 'ArrowLeft' && level > 0) {
			event.preventDefault();
			const parent = draft[level - 1];
			if (parent !== undefined) focus(level - 1, parent);
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			choose(level, node);
		}
	}
	const serialized = $derived(
		valueState.current.length === 0 ? '' : serializeValue(valueState.current)
	);
</script>

<div
	{...rest}
	bind:this={ref}
	class={className}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
>
	<ZPopover gutter={4} modal={false} onOpenChange={setOpen} open={openState.current} {placement}>
		<ZPopoverTrigger
			{disabled}
			popupRole="listbox"
			variant="secondary"
			data-state={openState.current ? 'open' : 'closed'}>{triggerLabel}</ZPopoverTrigger
		>
		<ZPopoverContent ariaLabelledBy={null} role="presentation">
			<div class={columnsClass}>
				{#each columns as column, level (level)}
					<div class={columnClass} role="listbox" aria-label={`Level ${level + 1}`}>
						{#each column as node, nodeIndex (node.key)}
							<div
								use:registerOption={{ key: node.key, level }}
								class={zui.recipe(itemRecipe, {
									active: Object.is(draft[level], node.key),
									disabled: node.disabled ?? false
								})}
								role="option"
								aria-selected={Object.is(draft[level], node.key)}
								aria-disabled={node.disabled || undefined}
								tabindex={isTabStop(level, node) ? 0 : -1}
								onclick={() => choose(level, node)}
								onkeydown={(event) => handleKey(event, level, nodeIndex)}
							>
								<span>{node.label}</span><span aria-hidden="true"
									>{(tree.children.get(node.key)?.length ?? 0) > 0 ? '›' : ''}</span
								>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</ZPopoverContent>
	</ZPopover>
	<input bind:this={proxy} aria-hidden="true" tabindex={-1} type="hidden" disabled {form} />
	{#if name && !disabled}<input type="hidden" {form} {name} value={serialized} />{/if}
</div>
