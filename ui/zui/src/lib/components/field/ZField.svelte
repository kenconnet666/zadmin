<script lang="ts">
	import { untrack } from 'svelte';

	import { readIcssCarrier } from '../../runtime/internal.js';
	import { useZui } from '../provider/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../provider/variables.js';
	import { provideZField } from './context.js';
	import { fieldRecipe } from './field.recipe.js';
	import type { ZFieldProps } from './types.js';

	let {
		children,
		class: className,
		controlId,
		description,
		error,
		label,
		ref = $bindable(null),
		required = false,
		style,
		...rest
	}: ZFieldProps = $props();

	const zui = useZui();
	const uid = $props.id();
	const resolvedControlId = $derived(controlId ?? `${uid}-control`);
	const descriptionId = $derived(description ? `${uid}-description` : undefined);
	const errorId = $derived(error ? `${uid}-error` : undefined);
	const describedBy = $derived([descriptionId, errorId].filter(Boolean).join(' ') || undefined);
	const classes = $derived(zui.slots(fieldRecipe, { invalid: Boolean(error), size: 'medium' }));
	provideZField(() => ({
		controlClass: classes.control,
		controlId: resolvedControlId,
		describedBy,
		invalid: Boolean(error),
		required
	}));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<div
	{...rest}
	bind:this={ref}
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-invalid={error ? 'true' : undefined}
>
	<label class={classes.label} for={resolvedControlId}>
		{label}{#if required}<span aria-hidden="true"> *</span>{/if}
	</label>
	{@render children?.()}
	{#if description}
		<p class={classes.description} id={descriptionId}>{description}</p>
	{/if}
	{#if error}
		<p class={classes.error} id={errorId} role="alert">{error}</p>
	{/if}
</div>
