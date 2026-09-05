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

	export type ZTextElement = 'div' | 'label' | 'p' | 'small' | 'span' | 'strong';
	export type ZTextLineHeight = TypographyLineHeight;
	export type ZTextSize = TypographySize;
	export type ZTextTone = TypographyTone;
	export type ZTextWeight = TypographyWeight;

	export interface ZTextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		readonly as?: ZTextElement;
		readonly children?: Snippet;
		readonly for?: string;
		readonly lineClamp?: number;
		readonly lineHeight?: ZTextLineHeight;
		readonly size?: ZTextSize;
		readonly tabularNumbers?: boolean;
		readonly tone?: ZTextTone;
		readonly truncate?: boolean;
		readonly weight?: ZTextWeight;
		ref?: HTMLElement | null;
	}

	export const zuiMetadata = {
		category: 'gene',
		id: 'text',
		importStatement: "import { ZText } from '@zadmin/zui';",
		name: 'ZText',
		bindings: [{ description: '真实文本根元素引用。', name: 'ref', type: 'HTMLElement | null' }],
		dependencies: [],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: "'span'",
				description: '有限的真实语义元素。',
				name: 'as',
				type: "'div' | 'label' | 'p' | 'small' | 'span' | 'strong'"
			},
			{
				default: 'undefined',
				description: 'as=label时关联原生表单control。',
				name: 'for',
				type: 'string'
			},
			{
				default: "'medium'",
				description: 'Theme字号token。',
				name: 'size',
				type: "keyof ZuiTheme['fontSize']"
			},
			{
				default: "'normal'",
				description: 'Theme行高token。',
				name: 'lineHeight',
				type: "keyof ZuiTheme['lineHeight']"
			},
			{
				default: "'normal'",
				description: 'Theme字重token。',
				name: 'weight',
				type: "keyof ZuiTheme['fontWeight']"
			},
			{
				default: "'default'",
				description: '语义颜色。',
				name: 'tone',
				type: "'default' | 'muted' | 'primary' | 'danger'"
			},
			{ default: 'false', description: '单行省略显示。', name: 'truncate', type: 'boolean' },
			{
				default: 'undefined',
				description: '多行省略的正整数行数；与truncate互斥。',
				name: 'lineClamp',
				type: 'number'
			},
			{
				default: 'false',
				description: '启用tabular-nums，适合指标、金额和时间列。',
				name: 'tabularNumbers',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实文本元素引用。',
				name: 'ref',
				type: 'HTMLElement | null'
			}
		],
		since: '0.1.0',
		snippets: [{ description: '文本或富内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/gene/ZText.svelte',
		states: [],
		status: 'stable',
		summary: '在有限正文语义元素上组合Theme字号、行高、字重、tone、单/多行省略与表格数字。'
	} as const satisfies ZuiComponentMetadata;

	const textRecipe = defineRecipe({
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
			truncate: {
				false: () => undefined,
				true: (s) => {
					s.overflow.hidden;
					s.textOverflow.ellipsis;
					s.whiteSpace.nowrap;
				}
			},
			weight: {
				bold: (s) => s.fontWeight._bold,
				medium: (s) => s.fontWeight._medium,
				normal: (s) => s.fontWeight._normal,
				semibold: (s) => s.fontWeight._semibold
			}
		},
		defaultVariants: {
			lineHeight: 'normal',
			size: 'medium',
			tone: 'default',
			truncate: false,
			weight: 'normal'
		}
	});

	registerRecipeHmr(import.meta, textRecipe);
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
	import { resolveTypographyOverflow } from './typography.js';

	let {
		as = 'span',
		children,
		class: className,
		lineClamp,
		lineHeight = 'normal',
		ref = $bindable(null),
		size = 'medium',
		style,
		tabularNumbers = false,
		tone = 'default',
		truncate = false,
		weight = 'normal',
		...rest
	}: ZTextProps = $props();

	const zui = useZui();
	const overflow = $derived(resolveTypographyOverflow({ lineClamp, tabularNumbers, truncate }));
	const rootClass = $derived(
		zui.recipe(textRecipe, { lineHeight, size, tone, truncate: overflow.truncate, weight })
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const authoredStyle = $derived(mergeStyles(style, overflow.inlineStyle));
	const initialStyle = untrack(() =>
		mergeStyles(authoredStyle, serializeIcssVariables(icssVariables))
	);
</script>

<svelte:element
	this={as}
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style: authoredStyle, variables: icssVariables }}
	data-line-clamp={overflow.lineClamp}
	data-tabular-numbers={tabularNumbers || undefined}
>
	{@render children?.()}
</svelte:element>
