<script module lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZInputType = 'email' | 'password' | 'search' | 'tel' | 'text' | 'url';
	export type ZInputSize = 'large' | 'medium' | 'small';

	export interface ZInputProps extends Omit<
		HTMLInputAttributes,
		'children' | 'defaultValue' | 'size' | 'type' | 'value'
	> {
		readonly defaultValue?: string;
		readonly invalid?: boolean;
		readonly onFormReset?: () => void;
		readonly onValueChange?: (value: string) => void;
		readonly resetOnForm?: boolean;
		readonly size?: ZInputSize;
		readonly type?: ZInputType;
		value?: string;
		ref?: HTMLInputElement | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'input',
		importStatement: "import { ZInput } from '@zadmin/zui';",
		name: 'ZInput',
		bindings: [
			{ description: '受控或非受控文本值。', name: 'value', type: 'string' },
			{ description: '真实input元素引用。', name: 'ref', type: 'HTMLInputElement | null' }
		],
		dependencies: [],
		events: [
			{
				description: '仅在用户输入改变值时调用一次；外部更新不触发。',
				name: 'onValueChange',
				type: '(value: string) => void'
			},
			{
				description: '原生form reset恢复默认值后调用。',
				name: 'onFormReset',
				type: '() => void'
			}
		],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '受控或双向绑定值。',
				name: 'value',
				type: 'string'
			},
			{
				default: "''",
				description: '非受控初值和原生form reset目标；受控状态由外部owner重置。',
				name: 'defaultValue',
				type: 'string'
			},
			{
				default: "'text'",
				description: '受支持的原生输入类型。',
				name: 'type',
				type: "'text' | 'email' | 'password' | 'search' | 'tel' | 'url'"
			},
			{
				default: "'medium'",
				description: '输入框尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{
				default: '继承Field或false',
				description: '设置invalid状态。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'true',
				description: '是否由当前ZInput恢复defaultValue；复合父状态机可关闭并通过onFormReset接管。',
				name: 'resetOnForm',
				type: 'boolean'
			},
			{
				default: '—',
				description: '只在用户输入时触发。',
				name: 'onValueChange',
				type: '(value: string) => void'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实input引用。',
				name: 'ref',
				type: 'HTMLInputElement | null'
			}
		],
		since: '0.1.0',
		snippets: [],
		source: 'ui/zui/src/components/input/ZInput.svelte',
		states: [{ description: '输入值或Field上下文无效。', name: 'data-invalid', values: ['true'] }],
		status: 'stable',
		summary: '保留原生input能力，并提供受控/非受控值、binding和Field语义关联。'
	} as const satisfies ZuiComponentMetadata;

	const inputRecipe = defineRecipe({
		base: (s) => {
			s.appearance.none;
			s.width._full;
			s.borderWidth._hairline;
			s.borderStyle.solid;
			s.borderRadius._medium;
			s.backgroundColor._canvas;
			s.color._text;
			s.transitionDuration._fast;
			s.transitionProperty.raw('border-color, box-shadow');
			s.transitionTimingFunction.ease;
			s._selector('&::placeholder', (placeholder) => placeholder.color._textMuted);
			s._focusVisible((focus) => {
				focus.outlineWidth._medium;
				focus.outlineStyle.solid;
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
			});
		},
		variants: {
			invalid: {
				false: (s) => s.borderColor._border,
				true: (s) => s.borderColor._danger
			},
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			size: {
				large: (s) => {
					s.minHeight._large;
					s.paddingInline._xlarge;
					s.fontSize._large;
				},
				medium: (s) => {
					s.minHeight._medium;
					s.paddingInline._large;
					s.fontSize._medium;
				},
				small: (s) => {
					s.minHeight._small;
					s.paddingInline._medium;
					s.fontSize._small;
				}
			}
		},
		defaultVariants: { invalid: false, motion: 'auto', size: 'medium' }
	});

	registerRecipeHmr(import.meta, inputRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZField } from '../../runtime/form/field-context.js';
	import { useZInputGroup } from '../../runtime/form/input-group-context.svelte.js';
	import FormResetSignal from '../../runtime/form/FormResetSignal.svelte';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		class: className,
		defaultValue = '',
		disabled = false,
		form,
		id,
		invalid,
		name,
		oninput,
		onFormReset,
		onValueChange,
		readonly = false,
		ref = $bindable(null),
		resetOnForm = true,
		required = false,
		size = 'medium',
		style,
		type = 'text',
		value = $bindable(),
		...rest
	}: ZInputProps = $props();

	const zui = useZui();
	const uid = $props.id();
	const field = useZField();
	const inputGroup = useZInputGroup();
	const resolvedInvalid = $derived(invalid ?? inputGroup?.invalid ?? field?.invalid ?? false);
	const rootClass = $derived(
		zui.recipe(inputRecipe, { invalid: resolvedInvalid, motion: zui.motion, size })
	);
	const state = new ControllableState<string>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived(state.current);
	const generatedId = $derived(createZuiId(zui.idPrefix, uid, 'input'));
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		state.setFromUser(event.currentTarget.value);
		oninput?.(event);
	}
	function resetFromForm(): void {
		if (resetOnForm) state.reset();
		onFormReset?.();
	}
</script>

<input
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	id={id ?? field?.controlId ?? generatedId}
	name={name ?? field?.name}
	{form}
	{type}
	{defaultValue}
	value={resolvedValue}
	oninput={handleInput}
	disabled={disabled || inputGroup?.disabled || field?.disabled}
	readonly={readonly || field?.readonly}
	required={required || field?.required}
	aria-describedby={resolvedDescribedBy}
	aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
	data-invalid={resolvedInvalid ? 'true' : undefined}
/>
{#if resetOnForm || onFormReset}
	<FormResetSignal association={form} control={ref} onReset={resetFromForm} />
{/if}
