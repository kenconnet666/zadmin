<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { ComboboxSelectEvent } from './context.svelte.js';
	export interface ZComboboxItemProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'id' | 'role'
	> {
		readonly children?: Snippet;
		readonly disabled?: boolean;
		readonly onSelect?: (event: ComboboxSelectEvent) => void;
		ref?: HTMLDivElement | null;
		readonly textValue?: string;
		readonly value: SelectionKey;
	}
	export const zuiMetadata = {
		category: 'input',
		id: 'combobox-item',
		importStatement: "import { ZComboboxItem } from '@zadmin/zui';",
		name: 'ZComboboxItem',
		bindings: [{ description: '真实option引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['ZCombobox', 'Collection'],
		events: [
			{
				description: '选择前收到可取消事件。',
				name: 'onSelect',
				type: '(event: ComboboxSelectEvent) => void'
			}
		],
		keyboard: [],
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
				description: '过滤与输入回填文本。',
				name: 'textValue',
				type: 'string'
			},
			{
				default: 'false',
				description: '禁用并跳过active导航。',
				name: 'disabled',
				type: 'boolean'
			},
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
		source: 'ui/zui/src/components/compound/combobox/ZComboboxItem.svelte',
		states: [
			{ description: '选择状态。', name: 'data-state', values: ['selected', 'unselected'] },
			{ description: 'active-descendant状态。', name: 'data-highlighted', values: ['true'] }
		],
		status: 'experimental',
		summary: '可过滤、active-descendant定位和pointer选择的Combobox Item。'
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
	import { useZCombobox } from './context.svelte.js';
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
			selected: { false: () => undefined, true: (s) => s.color._primary },
			visible: { false: (s) => s.display.none, true: () => undefined }
		},
		defaultVariants: { disabled: false, highlighted: false, selected: false, visible: true }
	});
	registerRecipeHmr(import.meta, recipe);
	let {
		children,
		class: className,
		disabled = false,
		onclick,
		onpointermove,
		onSelect,
		ref = $bindable(null),
		style,
		textValue,
		value,
		...rest
	}: ZComboboxItemProps = $props();
	const zui = useZui();
	const combo = useZCombobox();
	const label = $derived(
		textValue ?? ref?.querySelector('[data-slot="label"]')?.textContent?.trim() ?? String(value)
	);
	const visible = $derived(combo.matches(label));
	const resolvedDisabled = $derived(disabled || combo.disabled || !visible);
	const selected = $derived(Object.is(combo.value, value));
	const highlighted = $derived(Object.is(combo.activeKey, value));
	const rootClass = $derived(
		zui.recipe(recipe, { disabled: disabled || combo.disabled, highlighted, selected, visible })
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	$effect(() =>
		combo.register(() => ({
			disabled: resolvedDisabled,
			element: ref,
			key: value,
			textValue: label
		}))
	);
	function handleClick(event: MouseEvent & { currentTarget: HTMLDivElement }): void {
		onclick?.(event);
		if (!event.defaultPrevented && !resolvedDisabled) combo.choose(value, event, onSelect);
	}
	function handlePointerMove(event: PointerEvent & { currentTarget: HTMLDivElement }): void {
		onpointermove?.(event);
		if (!event.defaultPrevented && !resolvedDisabled) combo.setActive(value);
	}
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={combo.idFor(value)}
	role="option"
	aria-disabled={disabled || combo.disabled || undefined}
	aria-selected={selected}
	hidden={!visible}
	data-highlighted={highlighted || undefined}
	data-state={selected ? 'selected' : 'unselected'}
	onclick={handleClick}
	onpointermove={handlePointerMove}
>
	<span data-slot="label">{@render children?.()}</span><span aria-hidden="true"
		>{selected ? '✓' : ''}</span
	>
</div>
