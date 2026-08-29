<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { SelectEvent } from './context.svelte.js';
	export interface ZSelectItemProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'role'
	> {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly onSelect?: (event: SelectEvent) => void;
		ref?: HTMLDivElement | null;
		readonly textValue?: string;
		readonly value: SelectionKey;
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'select-item',
		importStatement: "import { ZSelectItem } from '@zadmin/zui';",
		name: 'ZSelectItem',
		bindings: [{ description: '真实option引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZSelect', 'Collection', 'RovingFocus'],
		events: [
			{
				description: '选择前收到可取消事件。',
				name: 'onSelect',
				type: '(event: SelectEvent) => void'
			}
		],
		keyboard: [{ description: '选择并关闭listbox。', key: 'Enter / Space' }],
		parts: [],
		props: [
			{
				default: '必填',
				description: '稳定选择值。',
				name: 'value',
				required: true,
				type: 'string | number'
			},
			{
				default: 'textContent',
				description: 'Trigger标签和typeahead文本。',
				name: 'textValue',
				type: 'string'
			},
			{ default: 'false', description: '禁用并跳过导航。', name: 'disabled', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实option引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.4.0',
		snippets: [{ description: 'Option标签。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/select/ZSelectItem.svelte',
		states: [
			{ description: '选择状态。', name: 'data-state', values: ['selected', 'unselected'] },
			{ description: 'roving焦点项。', name: 'data-highlighted', values: ['true'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] }
		],
		status: 'experimental',
		summary: '注册稳定值、option语义、roving focus与可取消选择的Select Item。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { useZSelect } from './context.svelte.js';
	const recipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.cursor.pointer;
			s.display.flex;
			s.gap._medium;
			s.justifyContent.spaceBetween;
			s.paddingBlock._small;
			s.paddingInline._medium;
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
			highlighted: { false: () => undefined, true: (s) => s.backgroundColor._surface },
			selected: { false: () => undefined, true: (s) => s.color._primary }
		},
		defaultVariants: { disabled: false, highlighted: false, selected: false }
	});
	registerRecipeHmr(import.meta, recipe);
	let {
		children,
		class: className,
		disabled = false,
		onclick,
		onfocus,
		onkeydown,
		onpointermove,
		onSelect,
		ref = $bindable(null),
		style,
		textValue,
		value,
		...rest
	}: ZSelectItemProps = $props();
	const zui = useZui();
	const select = useZSelect();
	const selected = $derived(Object.is(select.value, value));
	const highlighted = $derived(Object.is(select.roving.currentKey, value));
	const rootClass = $derived(
		zui.recipe(recipe, { disabled: disabled || select.disabled, highlighted, selected })
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const resolvedDisabled = $derived(disabled || select.disabled);
	$effect(() =>
		select.register(() => ({
			disabled: resolvedDisabled,
			element: ref,
			key: value,
			textValue:
				textValue ?? ref?.querySelector('[data-slot="label"]')?.textContent?.trim() ?? String(value)
		}))
	);
	function activate(event: MouseEvent | KeyboardEvent): void {
		if (!resolvedDisabled) select.choose(value, event, onSelect);
	}
	function handleClick(event: MouseEvent & { currentTarget: HTMLDivElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) activate(event);
	}
	function handleFocus(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		select.roving.set(value);
		onfocus?.(event);
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }): void {
		onkeydown?.(event);
		if (!event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			activate(event);
		}
	}
	function handlePointerMove(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		onpointermove?.(event);
		if (!event.defaultPrevented && !resolvedDisabled) select.roving.set(value, true);
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="option"
	aria-disabled={resolvedDisabled || undefined}
	aria-selected={selected}
	tabindex={resolvedDisabled ? -1 : select.roving.tabIndex(value)}
	data-disabled={resolvedDisabled || undefined}
	data-highlighted={highlighted || undefined}
	data-state={selected ? 'selected' : 'unselected'}
	onclick={handleClick}
	onfocus={handleFocus}
	onkeydown={handleKeydown}
	onpointermove={handlePointerMove}
>
	<span data-slot="label">{@render children?.()}</span><span aria-hidden="true"
		>{selected ? '✓' : ''}</span
	>
</div>
