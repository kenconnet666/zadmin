<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type SkeletonDimension = number | string;
	export type SkeletonShape = 'circle' | 'line' | 'rectangle';
	export interface ZSkeletonProps extends HTMLAttributes<HTMLSpanElement> {
		readonly animated?: boolean;
		readonly height?: SkeletonDimension;
		readonly lines?: number;
		ref?: HTMLSpanElement | null;
		readonly shape?: SkeletonShape;
		readonly width?: SkeletonDimension;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'skeleton',
		importStatement: "import { ZSkeleton } from '@zadmin/zui';",
		name: 'ZSkeleton',
		bindings: [{ description: '真实装饰span引用。', name: 'ref', type: 'HTMLSpanElement | null' }],
		dependencies: ['Web Animations API', 'owner realm reduced motion', 'Theme duration token'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: "'line'",
				description: '占位形状。',
				name: 'shape',
				type: "'line' | 'rectangle' | 'circle'"
			},
			{
				default: "'100%'",
				description: '运行时占位宽度。',
				name: 'width',
				type: 'number | string'
			},
			{
				default: 'shape token',
				description: '运行时占位高度。',
				name: 'height',
				type: 'number | string'
			},
			{
				default: '1',
				description: 'line形状的等尺寸占位行数；不生成业务结构。',
				name: 'lines',
				type: 'number'
			},
			{
				default: 'true',
				description: '启用Theme token驱动的pulse；reduced motion始终覆盖为静态。',
				name: 'animated',
				type: 'boolean'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/data-display/ZSkeleton.svelte',
		states: [
			{ description: '当前减少动画。', name: 'data-reduced-motion', values: ['true'] },
			{ description: '关闭pulse动画。', name: 'data-static', values: ['true'] },
			{ description: 'line占位行数。', name: 'data-lines', values: ['1', 'n'] }
		],
		status: 'experimental',
		summary:
			'支持有限shape、等尺寸多行、严格尺寸、静态或Theme pulse并从可访问树隐藏的Skeleton占位原语。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._surface;
			s.borderColor._border;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxSizing.borderBox;
			s.display.block;
			s.height.raw('var(--zui-skeleton-height)');
			s.width.raw('var(--zui-skeleton-width)');
		},
		variants: {
			shape: {
				circle: (s) => s.borderRadius.percent(50),
				line: (s) => s.borderRadius._large,
				rectangle: (s) => s.borderRadius._medium
			}
		},
		defaultVariants: { shape: 'line' }
	});
	const groupRecipe = defineRecipe({
		base: (s) => {
			s.display.grid;
			s.gap._small;
			s.width.raw('var(--zui-skeleton-width)');
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, groupRecipe);
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables,
		type IcssVariableValue
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { durationMilliseconds } from '../../runtime/foundation/presence.svelte.js';
	let {
		animated = true,
		class: className,
		height,
		lines = 1,
		ref = $bindable(null),
		shape = 'line',
		style,
		width,
		...rest
	}: ZSkeletonProps = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const resolvedLines = $derived.by(() => {
		if (!Number.isInteger(lines) || lines < 1)
			throw new TypeError('Skeleton lines must be a positive integer.');
		if (shape !== 'line' && lines !== 1)
			throw new TypeError('Skeleton lines greater than one require shape="line".');
		return lines;
	});
	const dimension = (
		value: SkeletonDimension | undefined,
		fallback: IcssVariableValue
	): IcssVariableValue => {
		if (value === undefined) return fallback;
		if (typeof value === 'number') {
			if (!Number.isFinite(value) || value < 0)
				throw new TypeError('Skeleton dimensions must be non-negative and finite.');
			return `${value}px`;
		}
		const normalized = value.trim();
		if (normalized.length === 0 || /[;{}]/u.test(normalized)) {
			throw new TypeError('Skeleton string dimensions must be non-empty CSS values.');
		}
		return normalized;
	};
	const resolvedWidth = $derived(
		dimension(width, shape === 'circle' ? `${zui.theme.size.medium}px` : '100%')
	);
	const resolvedHeight = $derived(
		dimension(
			height,
			shape === 'circle'
				? resolvedWidth
				: shape === 'line'
					? `${zui.theme.size.skeletonLine}px`
					: `${zui.theme.size.medium}px`
		)
	);
	const reduced = $derived(reducedMotion.current);
	const rootClass = $derived(zui.recipe(recipe, { shape }));
	const groupClass = $derived(zui.recipe(groupRecipe));
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-skeleton-height': resolvedHeight,
		'--zui-skeleton-width': resolvedWidth
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	onMount(() => reducedMotion.connect(ref?.ownerDocument.defaultView));
	$effect(() => {
		if (!ref || !animated || reduced || typeof ref.animate !== 'function') return;
		const animation = ref.animate([{ opacity: 0.45 }, { opacity: 1 }, { opacity: 0.45 }], {
			duration: durationMilliseconds(zui.theme.duration.skeletonPulse),
			easing: 'ease-in-out',
			iterations: Infinity
		});
		return () => animation.cancel();
	});
</script>

{#if resolvedLines === 1}<span
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables }}
		aria-hidden="true"
		data-lines="1"
		data-reduced-motion={reduced || undefined}
		data-static={!animated || reduced || undefined}
	></span>{:else}<span
		{...rest}
		bind:this={ref}
		class={[groupClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables }}
		aria-hidden="true"
		data-lines={resolvedLines}
		data-reduced-motion={reduced || undefined}
		data-static={!animated || reduced || undefined}
	>
		{#each Array.from({ length: resolvedLines }, (_, index) => index) as index (index)}
			<span class={rootClass} data-slot="line"></span>
		{/each}
	</span>{/if}
