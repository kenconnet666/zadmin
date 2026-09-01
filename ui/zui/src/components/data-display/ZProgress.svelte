<script module lang="ts">
	import type { HTMLAttributes, HTMLProgressAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
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
		readonly max?: number;
		readonly min?: number;
		ref?: HTMLDivElement | HTMLProgressElement | null;
		readonly value?: number;
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
			'Web Animations API'
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
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/data-display/ZProgress.svelte',
		states: [
			{ description: '没有确定值。', name: 'data-indeterminate', values: ['true'] },
			{ description: '当前减少动画。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'experimental',
		summary: '以原生progress承载line并用同一范围合同提供circle视图的Progress。'
	} as const satisfies ZuiComponentMetadata;
	const lineRecipe = defineRecipe({
		base: (s) => {
			s.accentColor._primary;
			s.height._progressLine;
			s.width.percent(100);
		},
		variants: {},
		defaultVariants: {}
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
		variants: {},
		defaultVariants: {}
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
	registerRecipeHmr(import.meta, lineRecipe);
	registerRecipeHmr(import.meta, circleRecipe);
	registerRecipeHmr(import.meta, labelRecipe);
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
		formatValue = (current, range) =>
			`${Math.round(((current - range.min) / (range.max - range.min)) * 100)}%`,
		label,
		max = 100,
		min = 0,
		ref = $bindable(null),
		style,
		value,
		view = 'line',
		...rest
	}: ZProgressProps = $props();
	const zui = useZui();
	const resolvedLabel = $derived(label ?? zui.localePack.progress.label);
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let indicator = $state<SVGSVGElement | null>(null);
	const range = $derived(normalizeProgressRange({ max, min, value }));
	const ratio = $derived(
		range.value === undefined ? undefined : (range.value - range.min) / (range.max - range.min)
	);
	const nativeMax = $derived(range.max - range.min);
	const nativeValue = $derived(range.value === undefined ? undefined : range.value - range.min);
	const valueText = $derived(
		range.value === undefined ? resolvedLabel : formatValue(range.value, range)
	);
	const reduced = $derived(reducedMotion.current);
	const lineClass = $derived(zui.recipe(lineRecipe));
	const circleClass = $derived(zui.recipe(circleRecipe));
	const valueClass = $derived(zui.recipe(labelRecipe));
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
		data-reduced-motion={reduced || undefined}>{valueText}</progress
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
				stroke={zui.theme.color.border}
				stroke-width={zui.theme.borderWidth.progress}
				data-slot="track"
			/>
			<circle
				cx="60"
				cy="60"
				r="50"
				pathLength="100"
				fill="none"
				stroke={zui.theme.color.primary}
				stroke-width={zui.theme.borderWidth.progress}
				stroke-linecap="round"
				stroke-dasharray={ratio === undefined ? '25 75' : '100'}
				stroke-dashoffset={ratio === undefined ? 0 : 100 - ratio * 100}
				transform="rotate(-90 60 60)"
			/>
		</svg>
		<span class={valueClass}>{ratio === undefined ? '' : valueText}</span>
	</div>{/if}
