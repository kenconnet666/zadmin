<script module lang="ts">
	import { typographySizes, typographyTones } from './typography.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type {
		TypographyLineHeight,
		TypographySize,
		TypographyStyleOptions,
		TypographyTone,
		TypographyWeight
	} from './typography.js';

	export type ZTextElement = 'div' | 'label' | 'p' | 'small' | 'span' | 'strong';
	export type ZTextLineHeight = TypographyLineHeight;
	export type ZTextSize = TypographySize;
	export type ZTextTone = TypographyTone;
	export type ZTextWeight = TypographyWeight;

	export interface ZTextProps
		extends Omit<HTMLAttributes<HTMLElement>, 'children'>, TypographyStyleOptions {
		readonly as?: ZTextElement;
		readonly children?: Snippet;
		readonly for?: string;
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
				default: "componentDefaults.text.size → 'medium'",
				description: 'Theme字号token。',
				name: 'size',
				type: "keyof ZuiTheme['fontSize']"
			},
			{
				default: "componentDefaults.text.lineHeight → 'normal'",
				description: 'Theme行高token。',
				name: 'lineHeight',
				type: "keyof ZuiTheme['lineHeight']"
			},
			{
				default: "componentDefaults.text.weight → 'normal'",
				description: 'Theme字重token。',
				name: 'weight',
				type: "keyof ZuiTheme['fontWeight']"
			},
			{
				default: "componentDefaults.text.tone → 'neutral'",
				description: '语义颜色。',
				name: 'tone',
				type: 'ZTextTone'
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

	export const textRecipe = defineRecipe({
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
			tone: 'neutral',
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
	import { resolveComponentDefault } from '../../runtime/foundation/component-defaults.js';

	let {
		as = 'span',
		children,
		class: className,
		lineClamp,
		lineHeight,
		ref = $bindable(null),
		size,
		style,
		tabularNumbers = false,
		tone,
		truncate = false,
		weight,
		...rest
	}: ZTextProps = $props();

	const zui = useZui();
	const defaults = $derived(zui.componentDefaults.text);
	const typography = $derived({
		lineHeight: resolveComponentDefault(lineHeight, defaults?.lineHeight, 'normal'),
		size: resolveComponentDefault(size, defaults?.size, 'medium'),
		tone: resolveComponentDefault(tone, defaults?.tone, 'neutral'),
		weight: resolveComponentDefault(weight, defaults?.weight, 'normal')
	});
	const overflow = $derived(resolveTypographyOverflow({ lineClamp, tabularNumbers, truncate }));
	const rootClass = $derived(
		zui.recipe(textRecipe, { ...typography, truncate: overflow.truncate })
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
