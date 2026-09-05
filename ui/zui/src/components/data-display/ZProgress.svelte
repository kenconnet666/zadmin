<script module lang="ts">
	import type { HTMLAttributes, HTMLProgressAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type ProgressTone = 'danger' | 'primary' | 'success' | 'warning';
	export type ProgressView = 'circle' | 'line';
	export interface ZProgressProps extends Omit<
		HTMLAttributes<HTMLDivElement> & HTMLProgressAttributes,
		'max' | 'value'
	> {
		readonly formatValue?: (
			value: number,
			range: { readonly max: number; readonly min: number }
		) => string;
		readonly label?: string;
		readonly indeterminateText?: string;
		readonly max?: number;
		readonly min?: number;
		ref?: HTMLDivElement | HTMLProgressElement | null;
		readonly value?: number;
		readonly tone?: ProgressTone;
		readonly view?: ProgressView;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'progress',
		importStatement: "import { ZProgress } from '@zadmin/zui';",
		name: 'ZProgress',
		bindings: [
			{
				description: '真实progress或circle根引用。',
				name: 'ref',
				type: 'HTMLProgressElement | HTMLDivElement | null'
			}
		],
		dependencies: [
			'native progress',
			'SVG circle',
			'owner realm reduced motion',
			'Web Animations API',
			'native forced-colors line + currentColor SVG'
		],
		events: [],
		keyboard: [],
		parts: [
			{ description: 'circle轨道。', name: 'track' },
			{ description: 'circle进度弧。', name: 'indicator' }
		],
		props: [
			{
				default: 'undefined',
				description: '确定值；缺失为不确定。',
				name: 'value',
				type: 'number'
			},
			{ default: '0', description: '最小值。', name: 'min', type: 'number' },
			{ default: '100', description: '最大值。', name: 'max', type: 'number' },
			{
				default: "'line'",
				description: '原生line或SVG circle。',
				name: 'view',
				type: "'line' | 'circle'"
			},
			{
				default: 'localePack.progress.label',
				description: '可访问名称；显式业务名称优先于Provider locale。',
				name: 'label',
				type: 'string'
			},
			{
				default: 'localePack.feedback.loading',
				description: '不确定状态的aria-valuetext；不会伪造百分比。',
				name: 'indeterminateText',
				type: 'string'
			},
			{
				default: "'primary'",
				description: '有限语义颜色，不改变进度数值。',
				name: 'tone',
				type: "'primary' | 'success' | 'warning' | 'danger'"
			},
			{
				default: 'undefined',
				description: '确定值的可访问文本；缺失时使用本地化百分比。',
				name: 'formatValue',
				type: '(value: number, range: { readonly max: number; readonly min: number }) => string'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/data-display/ZProgress.svelte',
		states: [
			{ description: '没有确定值。', name: 'data-indeterminate', values: ['true'] },
			{ description: '当前减少动画。', name: 'data-reduced-motion', values: ['true'] },
			{
				description: '语义颜色。',
				name: 'data-tone',
				values: ['primary', 'success', 'warning', 'danger']
			}
		],
		status: 'stable',
		summary:
			'以原生progress承载line、currentColor数值SVG承载circle，并共享范围、格式化、tone和reduced-motion合同的Progress。'
	} as const satisfies ZuiComponentMetadata;
	const lineRecipe = defineRecipe({
		base: (s) => {
			s.accentColor._primary;
			s.height._progressLine;
			s.width.percent(100);
		},
		variants: {
			tone: {
				danger: (s) => s.accentColor._danger,
				primary: (s) => s.accentColor._primary,
				success: (s) => s.accentColor._success,
				warning: (s) => s.accentColor._warning
			}
		},
		defaultVariants: { tone: 'primary' }
	});
	const circleRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.inlineFlex;
			s.height._progressCircle;
			s.justifyContent.center;
			s.position.relative;
			s.width._progressCircle;
		},
		variants: {
			tone: {
				danger: (s) => s.color._danger,
				primary: (s) => s.color._primary,
				success: (s) => s.color._success,
				warning: (s) => s.color._warning
			}
		},
		defaultVariants: { tone: 'primary' }
	});
	const labelRecipe = defineRecipe({
		base: (s) => {
			s.fontSize._small;
			s.fontWeight._semibold;
			s.position.absolute;
		},
		variants: {},
		defaultVariants: {}
	});
	const indicatorRecipe = defineRecipe({
		base: (s) => {
			s.transitionDuration._normal;
			s.transitionProperty.raw('stroke-dashoffset');
			s.transitionTimingFunction._standard;
		},
		variants: {
			reduced: {
				false: () => undefined,
				true: (s) => s.transitionDuration.ms(0)
			}
		},
		defaultVariants: { reduced: false }
	});
	registerRecipeHmr(import.meta, lineRecipe);
	registerRecipeHmr(import.meta, circleRecipe);
	registerRecipeHmr(import.meta, labelRecipe);
	registerRecipeHmr(import.meta, indicatorRecipe);
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { durationMilliseconds } from '../../runtime/foundation/presence.svelte.js';
	import { normalizeProgressRange } from '../../runtime/progress.js';
	let {
		class: className,
		formatValue,
		indeterminateText,
		label,
		max = 100,
		min = 0,
		ref = $bindable(null),
		style,
		tone = 'primary',
		value,
		view = 'line',
		...rest
	}: ZProgressProps = $props();
	const zui = useZui();
	const resolvedLabel = $derived(label ?? zui.localePack.progress.label);
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let indicator = $state<SVGSVGElement | null>(null);
	const range = $derived(normalizeProgressRange({ max, min, value }));
	const percentFormatter = $derived(
		new Intl.NumberFormat(zui.locale, { maximumFractionDigits: 0, style: 'percent' })
	);
	const ratio = $derived(
		range.value === undefined ? undefined : (range.value - range.min) / (range.max - range.min)
	);
	const nativeMax = $derived(range.max - range.min);
	const nativeValue = $derived(range.value === undefined ? undefined : range.value - range.min);
	const valueText = $derived(
		range.value === undefined
			? (indeterminateText ?? zui.localePack.feedback.loading)
			: (formatValue?.(range.value, range) ?? percentFormatter.format(ratio ?? 0))
	);
	const reduced = $derived(reducedMotion.current);
	const lineClass = $derived(zui.recipe(lineRecipe, { tone }));
	const circleClass = $derived(zui.recipe(circleRecipe, { tone }));
	const valueClass = $derived(zui.recipe(labelRecipe));
	const indicatorClass = $derived(zui.recipe(indicatorRecipe, { reduced }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	onMount(() => reducedMotion.connect(ref?.ownerDocument.defaultView));
	$effect(() => {
		if (!indicator || ratio !== undefined || reduced || typeof indicator.animate !== 'function')
			return;
		const animation = indicator.animate(
			[{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
			{
				duration: durationMilliseconds(zui.theme.duration.progressIndeterminate),
				easing: 'linear',
				iterations: Infinity
			}
		);
		return () => animation.cancel();
	});
</script>

{#if view === 'line'}<progress
		{...rest}
		bind:this={ref}
		class={[lineClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables }}
		aria-label={resolvedLabel}
		aria-valuemin={range.min}
		aria-valuemax={range.max}
		aria-valuenow={range.value}
		aria-valuetext={valueText}
		max={nativeMax}
		value={nativeValue}
		data-indeterminate={range.value === undefined || undefined}
		data-reduced-motion={reduced || undefined}
		data-tone={tone}>{valueText}</progress
	>{:else}<div
		{...rest}
		bind:this={ref}
		class={[circleClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables }}
		role="progressbar"
		aria-label={resolvedLabel}
		aria-valuemin={range.min}
		aria-valuemax={range.max}
		aria-valuenow={range.value}
		aria-valuetext={valueText}
		data-indeterminate={range.value === undefined || undefined}
		data-reduced-motion={reduced || undefined}
		data-tone={tone}
	>
		<svg
			bind:this={indicator}
			aria-hidden="true"
			viewBox="0 0 120 120"
			width="100%"
			height="100%"
			data-slot="indicator"
		>
			<circle
				cx="60"
				cy="60"
				r="50"
				pathLength="100"
				fill="none"
				stroke="currentColor"
				stroke-opacity="0.25"
				stroke-width={zui.theme.borderWidth.progress}
				data-slot="track"
			/>
			<circle
				class={indicatorClass}
				cx="60"
				cy="60"
				r="50"
				pathLength="100"
				fill="none"
				stroke="currentColor"
				stroke-width={zui.theme.borderWidth.progress}
				stroke-linecap="round"
				stroke-dasharray={ratio === undefined ? '25 75' : '100'}
				stroke-dashoffset={ratio === undefined ? 0 : 100 - ratio * 100}
				transform="rotate(-90 60 60)"
			/>
		</svg>
		<span class={valueClass}>{ratio === undefined ? '' : valueText}</span>
	</div>{/if}
