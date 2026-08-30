<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type StatisticTrend = 'down' | 'neutral' | 'up';
	export interface ZStatisticProps extends HTMLAttributes<HTMLDListElement> {
		readonly formatOptions?: Intl.NumberFormatOptions;
		readonly label: string;
		readonly locale?: string;
		readonly prefix?: Snippet;
		ref?: HTMLDListElement | null;
		readonly suffix?: Snippet;
		readonly trend?: number;
		readonly trendLabel?: (trend: number) => string;
		readonly value: bigint | number;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'statistic',
		importStatement: "import { ZStatistic } from '@zadmin/zui';",
		name: 'ZStatistic',
		bindings: [{ description: '真实dl引用。', name: 'ref', type: 'HTMLDListElement | null' }],
		dependencies: ['Intl.NumberFormat', 'native dl/data'],
		events: [],
		keyboard: [],
		parts: [
			{ description: 'dt标签。', name: 'label' },
			{ description: 'data值。', name: 'value' },
			{ description: '趋势。', name: 'trend' }
		],
		props: [
			{
				default: '必填',
				description: '数值。',
				name: 'value',
				required: true,
				type: 'number | bigint'
			},
			{ default: '必填', description: '指标名称。', name: 'label', required: true, type: 'string' },
			{ default: 'Provider locale', description: 'Intl locale。', name: 'locale', type: 'string' },
			{ default: 'undefined', description: '相对趋势，正数向上。', name: 'trend', type: 'number' }
		],
		since: '0.7.0',
		snippets: [
			{ description: '值前缀。', name: 'prefix', type: 'Snippet' },
			{ description: '值后缀。', name: 'suffix', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/data-display/ZStatistic.svelte',
		states: [{ description: '趋势方向。', name: 'data-trend', values: ['up', 'down', 'neutral'] }],
		status: 'experimental',
		summary: '使用Intl格式化并以dl/data表达标签、数值与文字趋势的Statistic。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.margin.px(0);
		},
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
	const valueRecipe = defineRecipe({
		base: (s) => {
			s.fontSize._xlarge;
			s.fontWeight._bold;
			s.marginInlineStart.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	const trendRecipe = defineRecipe({
		base: (s) => {
			s.fontSize._small;
			s.fontWeight._semibold;
		},
		variants: {
			trend: {
				down: (s) => s.color._danger,
				neutral: (s) => s.color._textMuted,
				up: (s) => s.color._success
			}
		},
		defaultVariants: { trend: 'neutral' }
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, labelRecipe);
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
	let {
		class: className,
		formatOptions,
		label,
		locale,
		prefix,
		ref = $bindable(null),
		style,
		suffix,
		trend,
		trendLabel = (change) => `${change > 0 ? '+' : ''}${change}%`,
		value,
		...rest
	}: ZStatisticProps = $props();
	const zui = useZui();
	const formatted = $derived(
		new Intl.NumberFormat(locale ?? zui.locale, formatOptions).format(value)
	);
	const direction = $derived.by<StatisticTrend>(() => {
		if (trend === undefined || trend === 0) return 'neutral';
		if (!Number.isFinite(trend)) throw new TypeError('ZStatistic trend must be finite.');
		return trend > 0 ? 'up' : 'down';
	});
	const rootClass = $derived(zui.recipe(recipe));
	const labelClass = $derived(zui.recipe(labelRecipe));
	const valueClass = $derived(zui.recipe(valueRecipe));
	const trendClass = $derived(zui.recipe(trendRecipe, { trend: direction }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<dl
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
>
	<div>
		<dt class={labelClass} data-slot="label">{label}</dt>
		<dd class={valueClass} data-slot="value">
			{@render prefix?.()}<data value={String(value)}>{formatted}</data>{@render suffix?.()}
		</dd>
		{#if trend !== undefined}<dd class={trendClass} data-slot="trend" data-trend={direction}>
				{trendLabel(trend)}
			</dd>{/if}
	</div>
</dl>
