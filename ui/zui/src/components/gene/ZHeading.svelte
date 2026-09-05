<script module lang="ts">
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
				default: '2',
				description: '决定真实h1–h6语义，不决定视觉字号。',
				name: 'level',
				type: '1 | 2 | 3 | 4 | 5 | 6'
			},
			{
				default: "'xlarge'",
				description: '独立于level的Theme字号token。',
				name: 'size',
				type: "keyof ZuiTheme['fontSize']"
			},
			{
				default: "'compact'",
				description: 'Theme行高token。',
				name: 'lineHeight',
				type: "keyof ZuiTheme['lineHeight']"
			},
			{
				default: "'bold'",
				description: 'Theme字重token。',
				name: 'weight',
				type: "keyof ZuiTheme['fontWeight']"
			},
			{
				default: "'default'",
				description: '语义颜色；不改变heading level。',
				name: 'tone',
				type: "'default' | 'muted' | 'primary' | 'danger'"
			},
			{
				bindable: true,
				default: 'null',
				description: '真实h1–h6元素引用。',
				name: 'ref',
				type: 'HTMLHeadingElement | null'
			}
		],
		since: '0.2.0',
		snippets: [{ description: '标题文本或行内富内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/gene/ZHeading.svelte',
		states: [
			{ description: '真实标题层级。', name: 'data-level', values: ['1', '2', '3', '4', '5', '6'] },
			{
				description: '独立视觉字号。',
				name: 'data-size',
				values: ['small', 'medium', 'large', 'xlarge', 'xxlarge']
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
			size: {
				large: (s) => s.fontSize._large,
				medium: (s) => s.fontSize._medium,
				small: (s) => s.fontSize._small,
				xlarge: (s) => s.fontSize._xlarge,
				xxlarge: (s) => s.fontSize._xxlarge
			},
			tone: {
				danger: (s) => s.color._danger,
				default: (s) => s.color._text,
				muted: (s) => s.color._textMuted,
				primary: (s) => s.color._primary
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
			size: 'xlarge',
			tone: 'default',
			weight: 'bold'
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

	let {
		children,
		class: className,
		level = 2,
		lineHeight = 'compact',
		ref = $bindable(null),
		size = 'xlarge',
		style,
		tone = 'default',
		weight = 'bold',
		...rest
	}: ZHeadingProps = $props();
	const zui = useZui();
	const element = $derived(headingElement(level));
	const rootClass = $derived(zui.recipe(headingRecipe, { lineHeight, size, tone, weight }));
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
	data-size={size}
>
	{@render children?.()}
</svelte:element>
