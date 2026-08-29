<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { defineSlotRecipe, registerSlotRecipeHmr } from '../../recipes/slots.js';

	export interface ZFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly controlId?: string;
		readonly description?: string;
		readonly error?: string;
		readonly label: string;
		readonly required?: boolean;
		ref?: HTMLDivElement | null;
	}

	const fieldRecipe = defineSlotRecipe({
		slots: ['root', 'label', 'control', 'description', 'error'] as const,
		base: {
			control: () => undefined,
			description: (s) => s.color._textMuted,
			error: (s) => s.color._danger,
			label: (s) => s.fontWeight._medium,
			root: (s) => s.display.grid
		},
		variants: {
			invalid: {
				false: {},
				true: { control: (s) => s.borderColor._danger }
			},
			size: {
				medium: { root: (s) => s.gap._small },
				small: { root: (s) => s.gap._xsmall }
			}
		},
		defaultVariants: { invalid: false, size: 'medium' }
	});

	registerSlotRecipeHmr(import.meta, fieldRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { provideZField } from '../../component-runtime/field-context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../component-runtime/root-style.js';
	import { useZui } from '../../component-runtime/zui-context.js';
	import { readIcssCarrier } from '../../runtime/internal.js';

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
