<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	import type { ZSemanticTone } from '../../theme/semantics.js';
	import {
		typographySizes,
		typographyTones,
		type TypographySize,
		type TypographyTone
	} from '../gene/typography.js';
	export type StatisticTone = TypographyTone;
	export type StatisticTrend = 'down' | 'neutral' | 'up';
	export type StatisticValue = bigint | number;

	export interface StatisticFormatterContext {
		readonly locale: string;
		readonly options: Intl.NumberFormatOptions;
		readonly precision: number | undefined;
	}

	export type StatisticFormatter = (
		value: StatisticValue,
		context: StatisticFormatterContext
	) => string;
	export type StatisticTrendFormatter = (
		trend: number,
		context: Readonly<{ locale: string; options: Intl.NumberFormatOptions }>
	) => string;

	export interface ZStatisticProps extends Omit<HTMLAttributes<HTMLDListElement>, 'prefix'> {
		readonly formatOptions?: Intl.NumberFormatOptions;
		readonly formatter?: StatisticFormatter;
		readonly label: string;
		readonly loading?: boolean;
		readonly locale?: string;
		readonly precision?: number;
		readonly prefix?: Snippet;
		ref?: HTMLDListElement | null;
		readonly suffix?: Snippet;
		readonly tone?: StatisticTone;
		readonly trend?: number;
		readonly trendTone?: ZSemanticTone;
		readonly trendFormatOptions?: Intl.NumberFormatOptions;
		readonly trendLabel?: StatisticTrendFormatter;
		readonly value: StatisticValue;
		readonly valueSize?: TypographySize;
	}

	export const zuiMetadata = {
		category: 'data-display',
		id: 'statistic',
		importStatement: "import { ZStatistic } from '@zadmin/zui';",
		name: 'ZStatistic',
		bindings: [{ description: '真实dl引用。', name: 'ref', type: 'HTMLDListElement | null' }],
		dependencies: ['Intl.NumberFormat', 'ZSkeleton', 'native dl/data'],
		events: [],
		keyboard: [],
		parts: [
			{ description: 'dt指标名称。', name: 'label' },
			{ description: 'prefix、value和suffix内容行。', name: 'content' },
			{ description: '机器可读data与格式化文本。', name: 'value' },
			{ description: '值前内容。', name: 'prefix' },
			{ description: '值后内容。', name: 'suffix' },
			{ description: '具名文字趋势。', name: 'trend' },
			{ description: '加载占位。', name: 'loading' }
		],
		props: [
			{
				default: "'neutral'",
				description: '趋势的业务含义；增减方向不会自动判断成功或危险。',
				name: 'trendTone',
				type: 'ZSemanticTone'
			},
			{
				default: "'xxlarge'",
				description: '主数值的Theme字号，默认24px；不改变标签和趋势的层次。',
				name: 'valueSize',
				type: 'TypographySize'
			},
			{
				default: '必填',
				description: '有限number或任意精度bigint；不拥有动画或计时状态。',
				name: 'value',
				required: true,
				type: 'number | bigint'
			},
			{ default: '必填', description: '指标名称。', name: 'label', required: true, type: 'string' },
			{
				default: 'Provider locale',
				description: 'Intl NumberFormat locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: 'undefined',
				description: '同时设置最小和最大小数位。',
				name: 'precision',
				type: 'number'
			},
			{
				default: 'undefined',
				description: 'Intl NumberFormat选项；precision最终覆盖小数位。',
				name: 'formatOptions',
				type: 'Intl.NumberFormatOptions',
				opaque: {
					kind: 'external-descriptor',
					resolution: 'external-resolved',
					type: 'Intl.NumberFormatOptions',
					source: 'ECMAScript Intl.NumberFormat',
					reason: 'Intl descriptor由平台规范定义并由组件透传。',
					owner: 'Intl runtime'
				}
			},
			{
				default: 'Intl.NumberFormat',
				description: '纯格式化函数；接收value与已解析locale/options。',
				name: 'formatter',
				type: 'StatisticFormatter'
			},
			{
				default: "'neutral'",
				description: '值的有限语义色调。',
				name: 'tone',
				type: 'StatisticTone'
			},
			{
				default: 'undefined',
				description: '相对百分比趋势；必须是有限number。',
				name: 'trend',
				type: 'number'
			},
			{
				default: '本地化百分比',
				description: '趋势文本formatter；颜色之外始终保留正负文字。',
				name: 'trendLabel',
				type: 'StatisticTrendFormatter'
			},
			{
				default: 'percent + signDisplay',
				description: '默认趋势Intl formatter选项。',
				name: 'trendFormatOptions',
				type: 'Intl.NumberFormatOptions'
			},
			{
				default: 'false',
				description: '设置aria-busy并以ZSkeleton替代内容值。',
				name: 'loading',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: '格式化值前内容。', name: 'prefix', type: 'Snippet' },
			{ description: '格式化值后内容。', name: 'suffix', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/data-display/ZStatistic.svelte',
		states: [
			{
				description: '主数值字号。',
				name: 'data-value-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'xxxlarge', 'xxxxlarge']
			},
			{ description: '趋势方向。', name: 'data-trend', values: ['up', 'down', 'neutral'] },
			{
				description: '值tone。',
				name: 'data-tone',
				values: ['neutral', 'muted', 'primary', 'info', 'success', 'warning', 'danger']
			},
			{ description: '加载状态。', name: 'data-loading', values: ['true'] }
		],
		status: 'stable',
		summary:
			'以dl/data提供SSR稳定、locale/precision/formatter可控、支持affix、tone、文字趋势和Skeleton loading的静态指标。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => s.margin.px(0),
		variants: {},
		defaultVariants: {}
	});
	const labelRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.baseline;
			s.display.flex;
			s.gap._small;
			s.marginInlineStart.px(0);
			s.minWidth.px(0);
		},
		variants: {
			tone: typographyTones
		},
		defaultVariants: { tone: 'neutral' }
	});
	const valueRecipe = defineRecipe({
		base: (s) => {
			s.fontVariantNumeric.raw('tabular-nums');
			s.fontWeight._bold;
			s.minWidth.px(0);
		},
		variants: { size: typographySizes },
		defaultVariants: { size: 'xxlarge' }
	});
	const trendRecipe = defineRecipe({
		base: (s) => {
			s.fontSize._small;
			s.fontVariantNumeric.raw('tabular-nums');
			s.fontWeight._semibold;
			s.marginInlineStart.px(0);
		},
		variants: { tone: typographyTones },
		defaultVariants: { tone: 'neutral' }
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, labelRecipe);
	registerRecipeHmr(import.meta, contentRecipe);
	registerRecipeHmr(import.meta, valueRecipe);
	registerRecipeHmr(import.meta, trendRecipe);
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
	import ZSkeleton from './ZSkeleton.svelte';

	let {
		class: className,
		formatOptions,
		formatter,
		label,
		loading = false,
		locale,
		precision,
		prefix,
		ref = $bindable(null),
		style,
		suffix,
		tone = 'neutral',
		trend,
		trendTone = 'neutral',
		trendFormatOptions,
		trendLabel,
		value,
		valueSize = 'xxlarge',
		...rest
	}: ZStatisticProps = $props();
	const zui = useZui();
	const resolvedLocale = $derived(locale ?? zui.locale);
	const contract = $derived.by(() => {
		if (typeof value === 'number' && !Number.isFinite(value))
			throw new TypeError('ZStatistic value must be finite.');
		if (
			precision !== undefined &&
			(!Number.isInteger(precision) || precision < 0 || precision > 100)
		)
			throw new RangeError('ZStatistic precision must be an integer from 0 through 100.');
		if (trend !== undefined && !Number.isFinite(trend))
			throw new TypeError('ZStatistic trend must be finite.');
		const options: Intl.NumberFormatOptions = Object.freeze({
			...formatOptions,
			...(precision === undefined
				? {}
				: { maximumFractionDigits: precision, minimumFractionDigits: precision })
		});
		return Object.freeze({ options, precision });
	});
	const formatterContext = $derived<StatisticFormatterContext>(
		Object.freeze({
			locale: resolvedLocale,
			options: contract.options,
			precision: contract.precision
		})
	);
	const formatted = $derived(
		formatter?.(value, formatterContext) ??
			new Intl.NumberFormat(resolvedLocale, contract.options).format(value)
	);
	const direction = $derived.by<StatisticTrend>(() => {
		if (trend === undefined || trend === 0) return 'neutral';
		return trend > 0 ? 'up' : 'down';
	});
	const resolvedTrendOptions = $derived<Intl.NumberFormatOptions>(
		Object.freeze({
			maximumFractionDigits: 2,
			signDisplay: 'exceptZero',
			style: 'percent',
			...trendFormatOptions
		})
	);
	const formattedTrend = $derived.by(() => {
		if (trend === undefined) return undefined;
		const context = Object.freeze({ locale: resolvedLocale, options: resolvedTrendOptions });
		return (
			trendLabel?.(trend, context) ??
			new Intl.NumberFormat(resolvedLocale, resolvedTrendOptions).format(trend / 100)
		);
	});
	const rootClass = $derived(zui.recipe(rootRecipe));
	const labelClass = $derived(zui.recipe(labelRecipe));
	const contentClass = $derived(zui.recipe(contentRecipe, { tone }));
	const valueClass = $derived(zui.recipe(valueRecipe, { size: valueSize }));
	const trendClass = $derived(zui.recipe(trendRecipe, { tone: trendTone }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<dl
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-busy={loading || undefined}
	data-loading={loading || undefined}
	data-tone={tone}
	data-value-size={valueSize}
>
	<div>
		<dt class={labelClass} data-slot="label">{label}</dt>
		<dd class={contentClass} data-slot="content">
			{#if loading}
				<span data-slot="loading"><ZSkeleton height="1.5em" width="8ch" /></span>
			{:else}
				{#if prefix}<span data-slot="prefix">{@render prefix()}</span>{/if}
				<data class={valueClass} data-slot="value" value={String(value)}>{formatted}</data>
				{#if suffix}<span data-slot="suffix">{@render suffix()}</span>{/if}
			{/if}
		</dd>
		{#if !loading && formattedTrend !== undefined}
			<dd class={trendClass} data-slot="trend" data-trend={direction} data-tone={trendTone}>
				{formattedTrend}
			</dd>
		{/if}
	</div>
</dl>
