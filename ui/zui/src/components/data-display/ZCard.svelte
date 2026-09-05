<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZuiTheme } from '../../theme/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type CardElement = 'article' | 'div' | 'section';
	export type CardVariant = 'elevated' | 'outlined';

	export interface ZCardProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		readonly actions?: Snippet;
		readonly as?: CardElement;
		readonly bodyPadding?: keyof ZuiTheme['space'];
		readonly children?: Snippet;
		readonly footer?: Snippet;
		readonly header?: Snippet;
		readonly loading?: boolean;
		readonly media?: Snippet;
		ref?: HTMLElement | null;
		readonly variant?: CardVariant;
	}

	export const zuiMetadata = {
		category: 'data-display',
		id: 'card',
		importStatement: "import { ZCard } from '@zadmin/zui';",
		name: 'ZCard',
		bindings: [{ description: '真实Card根元素引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: ['ZSkeleton', 'Theme surface tokens'],
		events: [],
		keyboard: [],
		parts: [
			{ description: '无内边距的媒体区域。', name: 'media' },
			{ description: '标题与摘要区域。', name: 'header' },
			{ description: '正文或加载占位区域。', name: 'body' },
			{ description: '补充说明区域。', name: 'footer' },
			{ description: '与正文分离的补充操作区域。', name: 'actions' }
		],
		props: [
			{
				default: "'large'",
				description: '正文内边距；none适合媒体、表格或代码占满内容区，header/footer保持独立间距。',
				name: 'bodyPadding',
				type: "keyof ZuiTheme['space']"
			},
			{
				default: "'div'",
				description: '真实根语义；只有独立主题内容才使用article或section。',
				name: 'as',
				type: "'div' | 'article' | 'section'"
			},
			{
				default: "componentDefaults.card.variant或'elevated'",
				description: '阴影surface或边框surface；显式值优先于Provider组件默认。',
				name: 'variant',
				type: "'elevated' | 'outlined'"
			},
			{
				default: 'false',
				description: '保持根与非正文区域稳定，以Skeleton替换body并设置aria-busy。',
				name: 'loading',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: 'Card正文。', name: 'children', type: 'Snippet' },
			{ description: '无内边距媒体内容。', name: 'media', type: 'Snippet' },
			{ description: '标题与摘要内容。', name: 'header', type: 'Snippet' },
			{ description: '补充说明内容。', name: 'footer', type: 'Snippet' },
			{ description: '独立补充操作集合。', name: 'actions', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/data-display/ZCard.svelte',
		states: [
			{ description: '当前视觉surface。', name: 'data-variant', values: ['elevated', 'outlined'] },
			{ description: '正文正在加载。', name: 'data-loading', values: ['true'] }
		],
		status: 'stable',
		summary: '默认中性div surface，可显式选择语义根并组合media、header、body、footer与actions。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderRadius._large;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.color._text;
			s.overflow.hidden;
		},
		variants: {
			variant: {
				elevated: (s) => {
					s.borderColor.transparent;
					s.boxShadow._small;
				},
				outlined: (s) => s.borderColor._border
			}
		},
		defaultVariants: { variant: 'elevated' }
	});
	const sectionRecipe = defineRecipe({
		variants: {
			padding: {
				none: (s) => s.padding._none,
				xsmall: (s) => s.padding._xsmall,
				small: (s) => s.padding._small,
				medium: (s) => s.padding._medium,
				large: (s) => s.padding._large,
				xlarge: (s) => s.padding._xlarge
			}
		},
		defaultVariants: { padding: 'large' }
	});
	const headerRecipe = defineRecipe({
		base: (s) => {
			s.borderBottomColor._border;
			s.borderBottomStyle.solid;
			s.borderBottomWidth._hairline;
			s.padding._large;
		},
		variants: {},
		defaultVariants: {}
	});
	const separatedRecipe = defineRecipe({
		base: (s) => {
			s.borderTopColor._border;
			s.borderTopStyle.solid;
			s.borderTopWidth._hairline;
			s.padding._large;
		},
		variants: {},
		defaultVariants: {}
	});
	const actionsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderTopColor._border;
			s.borderTopStyle.solid;
			s.borderTopWidth._hairline;
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._small;
			s.justifyContent.end;
			s.padding._large;
		},
		variants: {},
		defaultVariants: {}
	});
	const loadingRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._medium;
		},
		variants: {},
		defaultVariants: {}
	});

	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, sectionRecipe);
	registerRecipeHmr(import.meta, headerRecipe);
	registerRecipeHmr(import.meta, separatedRecipe);
	registerRecipeHmr(import.meta, actionsRecipe);
	registerRecipeHmr(import.meta, loadingRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import ZSkeleton from './ZSkeleton.svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';

	let {
		'aria-busy': ariaBusy,
		actions,
		as = 'div',
		bodyPadding = 'large',
		children,
		class: className,
		footer,
		header,
		loading = false,
		media,
		ref = $bindable(null),
		style,
		variant,
		...rest
	}: ZCardProps = $props();

	const zui = useZui();
	const componentDefaults = $derived(zui.componentDefaults.card);
	const resolvedVariant = $derived(variant ?? componentDefaults?.variant ?? 'elevated');
	const rootClass = $derived(zui.recipe(rootRecipe, { variant: resolvedVariant }));
	const sectionClass = $derived(zui.recipe(sectionRecipe, { padding: bodyPadding }));
	const headerClass = $derived(zui.recipe(headerRecipe));
	const separatedClass = $derived(zui.recipe(separatedRecipe));
	const actionsClass = $derived(zui.recipe(actionsRecipe));
	const loadingClass = $derived(zui.recipe(loadingRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<svelte:element
	this={as}
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-busy={loading ? true : ariaBusy}
	data-loading={loading || undefined}
	data-variant={resolvedVariant}
>
	{#if media}<div data-slot="media">{@render media()}</div>{/if}
	{#if header}<header class={headerClass} data-slot="header">{@render header()}</header>{/if}
	<div class={sectionClass} data-slot="body">
		{#if loading}
			<div class={loadingClass} data-slot="loading">
				<ZSkeleton width="42%" />
				<ZSkeleton />
				<ZSkeleton width="76%" />
			</div>
		{:else}
			{@render children?.()}
		{/if}
	</div>
	{#if footer}<footer class={separatedClass} data-slot="footer">{@render footer()}</footer>{/if}
	{#if actions}<div class={actionsClass} data-slot="actions">{@render actions()}</div>{/if}
</svelte:element>
