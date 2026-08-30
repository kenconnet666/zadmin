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
		dependencies: ['native live-region roles'],
		events: [
			{
				description: '调用方持有的关闭动作。',
				name: 'onDismiss',
				type: '(event: MouseEvent) => void'
			}
		],
		keyboard: [{ description: '激活可选关闭按钮。', key: 'Enter / Space' }],
		parts: [
			{ description: '标题。', name: 'title' },
			{ description: '正文。', name: 'content' },
			{ description: '操作。', name: 'action' }
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
			{ default: 'false', description: '显示关闭按钮。', name: 'dismissible', type: 'boolean' }
		],
		since: '0.7.0',
		snippets: [
			{ description: '反馈正文。', name: 'children', type: 'Snippet' },
			{ description: '可选操作。', name: 'action', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/feedback/ZAlert.svelte',
		states: [
			{
				description: '语义tone。',
				name: 'data-tone',
				values: ['info', 'success', 'warning', 'danger']
			}
		],
		status: 'experimental',
		summary: '拥有显式live优先级、语义tone和调用方关闭动作的行内Alert。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderRadius._large;
			s.borderStyle.solid;
			s.borderWidth._hairline;
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
	const actionsRecipe = defineRecipe({
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
	registerRecipeHmr(import.meta, actionsRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
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
		dismissLabel = 'Dismiss alert',
		live = 'polite',
		onDismiss,
		ref = $bindable(null),
		style,
		title,
		tone = 'info',
		...rest
	}: ZAlertProps = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(recipe, { tone }));
	const titleClass = $derived(zui.recipe(titleRecipe));
	const actionsClass = $derived(zui.recipe(actionsRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const role = $derived(live === 'off' ? undefined : live === 'assertive' ? 'alert' : 'status');
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	{role}
	aria-live={live === 'off' ? undefined : live}
	aria-atomic={role ? 'true' : undefined}
	data-tone={tone}
>
	<strong class={titleClass} data-slot="title">{title}</strong>
	{#if children}<div data-slot="content">{@render children()}</div>{/if}
	{#if action || dismissible}<div class={actionsClass} data-slot="action">
			{@render action?.()}{#if dismissible}<button
					type="button"
					aria-label={dismissLabel}
					onclick={(event) => onDismiss?.(event)}>×</button
				>{/if}
		</div>{/if}
</div>
