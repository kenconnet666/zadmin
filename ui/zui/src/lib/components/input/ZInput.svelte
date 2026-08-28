<script lang="ts">
	import { untrack } from 'svelte';

	import { readIcssCarrier } from '../../runtime/internal.js';
	import { useZField } from '../field/context.js';
	import { useZui } from '../provider/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import { inputRecipe } from './input.recipe.js';
	import type { ZInputProps } from './types.js';

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
