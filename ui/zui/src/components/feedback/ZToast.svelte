<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ToastPriority, ToastTone } from '../../runtime/toast.svelte.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZToastProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
		readonly actionLabel?: string;
		readonly description?: string;
		readonly dismissLabel?: string;
		readonly dismissible?: boolean;
		readonly onAction?: (event: MouseEvent) => void;
		readonly onDismiss?: (event: MouseEvent) => void;
		readonly onPauseChange?: (reason: 'focus' | 'hover', paused: boolean) => void;
		readonly priority?: ToastPriority;
		ref?: HTMLElement | null;
		readonly title: string;
		readonly tone?: ToastTone;
	}
	export const zuiMetadata = {
		category: 'feedback',
		id: 'toast',
		importStatement: "import { ZToast, ZToaster, createToastQueue } from '@zadmin/zui';",
		name: 'ZToast',
		bindings: [{ description: '真实article引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: ['ToastQueue', 'live region', 'visibility pause'],
		events: [
			{ description: '操作按钮。', name: 'onAction', type: '(event: MouseEvent) => void' },
			{ description: '关闭按钮。', name: 'onDismiss', type: '(event: MouseEvent) => void' }
		],
		keyboard: [{ description: '操作与关闭按钮。', key: 'Tab / Enter / Space' }],
		parts: [
			{ description: '标题。', name: 'title' },
			{ description: '说明。', name: 'description' },
			{ description: '操作区。', name: 'actions' }
		],
		props: [
			{ default: '必填', description: '消息标题。', name: 'title', required: true, type: 'string' },
			{ default: "'info'", description: '消息tone。', name: 'tone', type: 'ToastTone' },
			{
				default: "tone danger时'assertive'，否则'polite'",
				description: '公告优先级。',
				name: 'priority',
				type: 'ToastPriority'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/feedback/ZToast.svelte',
		states: [
			{
				description: '消息tone。',
				name: 'data-tone',
				values: ['info', 'success', 'warning', 'danger']
			}
		],
		status: 'experimental',
		summary: '可独立渲染并由ToastQueue驱动超时与暂停生命周期的临时消息。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderRadius._large;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxShadow._medium;
			s.display.grid;
			s.gap._small;
			s.padding._large;
		},
		variants: {
			tone: {
				danger: (s) => s.borderColor._danger,
				info: (s) => s.borderColor._accent,
				success: (s) => s.borderColor._success,
				warning: (s) => s.borderColor._warning
			}
		},
		defaultVariants: { tone: 'info' }
	});
	const titleRecipe = defineRecipe({
		base: (s) => s.fontWeight._semibold,
		variants: {},
		defaultVariants: {}
	});
	const descriptionRecipe = defineRecipe({
		base: (s) => s.color._textMuted,
		variants: {},
		defaultVariants: {}
	});
	const actionRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.gap._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, titleRecipe);
	registerRecipeHmr(import.meta, descriptionRecipe);
	registerRecipeHmr(import.meta, actionRecipe);
</script>

<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import ZButton from '../gene/ZButton.svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	let {
		actionLabel,
		class: className,
		description,
		dismissible = true,
		dismissLabel = 'Dismiss notification',
		onAction,
		onDismiss,
		onPauseChange,
		priority,
		ref = $bindable(null),
		style,
		title,
		tone = 'info',
		...rest
	}: ZToastProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(recipe, { tone }));
	const titleClass = $derived(zui.recipe(titleRecipe));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const actionClass = $derived(zui.recipe(actionRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const resolvedPriority = $derived(priority ?? (tone === 'danger' ? 'assertive' : 'polite'));
	function focusOut(event: FocusEvent): void {
		if (
			!(event.currentTarget instanceof HTMLElement) ||
			event.currentTarget.contains(event.relatedTarget as Node | null)
		)
			return;
		onPauseChange?.('focus', false);
	}
</script>

<article
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role={resolvedPriority === 'assertive' ? 'alert' : 'status'}
	aria-atomic="true"
	data-tone={tone}
	onmouseenter={() => onPauseChange?.('hover', true)}
	onmouseleave={() => onPauseChange?.('hover', false)}
	onfocusin={() => onPauseChange?.('focus', true)}
	onfocusout={focusOut}
>
	<strong class={titleClass} data-slot="title">{title}</strong>{#if description}<div
			class={descriptionClass}
			data-slot="description"
		>
			{description}
		</div>{/if}{#if actionLabel || dismissible}<div class={actionClass} data-slot="actions">
			{#if actionLabel}<ZButton
					size="small"
					variant="secondary"
					onclick={(event) => onAction?.(event)}>{actionLabel}</ZButton
				>{/if}{#if dismissible}<ZButton
					aria-label={dismissLabel}
					size="small"
					variant="ghost"
					onclick={(event) => onDismiss?.(event)}><X aria-hidden="true" size={16} /></ZButton
				>{/if}
		</div>{/if}
</article>
