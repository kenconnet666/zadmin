<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type AlertLive = 'assertive' | 'off' | 'polite';
	export type AlertTone = 'danger' | 'info' | 'success' | 'warning';
	export interface ZAlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
		readonly action?: Snippet;
		readonly children?: Snippet;
		readonly dismissLabel?: string;
		readonly dismissible?: boolean;
		readonly icon?: Snippet | null;
		readonly live?: AlertLive;
		readonly onDismiss?: (event: MouseEvent) => void;
		ref?: HTMLDivElement | null;
		readonly title: string;
		readonly tone?: AlertTone;
	}
	export const zuiMetadata = {
		category: 'feedback',
		id: 'alert',
		importStatement: "import { ZAlert } from '@zadmin/zui';",
		name: 'ZAlert',
		bindings: [{ description: '真实反馈根引用。', name: 'ref', type: 'HTMLDivElement | null' }],
		dependencies: ['native live-region roles', '@lucide/svelte', 'ZButton', 'Provider locale'],
		events: [
			{
				description: '调用方持有的关闭动作。',
				name: 'onDismiss',
				type: '(event: MouseEvent) => void'
			}
		],
		keyboard: [{ description: '激活可选关闭按钮。', key: 'Enter / Space' }],
		parts: [
			{ description: 'decorative语义tone图标。', name: 'icon' },
			{ description: '标题与正文布局。', name: 'section' },
			{ description: '标题。', name: 'title' },
			{ description: '正文。', name: 'content' },
			{ description: '操作集合。', name: 'actions' },
			{ description: '本地化关闭按钮。', name: 'dismiss' }
		],
		props: [
			{ default: '必填', description: '反馈标题。', name: 'title', required: true, type: 'string' },
			{
				default: "'info'",
				description: '语义tone。',
				name: 'tone',
				type: "'info' | 'success' | 'warning' | 'danger'"
			},
			{
				default: "'polite'",
				description: 'live region优先级；off不创建status角色。',
				name: 'live',
				type: "'off' | 'polite' | 'assertive'"
			},
			{ default: 'false', description: '显示关闭按钮。', name: 'dismissible', type: 'boolean' },
			{
				default: 'localePack.feedback.dismissAlert',
				description: '关闭按钮可访问名称；显式值优先于Provider locale。',
				name: 'dismissLabel',
				type: 'string'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: '反馈正文。', name: 'children', type: 'Snippet' },
			{ description: '可选操作。', name: 'action', type: 'Snippet' },
			{
				description: '覆盖默认decorative tone图标；null隐藏，交互控件必须放在action。',
				name: 'icon',
				type: 'Snippet | null'
			}
		],
		source: 'ui/zui/src/components/feedback/ZAlert.svelte',
		states: [
			{
				description: '语义tone。',
				name: 'data-tone',
				values: ['info', 'success', 'warning', 'danger']
			},
			{ description: 'live优先级。', name: 'data-live', values: ['off', 'polite', 'assertive'] }
		],
		status: 'stable',
		summary:
			'用统一tone图标、title/body/action/dismiss分区和显式live优先级表达持久行内反馈；调用方拥有插入、关闭与业务状态。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.alignItems.start;
			s.color._text;
			s.fontFamily._sans;
			s.fontSize._medium;
			s.lineHeight._normal;
			s.borderRadius._large;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.display.grid;
			s.gap._medium;
			s.gridTemplateColumns.raw('minmax(0, 1fr) auto');
			s.padding._large;
		},
		variants: {
			tone: {
				danger: (s) => {
					s.backgroundColor._dangerSubtle;
					s.borderColor._danger;
				},
				info: (s) => {
					s.backgroundColor._accentSubtle;
					s.borderColor._accent;
				},
				success: (s) => {
					s.backgroundColor._successSubtle;
					s.borderColor._success;
				},
				warning: (s) => {
					s.backgroundColor._warningSubtle;
					s.borderColor._warning;
				}
			}
		},
		defaultVariants: { tone: 'info' }
	});
	const sectionRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.start;
			s.display.flex;
			s.gap._medium;
			s.minWidth.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	const iconRecipe = defineRecipe({
		base: (s) => {
			s.display.inlineFlex;
			s.flexShrink(0);
		},
		variants: {
			tone: {
				danger: (s) => s.color._danger,
				info: (s) => s.color._accent,
				success: (s) => s.color._success,
				warning: (s) => s.color._warning
			}
		},
		defaultVariants: { tone: 'info' }
	});
	const bodyRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._xsmall;
			s.minWidth.px(0);
			s.overflowWrap.raw('anywhere');
		},
		variants: {},
		defaultVariants: {}
	});
	const titleRecipe = defineRecipe({
		base: (s) => s.fontWeight._semibold,
		variants: {},
		defaultVariants: {}
	});
	const actionsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, sectionRecipe);
	registerRecipeHmr(import.meta, iconRecipe);
	registerRecipeHmr(import.meta, bodyRecipe);
	registerRecipeHmr(import.meta, titleRecipe);
	registerRecipeHmr(import.meta, actionsRecipe);
</script>

<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Info from '@lucide/svelte/icons/info';
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
		action,
		children,
		class: className,
		dismissible = false,
		dismissLabel,
		icon,
		live = 'polite',
		onDismiss,
		ref = $bindable(null),
		style,
		title,
		tone = 'info',
		...rest
	}: ZAlertProps = $props();
	const zui = useZui();
	const resolvedLive = $derived.by(() => {
		if (!['assertive', 'off', 'polite'].includes(live)) {
			throw new TypeError('ZAlert live must be off, polite or assertive.');
		}
		return live;
	});
	const resolvedTone = $derived.by(() => {
		if (!['danger', 'info', 'success', 'warning'].includes(tone)) {
			throw new TypeError('ZAlert tone must be info, success, warning or danger.');
		}
		return tone;
	});
	const resolvedTitle = $derived.by(() => {
		if (typeof title !== 'string' || title.trim().length === 0) {
			throw new TypeError('ZAlert title must be a non-empty string.');
		}
		return title;
	});
	const resolvedDismissLabel = $derived.by(() => {
		const next = dismissLabel ?? zui.localePack.feedback.dismissAlert;
		if (dismissible && next.trim().length === 0) {
			throw new TypeError('ZAlert dismissLabel must be non-empty when dismissible.');
		}
		return next;
	});
	const rootClass = $derived(zui.recipe(recipe, { tone: resolvedTone }));
	const sectionClass = $derived(zui.recipe(sectionRecipe));
	const iconClass = $derived(zui.recipe(iconRecipe, { tone: resolvedTone }));
	const bodyClass = $derived(zui.recipe(bodyRecipe));
	const titleClass = $derived(zui.recipe(titleRecipe));
	const actionsClass = $derived(zui.recipe(actionsRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const role = $derived(
		resolvedLive === 'off' ? undefined : resolvedLive === 'assertive' ? 'alert' : 'status'
	);
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	{role}
	aria-live={resolvedLive === 'off' ? undefined : resolvedLive}
	aria-atomic={role ? 'true' : undefined}
	data-live={resolvedLive}
	data-tone={resolvedTone}
>
	<div class={sectionClass} data-slot="section">
		{#if icon !== null}<span class={iconClass} data-slot="icon" aria-hidden="true">
				{#if icon}
					{@render icon()}
				{:else if resolvedTone === 'danger'}
					<CircleX aria-hidden="true" size={20} />
				{:else if resolvedTone === 'success'}
					<CircleCheck aria-hidden="true" size={20} />
				{:else if resolvedTone === 'warning'}
					<CircleAlert aria-hidden="true" size={20} />
				{:else}
					<Info aria-hidden="true" size={20} />
				{/if}
			</span>{/if}
		<div class={bodyClass} data-slot="body">
			<strong class={titleClass} data-slot="title">{resolvedTitle}</strong>
			{#if children}<div data-slot="content">{@render children()}</div>{/if}
		</div>
	</div>
	{#if action || dismissible}<div class={actionsClass} data-slot="actions">
			{@render action?.()}{#if dismissible}<ZButton
					aria-label={resolvedDismissLabel}
					data-slot="dismiss"
					size="small"
					variant="ghost"
					onclick={(event) => onDismiss?.(event)}><X aria-hidden="true" size={16} /></ZButton
				>{/if}
		</div>{/if}
</div>
