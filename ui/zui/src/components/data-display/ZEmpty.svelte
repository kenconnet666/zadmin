<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZEmptyProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
		readonly actions?: Snippet;
		readonly children?: Snippet;
		readonly headingLevel?: 2 | 3 | 4;
		readonly icon?: Snippet;
		ref?: HTMLElement | null;
		readonly title: string;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'empty',
		importStatement: "import { ZEmpty } from '@zadmin/zui';",
		name: 'ZEmpty',
		bindings: [{ description: '真实section引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: ['SSR-stable labelled section'],
		events: [],
		keyboard: [],
		parts: [
			{ description: '装饰图形。', name: 'icon' },
			{ description: '标题。', name: 'title' },
			{ description: '说明。', name: 'content' },
			{ description: '操作。', name: 'actions' }
		],
		props: [
			{
				default: '必填',
				description: '空状态标题。',
				name: 'title',
				required: true,
				type: 'string'
			},
			{ default: '2', description: '页面标题层级。', name: 'headingLevel', type: '2 | 3 | 4' }
		],
		since: 'unreleased',
		snippets: [
			{ description: '装饰图形。', name: 'icon', type: 'Snippet' },
			{ description: '说明。', name: 'children', type: 'Snippet' },
			{ description: '恢复操作。', name: 'actions', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/data-display/ZEmpty.svelte',
		states: [],
		status: 'experimental',
		summary: '以具名section组合空状态说明与恢复操作的Empty。'
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
		variants: {},
		defaultVariants: {}
	});
	const titleRecipe = defineRecipe({
		base: (s) => {
			s.fontSize._large;
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
	const actionRecipe = defineRecipe({
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
	registerRecipeHmr(import.meta, actionRecipe);
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
		...rest
	}: ZEmptyProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const titleId = $derived(createZuiId(zui.idPrefix, uid, 'empty-title'));
	const heading = $derived(`h${headingLevel}` as 'h2' | 'h3' | 'h4');
	const rootClass = $derived(zui.recipe(recipe));
	const titleClass = $derived(zui.recipe(titleRecipe));
	const contentClass = $derived(zui.recipe(contentRecipe));
	const actionClass = $derived(zui.recipe(actionRecipe));
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
>
	{#if icon}<div data-slot="icon" aria-hidden="true">{@render icon()}</div>{/if}<svelte:element
		this={heading}
		id={titleId}
		class={titleClass}
		data-slot="title">{title}</svelte:element
	>{#if children}<div class={contentClass} data-slot="content">
			{@render children()}
		</div>{/if}{#if actions}<div class={actionClass} data-slot="actions">
			{@render actions()}
		</div>{/if}
</section>
