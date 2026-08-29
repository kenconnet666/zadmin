<script module lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ZInputType = 'email' | 'password' | 'search' | 'tel' | 'text' | 'url';
	export type ZInputSize = 'large' | 'medium' | 'small';

	export interface ZInputProps extends Omit<
		HTMLInputAttributes,
		'children' | 'size' | 'type' | 'value'
	> {
		readonly invalid?: boolean;
		readonly onValueChange?: (value: string) => void;
		readonly size?: ZInputSize;
		readonly type?: ZInputType;
		value?: string;
		ref?: HTMLInputElement | null;
	}

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
				// This composed focus ring intentionally follows the current text color.
				focus.outline.raw('2px solid currentColor');
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

	import { useZField } from '../../component-runtime/field-context.js';
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
		id,
		invalid,
		oninput,
		onValueChange,
		ref = $bindable(null),
		required = false,
		size = 'medium',
		style,
		type = 'text',
		value = $bindable(''),
		...rest
	}: ZInputProps = $props();

	const zui = useZui();
	const field = useZField();
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const rootClass = $derived(zui.recipe(inputRecipe, { invalid: resolvedInvalid, size }));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
		value = event.currentTarget.value;
		oninput?.(event);
		onValueChange?.(value);
	}

	function syncFormReset(input: HTMLInputElement): () => void {
		const form = input?.form;
		if (form === null) return () => undefined;
		let resetTimer: ReturnType<typeof setTimeout> | undefined;
		const reset = (): void => {
			resetTimer = setTimeout(() => {
				value = input.value;
			}, 0);
		};
		form.addEventListener('reset', reset);
		return () => {
			form.removeEventListener('reset', reset);
			if (resetTimer !== undefined) clearTimeout(resetTimer);
		};
	}
</script>

<input
	{...rest}
	bind:this={ref}
	class={[rootClass, field?.controlClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	{@attach syncFormReset}
	id={id ?? field?.controlId}
	{type}
	{value}
	oninput={handleInput}
	required={required || field?.required}
	aria-describedby={ariaDescribedBy ?? field?.describedBy}
	aria-invalid={resolvedInvalid ? 'true' : ariaInvalid}
	data-invalid={resolvedInvalid ? 'true' : undefined}
/>
