<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';

	export interface SegmentedItem {
		readonly disabled?: boolean;
		readonly label: string;
		readonly value: SelectionKey;
	}
	export interface ZSegmentedProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'onchange' | 'role'
	> {
		readonly defaultValue?: SelectionKey;
		readonly disabled?: boolean;
		readonly form?: string;
		readonly items: readonly SegmentedItem[];
		readonly name?: string;
		readonly onchange?: (event: Event) => void;
		readonly onValueChange?: (value: SelectionKey) => void;
		readonly orientation?: 'horizontal' | 'vertical';
		ref?: HTMLDivElement | null;
		value?: SelectionKey;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'segmented',
		importStatement: "import { ZSegmented } from '@zadmin/zui';",
		name: 'ZSegmented',
		bindings: [
			{ description: '当前单选值。', name: 'value', type: 'string | number | undefined' },
			{ description: '真实radiogroup引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['single selection', 'roving focus', 'FormValue'],
		events: [
			{
				description: '用户选择后调用一次。',
				name: 'onValueChange',
				type: '(value: SelectionKey) => void'
			}
		],
		keyboard: [
			{
				description: '按方向与RTL在enabled segment间选择并移动焦点。',
				key: 'Arrow keys / Home / End'
			},
			{ description: '选择当前segment。', key: 'Enter / Space' }
		],
		parts: [{ description: '单个segment按钮。', name: 'item' }],
		props: [
			{
				default: '必填',
				description: '稳定值、标签和disabled配置。',
				name: 'items',
				required: true,
				type: 'readonly SegmentedItem[]'
			},
			{
				bindable: true,
				default: 'undefined',
				description: '当前单选值。',
				name: 'value',
				type: 'string | number'
			},
			{
				default: 'undefined',
				description: '非受控初始值。',
				name: 'defaultValue',
				type: 'string | number'
			},
			{
				default: "'horizontal'",
				description: '视觉与键盘方向。',
				name: 'orientation',
				type: "'horizontal' | 'vertical'"
			},
			{
				default: 'false',
				description: '禁用全部segments和表单值。',
				name: 'disabled',
				type: 'boolean'
			},
			{ default: 'undefined', description: '隐藏表单字段名。', name: 'name', type: 'string' }
		],
		since: '0.4.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZSegmented.svelte',
		states: [{ description: '选择状态。', name: 'data-state', values: ['selected', 'unselected'] }],
		status: 'experimental',
		summary: '紧凑radiogroup视觉、单选状态、roving键盘与表单合同的Segmented。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- The Set is local validation scratch space. */
	import { untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { moveIndex, navigationIntent } from '../../runtime/collection/list-navigation.js';
	import { formReset } from '../../runtime/form/form-control.svelte.js';
	import { serializeFormValue } from '../../runtime/form/form-value.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._surface;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.inlineFlex;
			s.gap._xsmall;
			s.padding._xsmall;
		},
		variants: {
			orientation: {
				horizontal: (s) => s.flexDirection.row,
				vertical: (s) => s.flexDirection.column
			}
		},
		defaultVariants: { orientation: 'horizontal' }
	});
	const itemRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor.transparent;
			s.borderColor.transparent;
			s.borderRadius._small;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.cursor.pointer;
			s.fontWeight._semibold;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(1);
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
			selected: {
				false: () => undefined,
				true: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.color._primary;
					s.boxShadow._small;
				}
			}
		},
		defaultVariants: { disabled: false, selected: false }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, itemRecipe);
	let {
		class: className,
		defaultValue,
		disabled = false,
		form,
		items,
		name,
		onchange,
		onValueChange,
		orientation = 'horizontal',
		ref = $bindable(null),
		style,
		value = $bindable(),
		...rest
	}: ZSegmentedProps = $props();
	const zui = useZui();
	const elements = $state<(HTMLButtonElement | null)[]>([]);
	let proxy = $state<HTMLInputElement | null>(null);
	const normalizedItems = $derived.by(() => {
		const keys = new Set<SelectionKey>();
		for (const item of items) {
			if (keys.has(item.value))
				throw new Error(`Duplicate ZSegmented value "${String(item.value)}".`);
			keys.add(item.value);
		}
		return items;
	});
	const valueState = new ControllableState<SelectionKey | undefined>({
		defaultValue: () => defaultValue,
		onChange: () => (next) => {
			if (next !== undefined) onValueChange?.(next);
		},
		read: () => value,
		write: (next) => (value = next)
	});
	const enabled = $derived(
		normalizedItems
			.map((item, index) => ({ item, index }))
			.filter(({ item }) => !disabled && !item.disabled)
	);
	const focusIndex = $derived(
		enabled.find(({ item }) => Object.is(item.value, valueState.current))?.index ??
			enabled[0]?.index
	);
	const rootClass = $derived(zui.recipe(rootRecipe, { orientation }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	function select(index: number, originalEvent: Event): void {
		const item = normalizedItems[index];
		if (!item || disabled || item.disabled) return;
		valueState.setFromUser(item.value);
		onchange?.(originalEvent);
	}
	function handleKeydown(event: KeyboardEvent, index: number): void {
		const intent = navigationIntent(event.key, orientation, zui.direction);
		if (!intent) return;
		event.preventDefault();
		const current = enabled.findIndex((entry) => entry.index === index);
		const target = enabled[moveIndex(enabled.length, current, intent, true)];
		if (target) {
			select(target.index, event);
			elements[target.index]?.focus({ preventScroll: true });
		}
	}
	const serialized = $derived(
		valueState.current === undefined ? '' : (serializeFormValue(valueState.current) ?? '')
	);
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="radiogroup"
	aria-orientation={orientation}
	data-orientation={orientation}
>
	{#each normalizedItems as item, index (item.value)}
		<button
			bind:this={elements[index]}
			class={zui.recipe(itemRecipe, {
				disabled: Boolean(disabled || item.disabled),
				selected: Object.is(item.value, valueState.current)
			})}
			type="button"
			role="radio"
			aria-checked={Object.is(item.value, valueState.current)}
			disabled={disabled || item.disabled}
			tabindex={focusIndex === index ? 0 : -1}
			data-state={Object.is(item.value, valueState.current) ? 'selected' : 'unselected'}
			onclick={(event) => select(index, event)}
			onkeydown={(event) => handleKeydown(event, index)}>{item.label}</button
		>
	{/each}
</div>
<input
	bind:this={proxy}
	aria-hidden="true"
	tabindex={-1}
	type="hidden"
	disabled
	{form}
	use:formReset={() => valueState.reset()}
/>
{#if name && !disabled}<input type="hidden" {form} {name} value={serialized} />{/if}
