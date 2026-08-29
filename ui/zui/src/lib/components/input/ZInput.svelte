<script module lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../component-metadata.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZInputType = 'email' | 'password' | 'search' | 'tel' | 'text' | 'url';
	export type ZInputSize = 'large' | 'medium' | 'small';

	export interface ZInputProps extends Omit<
		HTMLInputAttributes,
		'children' | 'defaultValue' | 'size' | 'type' | 'value'
	> {
		readonly defaultValue?: string;
		readonly invalid?: boolean;
		readonly onValueChange?: (value: string) => void;
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
		source: 'ui/zui/src/lib/components/input/ZInput.svelte',
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
		defaultVariants: { invalid: false, size: 'medium' }
	});

	registerRecipeHmr(import.meta, inputRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { ControllableState } from '../../component-runtime/controllable-state.svelte.js';
	import { useZField } from '../../component-runtime/field-context.js';
	import { mergeAriaIds } from '../../component-runtime/form-control.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../component-runtime/root-style.js';
	import { useZui } from '../../component-runtime/zui-context.js';
	import { readIcssCarrier } from '../../runtime/internal.js';

	let {
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		class: className,
		defaultValue = '',
		disabled = false,
		id,
		invalid,
		name,
		oninput,
		onValueChange,
		readonly = false,
		ref = $bindable(null),
		required = false,
		size = 'medium',
		style,
		type = 'text',
		value = $bindable(),
		...rest
	}: ZInputProps = $props();

	const zui = useZui();
	const field = useZField();
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const rootClass = $derived(zui.recipe(inputRecipe, { invalid: resolvedInvalid, size }));
	const state = new ControllableState<string>({
		defaultValue: () => defaultValue,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived(state.current);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		state.setFromUser(event.currentTarget.value);
		oninput?.(event);
	}
</script>

<input
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	id={id ?? field?.controlId}
	name={name ?? field?.name}
	{type}
	{defaultValue}
	value={resolvedValue}
	oninput={handleInput}
	disabled={disabled || field?.disabled}
	readonly={readonly || field?.readonly}
	required={required || field?.required}
	aria-describedby={resolvedDescribedBy}
	aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
	data-invalid={resolvedInvalid ? 'true' : undefined}
/>
