<script module lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import type { RecipeVariants } from '../../../recipes/types.js';

	const radioItemRecipe = defineRecipe({
		base: (s) => {
			s.accentColor._primary;
			s.appearance.auto;
			s.blockSize._medium;
			s.cursor.pointer;
			s.flexShrink(0);
			s.inlineSize._medium;
			s.margin.px(0);
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			readonly: {
				false: () => undefined,
				true: (s) => s.cursor.default
			},
			disabled: {
				false: () => undefined,
				true: (s) => {
					s.cursor.notAllowed;
					s.opacity._disabled;
				}
			},
			invalid: {
				false: () => undefined,
				true: (s) => s.accentColor._danger
			},
			size: {
				large: (s) => {
					s.blockSize._large;
					s.inlineSize._large;
				},
				medium: () => undefined,
				small: (s) => {
					s.blockSize._small;
					s.inlineSize._small;
				}
			}
		},
		defaultVariants: { disabled: false, invalid: false, readonly: false, size: 'medium' }
	});

	registerRecipeHmr(import.meta, radioItemRecipe);

	export type ZRadioGroupItemVariants = Omit<
		RecipeVariants<typeof radioItemRecipe>,
		'disabled' | 'invalid' | 'readonly'
	>;

	export type ZRadioGroupItemProps = Omit<
		HTMLInputAttributes,
		| 'aria-checked'
		| 'checked'
		| 'defaultChecked'
		| 'disabled'
		| 'form'
		| 'name'
		| 'onchange'
		| 'onclick'
		| 'onfocus'
		| 'onkeydown'
		| 'required'
		| 'size'
		| 'type'
		| 'value'
	> &
		ZRadioGroupItemVariants & {
			readonly disabled?: boolean;
			readonly onchange?: HTMLInputAttributes['onchange'];
			readonly onclick?: HTMLInputAttributes['onclick'];
			readonly onfocus?: HTMLInputAttributes['onfocus'];
			readonly onkeydown?: HTMLInputAttributes['onkeydown'];
			ref?: HTMLInputElement | null;
			readonly textValue?: string;
			readonly value: SelectionKey;
		};

	export const zuiMetadata = {
		category: 'input',
		id: 'radio-group-item',
		importStatement: "import { ZRadioGroupItem } from '@zadmin/zui';",
		name: 'ZRadioGroupItem',
		bindings: [
			{ description: '真实input元素引用。', name: 'ref', type: 'HTMLInputElement | null' }
		],
		dependencies: ['ZRadioGroup'],
		events: [
			{
				description: '仅可编辑状态转发原生change。',
				name: 'onchange',
				type: 'ChangeEventHandler<HTMLInputElement>'
			},
			{
				description: '仅可编辑状态转发原生click。',
				name: 'onclick',
				type: 'MouseEventHandler<HTMLInputElement>'
			}
		],
		keyboard: [{ description: '可编辑时选择当前Item；只读时保持焦点和值。', key: 'Space' }],
		parts: [],
		props: [
			{
				default: '必填',
				description: '稳定的string/number单选值与LogicalCollection key。',
				name: 'value',
				required: true,
				type: 'SelectionKey'
			},
			{
				default: 'value',
				description: '供Collection搜索与诊断使用的文本。',
				name: 'textValue',
				type: 'string'
			},
			{
				default:
					"RadioGroup size，其次为Field size与Provider density（'comfortable'映射为'medium'）",
				description: 'radio指示器尺寸；显式Item size优先。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{ default: 'false', description: '禁用当前Item。', name: 'disabled', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实input引用。',
				name: 'ref',
				type: 'HTMLInputElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/compound/radio-group/ZRadioGroupItem.svelte',
		states: [
			{ description: '选择状态。', name: 'data-state', values: ['checked', 'unchecked'] },
			{ description: '禁用状态。', name: 'data-disabled', values: ['true'] },
			{ description: '继承组级只读状态。', name: 'data-readonly', values: ['true'] },
			{
				description: '解析后的radio指示器尺寸。',
				name: 'data-size',
				values: ['small', 'medium', 'large']
			}
		],
		status: 'stable',
		summary: '注册到ZRadioGroup LogicalCollection并保留原生radio表单语义的typed单选Item。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { serializeFormValue } from '../../../runtime/form/form-value.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { useZRadioGroup } from './context.svelte.js';

	let {
		class: className,
		disabled = false,
		id,
		onchange,
		onclick,
		onfocus,
		onkeydown,
		ref = $bindable(null),
		size,
		style,
		textValue,
		value,
		...rest
	}: ZRadioGroupItemProps = $props();

	const zui = useZui();
	const uid = $props.id();
	const group = useZRadioGroup();
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'radio-item'));
	const resolvedDisabled = $derived(disabled || group.disabled);
	const resolvedReadonly = $derived(group.readonly);
	const selected = $derived(group.isSelected(value));
	const serializedValue = $derived(serializeFormValue(value) ?? '');
	const rootClass = $derived(
		zui.recipe(radioItemRecipe, {
			disabled: resolvedDisabled,
			invalid: group.invalid,
			readonly: resolvedReadonly,
			size: size ?? group.size
		})
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	$effect(() =>
		group.register(() => ({
			disabled: resolvedDisabled,
			element: ref,
			id: id ?? generatedId,
			key: value,
			selectionDisabled: false,
			textValue: textValue ?? String(value)
		}))
	);

	function handleChange(event: Event & { currentTarget: HTMLInputElement }): void {
		if (resolvedReadonly) {
			group.restoreNativeSelection();
			return;
		}
		if (event.currentTarget.checked) group.select(value);
		onchange?.(event);
	}

	function handleClick(event: MouseEvent & { currentTarget: HTMLInputElement }): void {
		if (resolvedReadonly) {
			event.preventDefault();
			group.restoreNativeSelection();
			return;
		}
		onclick?.(event);
	}

	function handleFocus(event: FocusEvent & { currentTarget: HTMLInputElement }): void {
		group.focus(value);
		onfocus?.(event);
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		if (resolvedReadonly) {
			group.handleKey(event);
			return;
		}
		onkeydown?.(event);
		if (!event.defaultPrevented) group.handleKey(event);
	}
</script>

<input
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	id={id ?? generatedId}
	type="radio"
	form={group.form}
	name={group.name}
	value={serializedValue}
	defaultChecked={Object.is(group.defaultValue, value)}
	checked={selected}
	disabled={resolvedDisabled}
	required={group.required}
	tabindex={resolvedDisabled ? -1 : group.tabIndex(value)}
	onchange={handleChange}
	onclick={handleClick}
	onfocus={handleFocus}
	onkeydown={handleKeydown}
	aria-checked={selected}
	data-disabled={resolvedDisabled || undefined}
	data-readonly={resolvedReadonly || undefined}
	data-size={size ?? group.size}
	data-state={selected ? 'checked' : 'unchecked'}
/>
