<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { FieldMessages } from '../../runtime/form/form-control.svelte.js';
	import { defineSlotRecipe, registerSlotRecipeHmr } from '../../recipes/slots.js';

	export type ZFieldSize = ZControlSize;

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
		readonly success?: FieldMessages;
		readonly warning?: FieldMessages;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		category: 'input',
		id: 'field',
		importStatement: "import { ZField } from '@zadmin/zui';",
		name: 'ZField',
		bindings: [{ description: '根div。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: [],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: '必填',
				description: '控件标签。',
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
				description: '必填状态。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '禁用状态。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '只读状态。',
				name: 'readonly',
				type: 'boolean'
			},
			{ default: '—', description: '原生表单name。', name: 'name', type: 'string' },
			{
				default: '自动生成',
				description: 'label目标ID。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '显式覆盖字段间距和control继承尺寸；未传时control继续采用Provider density。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{
				default: '—',
				description: '一个或多个警告消息。',
				name: 'warning',
				type: 'string | readonly string[]'
			},
			{
				default: '—',
				description: '一个或多个成功消息。',
				name: 'success',
				type: 'string | readonly string[]'
			},
			{
				bindable: true,
				default: 'null',
				description: '根div。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.1.0',
		snippets: [
			{ description: '控件内容。', name: 'children', type: 'Snippet' },
			{ description: '标签内容。', name: 'label', type: 'Snippet' },
			{
				description: '辅助说明。',
				name: 'description',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/input/ZField.svelte',
		states: [
			{ description: '禁用。', name: 'data-disabled', values: ['true'] },
			{ description: '包含错误。', name: 'data-invalid', values: ['true'] },
			{ description: '包含警告。', name: 'data-warning', values: ['true'] },
			{ description: '包含成功消息。', name: 'data-success', values: ['true'] }
		],
		status: 'stable',
		summary: '关联label、说明、错误与control ARIA。'
	} as const satisfies ZuiComponentMetadata;

	const fieldRecipe = defineSlotRecipe({
		slots: ['root', 'label', 'description', 'messages', 'error', 'warning', 'success'] as const,
		base: {
			description: (s) => s.color._textMuted,
			error: (s) => s.color._danger,
			label: (s) => s.fontWeight._medium,
			messages: (s) => {
				s.display.grid;
				s.gap._xsmall;
			},
			success: (s) => s.color._success,
			warning: (s) => s.color._warning,
			root: (s) => s.display.grid
		},
		variants: {
			size: {
				large: { root: (s) => s.gap._medium },
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
	import type { Attachment } from 'svelte/attachments';

	import { provideZField } from '../../runtime/form/field-context.js';
	import { mergeAriaIds, normalizeFieldMessages } from '../../runtime/form/form-control.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

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
		size,
		style,
		success,
		warning,
		...rest
	}: ZFieldProps = $props();

	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid));
	const resolvedControlId = $derived(controlId ?? `${idBase}-control`);
	const labelId = $derived(`${idBase}-label`);
	const descriptionId = $derived(description ? `${idBase}-description` : undefined);
	const messages = $derived(normalizeFieldMessages(error));
	const warningMessages = $derived(normalizeFieldMessages(warning));
	const successMessages = $derived(normalizeFieldMessages(success));
	const invalid = $derived(messages.length > 0);
	const errorIds = $derived(messages.map((_, index) => `${idBase}-error-${index + 1}`));
	const warningIds = $derived(warningMessages.map((_, index) => `${idBase}-warning-${index + 1}`));
	const successIds = $derived(successMessages.map((_, index) => `${idBase}-success-${index + 1}`));
	const describedBy = $derived(
		mergeAriaIds(descriptionId, errorIds.join(' '), warningIds.join(' '), successIds.join(' '))
	);
	const classes = $derived(
		size === undefined ? zui.slots(fieldRecipe) : zui.slots(fieldRecipe, { size })
	);
	let focusOwner: (() => void) | undefined;

	function registerFocusOwner(focus: () => void): () => void {
		focusOwner = focus;
		return () => {
			if (focusOwner === focus) focusOwner = undefined;
		};
	}

	function handleLabelClick(event: Event): void {
		if (!focusOwner || event.defaultPrevented) return;
		event.preventDefault();
		focusOwner();
	}

	// Native `for` handles labelable controls; compound owners intercept only to focus,
	// avoiding the label's synthetic click from also opening or toggling the control.
	const attachLabel: Attachment<HTMLLabelElement> = (node) => {
		node.addEventListener('click', handleLabelClick);
		return () => node.removeEventListener('click', handleLabelClick);
	};
	provideZField(() => ({
		controlId: resolvedControlId,
		describedBy,
		disabled,
		invalid,
		labelId,
		name,
		readonly,
		required,
		size,
		registerFocusOwner
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
	data-disabled={disabled || undefined}
	data-invalid={invalid || undefined}
	data-success={successMessages.length > 0 || undefined}
	data-warning={warningMessages.length > 0 || undefined}
>
	<label class={classes.label} for={resolvedControlId} id={labelId} {@attach attachLabel}>
		{#if typeof label === 'string'}{label}{:else}{@render label()}{/if}
		{#if required}<span aria-hidden="true"> *</span>{/if}
	</label>
	{@render children?.()}
	{#if description}
		<div class={classes.description} id={descriptionId}>
			{#if typeof description === 'string'}{description}{:else}{@render description()}{/if}
		</div>
	{/if}
	{#if invalid || warningMessages.length > 0 || successMessages.length > 0}
		<div class={classes.messages} aria-live="polite" aria-atomic="true">
			{#each messages as message, index (errorIds[index])}
				<p class={classes.error} id={errorIds[index]}>{message}</p>
			{/each}
			{#each warningMessages as message, index (warningIds[index])}
				<p class={classes.warning} id={warningIds[index]}>{message}</p>
			{/each}
			{#each successMessages as message, index (successIds[index])}
				<p class={classes.success} id={successIds[index]}>{message}</p>
			{/each}
		</div>
	{/if}
</div>
