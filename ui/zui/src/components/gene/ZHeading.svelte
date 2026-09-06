<script module lang="ts">
	import { typographySizes, typographyTones } from './typography.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type {
		TypographyLineHeight,
		TypographySize,
		TypographyTone,
		TypographyWeight
	} from './typography.js';

	export type ZHeadingWrap = 'balance' | 'pretty' | 'wrap' | 'nowrap';
	export type ZHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
	export type ZHeadingLineHeight = TypographyLineHeight;
	export type ZHeadingSize = TypographySize;
	export type ZHeadingTone = TypographyTone;
	export type ZHeadingWeight = TypographyWeight;

	export interface ZHeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
		readonly children?: Snippet;
		readonly level?: ZHeadingLevel;
		readonly lineHeight?: ZHeadingLineHeight;
		ref?: HTMLHeadingElement | null;
		readonly size?: ZHeadingSize;
		readonly tone?: ZHeadingTone;
		readonly weight?: ZHeadingWeight;
		readonly wrap?: ZHeadingWrap;
	}

	export const zuiMetadata = {
		category: 'gene',
		id: 'heading',
		importStatement: "import { ZHeading } from '@zadmin/zui';",
		name: 'ZHeading',
		bindings: [
			{ description: '真实h1–h6元素引用。', name: 'ref', type: 'HTMLHeadingElement | null' }
		],
		dependencies: ['typography contract'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: "componentDefaults.heading.wrap → 'balance'",
				description: '标题换行策略；balance平衡多行标题，nowrap仅用于已有宽度保障的短标题。',
				name: 'wrap',
				type: 'ZHeadingWrap'
			},
			{
				default: '2',
				description: '决定真实h1–h6语义，不决定视觉字号。',
				name: 'level',
				type: '1 | 2 | 3 | 4 | 5 | 6'
			},
			{
				default: "componentDefaults.heading.size → 'xxlarge'",
				description: '独立于level的Theme字号token。',
				name: 'size',
				type: "keyof ZuiTheme['fontSize']"
			},
			{
				default: "componentDefaults.heading.lineHeight → 'compact'",
				description: 'Theme行高token。',
				name: 'lineHeight',
				type: "keyof ZuiTheme['lineHeight']"
			},
			{
				default: "componentDefaults.heading.weight → 'bold'",
				description: 'Theme字重token。',
				name: 'weight',
				type: "keyof ZuiTheme['fontWeight']"
			},
			{
				default: "componentDefaults.heading.tone → 'neutral'",
				description: '语义颜色；不改变heading level。',
				name: 'tone',
				type: 'ZHeadingTone'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实h1–h6元素引用。',
				name: 'ref',
				type: 'HTMLHeadingElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '标题文本或行内富内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/gene/ZHeading.svelte',
		states: [
			{
				description: '标题换行策略。',
				name: 'data-wrap',
				values: ['balance', 'pretty', 'wrap', 'nowrap']
			},
			{ description: '真实标题层级。', name: 'data-level', values: ['1', '2', '3', '4', '5', '6'] },
			{
				description: '独立视觉字号。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'xxxlarge', 'xxxxlarge']
			}
		],
		status: 'stable',
		summary: '始终渲染真实h1–h6，并把文档层级与Theme视觉字号、行高、字重和tone解耦。'
	} as const satisfies ZuiComponentMetadata;

	const headingRecipe = defineRecipe({
		base: (s) => {
			s.fontFamily._sans;
			s.margin.px(0);
		},
		variants: {
			lineHeight: {
				compact: (s) => s.lineHeight._compact,
				normal: (s) => s.lineHeight._normal,
				relaxed: (s) => s.lineHeight._relaxed
			},
			size: typographySizes,
			tone: typographyTones,
			wrap: {
				balance: (s) => s.textWrap.balance,
				pretty: (s) => s.textWrap.pretty,
				wrap: (s) => s.textWrap.wrap,
				nowrap: (s) => s.textWrap.nowrap
			},
			weight: {
				bold: (s) => s.fontWeight._bold,
				medium: (s) => s.fontWeight._medium,
				normal: (s) => s.fontWeight._normal,
				semibold: (s) => s.fontWeight._semibold
			}
		},
		defaultVariants: {
			lineHeight: 'compact',
			size: 'xxlarge',
			tone: 'neutral',
			weight: 'bold',
			wrap: 'balance'
		}
	});
	registerRecipeHmr(import.meta, headingRecipe);
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
	import { headingElement } from './typography.js';
	import { resolveComponentDefault } from '../../runtime/foundation/component-defaults.js';

	let {
		children,
		class: className,
		level = 2,
		lineHeight,
		ref = $bindable(null),
		size,
		style,
		tone,
		weight,
		wrap,
		...rest
	}: ZHeadingProps = $props();
	const zui = useZui();
	const defaults = $derived(zui.componentDefaults.heading);
	const typography = $derived({
		lineHeight: resolveComponentDefault(lineHeight, defaults?.lineHeight, 'compact'),
		size: resolveComponentDefault(size, defaults?.size, 'xxlarge'),
		tone: resolveComponentDefault(tone, defaults?.tone, 'neutral'),
		weight: resolveComponentDefault(weight, defaults?.weight, 'bold'),
		wrap: resolveComponentDefault(wrap, defaults?.wrap, 'balance')
	});
	const element = $derived(headingElement(level));
	const rootClass = $derived(zui.recipe(headingRecipe, typography));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<svelte:element
	this={element}
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	data-level={level}
	data-size={typography.size}
	data-wrap={typography.wrap}
>
	{@render children?.()}
</svelte:element>
