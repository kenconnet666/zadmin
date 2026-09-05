<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ToastPriority, ToastTone } from '../../runtime/toast.svelte.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZToastProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
		readonly actionLabel?: string;
		readonly announce?: boolean;
		readonly description?: string;
		readonly dismissLabel?: string;
		readonly dismissible?: boolean;
		readonly onAction?: (event: MouseEvent) => void;
		readonly onDismiss?: (event: MouseEvent) => void;
		readonly onEscapeKeyDown?: (event: KeyboardEvent) => void;
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
		dependencies: ['ZButton', '@lucide/svelte', 'scoped live region'],
		events: [
			{ description: '操作按钮。', name: 'onAction', type: '(event: MouseEvent) => void' },
			{
				description: '关闭按钮请求。',
				name: 'onDismiss',
				type: '(event: MouseEvent) => void'
			},
			{
				description: '焦点位于Toast内时的Escape请求。',
				name: 'onEscapeKeyDown',
				type: '(event: KeyboardEvent) => void'
			},
			{
				description: 'hover或focus进入、离开时通知队列暂停原因。',
				name: 'onPauseChange',
				type: "(reason: 'focus' | 'hover', paused: boolean) => void"
			}
		],
		keyboard: [
			{ description: '操作与关闭按钮。', key: 'Tab / Enter / Space' },
			{ description: '焦点位于Toast内时请求关闭。', key: 'Escape' }
		],
		parts: [
			{ description: '独立Toast的合法status/alert公告容器。', name: 'announcement' },
			{ description: '标题。', name: 'title' },
			{ description: '说明。', name: 'description' },
			{ description: '操作区。', name: 'actions' }
		],
		props: [
			{ default: '必填', description: '消息标题。', name: 'title', required: true, type: 'string' },
			{
				default: 'true',
				description: '是否由独立Toast创建live语义；Toaster使用集中公告器时关闭。',
				name: 'announce',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '补充说明；不应重复标题。',
				name: 'description',
				type: 'string'
			},
			{ default: "'info'", description: '消息tone。', name: 'tone', type: 'ToastTone' },
			{
				default: "tone danger时'assertive'，否则'polite'",
				description: '公告优先级。',
				name: 'priority',
				type: 'ToastPriority'
			},
			{
				default: 'undefined',
				description: '可选单一操作按钮文案。',
				name: 'actionLabel',
				type: 'string'
			},
			{
				default: 'true',
				description: '是否展示关闭按钮；持久消息必须可关闭或提供操作。',
				name: 'dismissible',
				type: 'boolean'
			},
			{
				default: 'localePack.feedback.dismissNotification',
				description: '关闭按钮可访问名称；显式值优先于Provider locale。',
				name: 'dismissLabel',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实article引用。',
				name: 'ref',
				type: 'HTMLElement | null'
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
			},
			{
				description: 'Toaster队列阶段。',
				name: 'data-phase',
				values: ['visible', 'exiting']
			},
			{
				description: 'Presence动画阶段。',
				name: 'data-presence',
				values: ['entered', 'exiting']
			}
		],
		status: 'stable',
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
	import { isDomHtmlElement, isDomNode } from '../../runtime/layer/dom-realm.js';
	let {
		actionLabel,
		announce = true,
		class: className,
		description,
		dismissible = true,
		dismissLabel,
		onfocusin,
		onfocusout,
		onmouseenter,
		onmouseleave,
		onAction,
		onDismiss,
		onEscapeKeyDown,
		onkeydown,
		onPauseChange,
		priority,
		ref = $bindable(null),
		style,
		title,
		tone = 'info',
		...rest
	}: ZToastProps = $props();
	const zui = useZui();
	const resolvedDismissLabel = $derived(
		dismissLabel ?? zui.localePack.feedback.dismissNotification
	);
	const rootClass = $derived(zui.recipe(recipe, { tone }));
	const titleClass = $derived(zui.recipe(titleRecipe));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const actionClass = $derived(zui.recipe(actionRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const resolvedPriority = $derived(priority ?? (tone === 'danger' ? 'assertive' : 'polite'));
	function mouseEnter(event: MouseEvent & { currentTarget: HTMLElement }): void {
		onPauseChange?.('hover', true);
		onmouseenter?.(event);
	}
	function mouseLeave(event: MouseEvent & { currentTarget: HTMLElement }): void {
		onPauseChange?.('hover', false);
		onmouseleave?.(event);
	}
	function focusIn(event: FocusEvent & { currentTarget: HTMLElement }): void {
		onPauseChange?.('focus', true);
		onfocusin?.(event);
	}
	function focusOut(event: FocusEvent & { currentTarget: HTMLElement }): void {
		const leaving =
			!isDomHtmlElement(event.currentTarget) ||
			!isDomNode(event.relatedTarget) ||
			!event.currentTarget.contains(event.relatedTarget);
		if (leaving) onPauseChange?.('focus', false);
		onfocusout?.(event);
	}
	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLElement }): void {
		onkeydown?.(event);
		if (
			event.defaultPrevented ||
			event.key !== 'Escape' ||
			!dismissible ||
			onEscapeKeyDown === undefined
		)
			return;
		event.preventDefault();
		event.stopPropagation();
		onEscapeKeyDown?.(event);
	}
</script>

<article
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	data-tone={tone}
	data-priority={resolvedPriority}
	onmouseenter={mouseEnter}
	onmouseleave={mouseLeave}
	onfocusin={focusIn}
	onfocusout={focusOut}
	onkeydown={handleKeydown}
>
	<div
		data-slot="announcement"
		role={announce ? (resolvedPriority === 'assertive' ? 'alert' : 'status') : undefined}
		aria-live={announce ? resolvedPriority : undefined}
		aria-atomic={announce ? 'true' : undefined}
	>
		<strong class={titleClass} data-slot="title">{title}</strong>{#if description}<div
				class={descriptionClass}
				data-slot="description"
			>
				{description}
			</div>{/if}
	</div>
	{#if actionLabel || dismissible}<div class={actionClass} data-slot="actions">
			{#if actionLabel}<ZButton
					size="small"
					variant="secondary"
					onclick={(event) => onAction?.(event)}>{actionLabel}</ZButton
				>{/if}{#if dismissible}<ZButton
					aria-label={resolvedDismissLabel}
					size="small"
					variant="ghost"
					onclick={(event) => onDismiss?.(event)}><X aria-hidden="true" size={16} /></ZButton
				>{/if}
		</div>{/if}
</article>
