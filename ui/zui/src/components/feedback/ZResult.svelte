<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { AlertTone } from './ZAlert.svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZResultProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
		readonly actions?: Snippet;
		readonly children?: Snippet;
		readonly headingLevel?: 2 | 3 | 4;
		readonly icon?: Snippet;
		ref?: HTMLElement | null;
		readonly title: string;
		readonly tone?: AlertTone;
	}
	export const zuiMetadata = {
		category: 'feedback',
		id: 'result',
		importStatement: "import { ZResult } from '@zadmin/zui';",
		name: 'ZResult',
		bindings: [{ description: '真实section引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: ['SSR-stable labelled section'],
		events: [],
		keyboard: [],
		parts: [
			{ description: '图标。', name: 'icon' },
			{ description: '标题。', name: 'title' },
			{ description: '说明。', name: 'content' },
			{ description: '操作。', name: 'actions' }
		],
		props: [
			{ default: '必填', description: '结果标题。', name: 'title', required: true, type: 'string' },
			{
				default: '2',
				description: '结果标题层级。',
				name: 'headingLevel',
				type: '2 | 3 | 4'
			},
			{ default: "'info'", description: '语义tone。', name: 'tone', type: 'AlertTone' }
		],
		since: 'unreleased',
		snippets: [
			{ description: '状态图形。', name: 'icon', type: 'Snippet' },
			{ description: '说明。', name: 'children', type: 'Snippet' },
			{ description: '后续操作。', name: 'actions', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/feedback/ZResult.svelte',
		states: [
			{
				description: '语义tone。',
				name: 'data-tone',
				values: ['info', 'success', 'warning', 'danger']
			}
		],
		status: 'experimental',
		summary: '以具名section组合状态图形、说明和后续操作的Result。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.flexDirection.column;
			s.gap._large;
			s.padding._xlarge;
			s.textAlign.center;
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
	const titleRecipe = defineRecipe({
		base: (s) => {
			s.color._text;
			s.fontSize._xlarge;
			s.margin.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	const contentRecipe = defineRecipe({
		base: (s) => s.color._textMuted,
		variants: {},
		defaultVariants: {}
	});
	const actionsRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.gap._medium;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, titleRecipe);
	registerRecipeHmr(import.meta, contentRecipe);
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
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	let {
		actions,
		children,
		class: className,
		headingLevel = 2,
		icon,
		ref = $bindable(null),
		style,
		title,
		tone = 'info',
		...rest
	}: ZResultProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const titleId = $derived(createZuiId(zui.idPrefix, uid, 'result-title'));
	const heading = $derived(`h${headingLevel}` as 'h2' | 'h3' | 'h4');
	const rootClass = $derived(zui.recipe(recipe, { tone }));
	const titleClass = $derived(zui.recipe(titleRecipe));
	const contentClass = $derived(zui.recipe(contentRecipe));
	const actionsClass = $derived(zui.recipe(actionsRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<section
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-labelledby={titleId}
	data-tone={tone}
>
	{#if icon}<div data-slot="icon" aria-hidden="true">{@render icon()}</div>{/if}
	<svelte:element this={heading} id={titleId} class={titleClass} data-slot="title"
		>{title}</svelte:element
	>
	{#if children}<div class={contentClass} data-slot="content">
			{@render children()}
		</div>{/if}{#if actions}<div class={actionsClass} data-slot="actions">
			{@render actions()}
		</div>{/if}
</section>
