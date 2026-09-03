<script module lang="ts">
	import type { HTMLMeterAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { MeterRange, MeterState } from '../../runtime/progress.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZMeterProps extends Omit<
		HTMLMeterAttributes,
		'high' | 'low' | 'max' | 'min' | 'optimum' | 'value'
	> {
		readonly formatValue?: (value: number, range: MeterRange, state: MeterState) => string;
		readonly high?: number;
		readonly label: string;
		readonly low?: number;
		readonly max?: number;
		readonly min?: number;
		readonly optimum?: number;
		ref?: HTMLMeterElement | null;
		readonly value: number;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'meter',
		importStatement: "import { ZMeter } from '@zadmin/zui';",
		name: 'ZMeter',
		bindings: [{ description: '真实meter引用。', name: 'ref', type: 'HTMLMeterElement | null' }],
		dependencies: ['native meter', 'strict MeterRange normalization'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{ default: '必填', description: '当前标量。', name: 'value', required: true, type: 'number' },
			{
				default: '必填',
				description: '可访问名称。',
				name: 'label',
				required: true,
				type: 'string'
			},
			{
				default: '0',
				description: '规范化范围的下界。',
				name: 'min',
				type: 'number'
			},
			{
				default: '100',
				description: '规范化范围的上界。',
				name: 'max',
				type: 'number'
			},
			{
				default: 'min',
				description: '较低阈值；缺失时使用min。',
				name: 'low',
				type: 'number'
			},
			{
				default: 'max',
				description: '较高阈值；缺失时使用max。',
				name: 'high',
				type: 'number'
			},
			{
				default: '(min + max) / 2',
				description: '最佳值；缺失时使用范围中点。',
				name: 'optimum',
				type: 'number'
			},
			{
				default: 'Intl.NumberFormat(locale)',
				description: '生成fallback文本与aria-valuetext，接收规范化range和语义state。',
				name: 'formatValue',
				type: '(value: number, range: MeterRange, state: MeterState) => string'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/data-display/ZMeter.svelte',
		states: [
			{
				description: '相对最佳区间。',
				name: 'data-state',
				values: ['optimal', 'suboptimal', 'critical']
			}
		],
		status: 'stable',
		summary: '严格校验value与阈值、提供本地化value text并保留平台高对比与最佳区间呈现的原生Meter。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.height._progressLine;
			s.width.percent(100);
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
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
	import { meterState, normalizeMeterRange } from '../../runtime/progress.js';
	let {
		class: className,
		formatValue,
		high,
		label,
		low,
		max = 100,
		min = 0,
		optimum,
		ref = $bindable(null),
		style,
		value,
		...rest
	}: ZMeterProps = $props();
	const zui = useZui();
	const range = $derived(normalizeMeterRange({ high, low, max, min, optimum, value }));
	const state = $derived(meterState(range));
	const numberFormatter = $derived(new Intl.NumberFormat(zui.locale));
	const valueText = $derived(
		formatValue?.(range.value, range, state) ?? numberFormatter.format(range.value)
	);
	const rootClass = $derived(zui.recipe(recipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
</script>

<meter
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-label={label}
	aria-valuetext={valueText}
	min={range.min}
	max={range.max}
	low={range.low}
	high={range.high}
	optimum={range.optimum}
	value={range.value}
	data-state={state}>{valueText}</meter
>
