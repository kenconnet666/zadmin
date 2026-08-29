<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../component-metadata.js';

	import type { FieldMessages } from '../../component-runtime/form-control.svelte.js';
	import { defineSlotRecipe, registerSlotRecipeHmr } from '../../recipes/slots.js';

	export type ZFieldSize = 'medium' | 'small';

	export interface ZFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly controlId?: string;
		readonly description?: Snippet | string;
		readonly disabled?: boolean;
		readonly error?: FieldMessages;
		readonly label: Snippet | string;
		readonly name?: string;
		readonly readonly?: boolean;
		readonly required?: boolean;
		readonly size?: ZFieldSize;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'field',
		importStatement: "import { ZField } from '@zadmin/zui';",
		name: 'ZField',
		props: [
			{
				default: '必填',
				description: 'control的可见label。',
				name: 'label',
				required: true,
				type: 'Snippet | string'
			},
			{ default: '—', description: '辅助说明。', name: 'description', type: 'Snippet | string' },
			{
				default: '—',
				description: '一个或多个错误消息。',
				name: 'error',
				type: 'string | readonly string[]'
			},
			{
				default: 'false',
				description: '显示并传递required状态。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '向control传递disabled状态。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '向control传递readonly状态。',
				name: 'readonly',
				type: 'boolean'
			},
			{ default: '—', description: '向control传递原生表单name。', name: 'name', type: 'string' },
			{
				default: '自动生成',
				description: '显式label for目标。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: "'medium'",
				description: 'Field间距尺寸。',
				name: 'size',
				type: "'small' | 'medium'"
			},
			{
				bindable: true,
				default: 'null',
				description: 'Field根元素引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		source: 'ui/zui/src/lib/components/input/ZField.svelte',
		status: 'stable',
		summary: '建立label、description、messages、required和control之间的可访问关系。'
	} as const satisfies ZuiComponentMetadata;

	const fieldRecipe = defineSlotRecipe({
		slots: ['root', 'label', 'description', 'messages', 'error'] as const,
		base: {
			description: (s) => s.color._textMuted,
			error: (s) => s.color._danger,
			label: (s) => s.fontWeight._medium,
			messages: (s) => {
				s.display.grid;
				s.gap._xsmall;
			},
			root: (s) => s.display.grid
		},
		variants: {
			size: {
				medium: { root: (s) => s.gap._small },
				small: { root: (s) => s.gap._xsmall }
			}
		},
		defaultVariants: { size: 'medium' }
	});

	registerSlotRecipeHmr(import.meta, fieldRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { provideZField } from '../../component-runtime/field-context.js';
	import {
		mergeAriaIds,
		normalizeFieldMessages
	} from '../../component-runtime/form-control.svelte.js';
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
		disabled = false,
		error,
		label,
		name,
		readonly = false,
		ref = $bindable(null),
		required = false,
		size = 'medium',
		style,
		...rest
	}: ZFieldProps = $props();

	const zui = useZui();
	const uid = $props.id();
	const resolvedControlId = $derived(controlId ?? `${uid}-control`);
	const descriptionId = $derived(description ? `${uid}-description` : undefined);
	const messages = $derived(normalizeFieldMessages(error));
	const errorIds = $derived(messages.map((_, index) => `${uid}-error-${index + 1}`));
	const describedBy = $derived(mergeAriaIds(descriptionId, errorIds.join(' ')));
	const classes = $derived(zui.slots(fieldRecipe, { size }));
	provideZField(() => ({
		controlId: resolvedControlId,
		describedBy,
		disabled,
		invalid: messages.length > 0,
		name,
		readonly,
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
	data-disabled={disabled ? 'true' : undefined}
	data-invalid={messages.length > 0 ? 'true' : undefined}
>
	<label class={classes.label} for={resolvedControlId}>
		{#if typeof label === 'string'}{label}{:else}{@render label()}{/if}
		{#if required}<span aria-hidden="true"> *</span>{/if}
	</label>
	{@render children?.()}
	{#if description}
		<div class={classes.description} id={descriptionId}>
			{#if typeof description === 'string'}{description}{:else}{@render description()}{/if}
		</div>
	{/if}
	{#if messages.length > 0}
		<div class={classes.messages} aria-live="polite" aria-atomic="true">
			{#each messages as message, index (errorIds[index])}
				<p class={classes.error} id={errorIds[index]}>{message}</p>
			{/each}
		</div>
	{/if}
</div>
