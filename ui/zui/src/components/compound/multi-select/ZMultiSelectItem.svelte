<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { MultiSelectEvent } from './context.svelte.js';
	export interface ZMultiSelectItemProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'role'
	> {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly onSelect?: (event: MultiSelectEvent) => void;
		ref?: HTMLDivElement | null;
		readonly textValue?: string;
		readonly value: SelectionKey;
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'multi-select-item',
		importStatement: "import { ZMultiSelectItem } from '@zadmin/zui';",
		name: 'ZMultiSelectItem',
		bindings: [{ description: '真实option引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZMultiSelect', 'Collection'],
		events: [
			{
				description: 'toggle前收到可取消事件。',
				name: 'onSelect',
				type: '(event: MultiSelectEvent) => void'
			}
		],
		keyboard: [{ description: 'toggle且保持listbox打开。', key: 'Enter / Space' }],
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
				description: '标签与typeahead文本。',
				name: 'textValue',
				type: 'string'
			},
			{ default: 'false', description: '禁用。', name: 'disabled', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实option引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'Option标签。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/multi-select/ZMultiSelectItem.svelte',
		states: [{ description: '选择状态。', name: 'data-state', values: ['selected', 'unselected'] }],
		status: 'experimental',
		summary: 'toggle多选值并保持Content打开的option。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { untrack } from 'svelte';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { useZMultiSelect } from './context.svelte.js';
	const recipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderRadius._small;
			s.cursor.pointer;
			s.display.flex;
			s.justifyContent.spaceBetween;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s.userSelect.none;
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
	}: ZMultiSelectItemProps = $props();
	const zui = useZui();
	const multi = useZMultiSelect();
	const resolvedDisabled = $derived(disabled || multi.disabled);
	const selected = $derived(multi.isSelected(value));
	const highlighted = $derived(Object.is(multi.roving.currentKey, value));
	const rootClass = $derived(
		zui.recipe(recipe, { disabled: resolvedDisabled, highlighted, selected })
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() =>
		multi.register(() => ({
			disabled: resolvedDisabled,
			element: ref,
			key: value,
			textValue:
				textValue ?? ref?.querySelector('[data-slot="label"]')?.textContent?.trim() ?? String(value)
		}))
	);
	function activate(event: MouseEvent | KeyboardEvent): void {
		if (!resolvedDisabled) multi.toggle(value, event, onSelect);
	}
	function handleClick(event: MouseEvent & { currentTarget: HTMLDivElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented) activate(event);
	}
	function handleFocus(event: FocusEvent & { currentTarget: HTMLDivElement }): void {
		multi.roving.set(value);
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
		if (!event.defaultPrevented && !resolvedDisabled) multi.roving.set(value, true);
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
	tabindex={resolvedDisabled ? -1 : multi.roving.tabIndex(value)}
	data-highlighted={highlighted || undefined}
	data-state={selected ? 'selected' : 'unselected'}
	onclick={handleClick}
	onfocus={handleFocus}
	onkeydown={handleKeydown}
	onpointermove={handlePointerMove}
>
	<span data-slot="label">{@render children?.()}</span><span aria-hidden="true"
		>{#if selected}<Check size={15} />{/if}</span
	>
</div>
