<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type SkeletonDimension = number | string;
	export type SkeletonShape = 'circle' | 'line' | 'rectangle';
	export interface ZSkeletonProps extends HTMLAttributes<HTMLSpanElement> {
		readonly height?: SkeletonDimension;
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
		dependencies: ['Web Animations API', 'reduced motion'],
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
			}
		],
		since: '0.7.0',
		snippets: [],
		source: 'ui/zui/src/components/data-display/ZSkeleton.svelte',
		states: [{ description: '当前减少动画。', name: 'data-reduced-motion', values: ['true'] }],
		status: 'experimental',
		summary: '尺寸稳定、从可访问树隐藏并清理pulse动画的Skeleton。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._surface;
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
	registerRecipeHmr(import.meta, recipe);
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
	let {
		class: className,
		height,
		ref = $bindable(null),
		shape = 'line',
		style,
		width,
		...rest
	}: ZSkeletonProps = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
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
	const variables = $derived({
		...readIcssCarrier(rest),
		'--zui-skeleton-height': resolvedHeight,
		'--zui-skeleton-width': resolvedWidth
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	onMount(() => reducedMotion.connect());
	$effect(() => {
		if (!ref || reduced) return;
		const animation = ref.animate([{ opacity: 0.45 }, { opacity: 1 }, { opacity: 0.45 }], {
			duration: 1400,
			easing: 'ease-in-out',
			iterations: Infinity
		});
		return () => animation.cancel();
	});
</script>

<span
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-hidden="true"
	data-reduced-motion={reduced || undefined}
></span>
