<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type BadgeTone = 'accent' | 'danger' | 'default' | 'success' | 'warning';
	export type BadgeSize = 'medium' | 'small';
	export type BadgeOverlap = 'circular' | 'rectangular';
	export type BadgePlacement = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';
	export type BadgeOffset = readonly [inline: number, block: number];

	export interface ZBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		readonly children?: Snippet;
		readonly count?: number | null;
		readonly dot?: boolean;
		readonly invisible?: boolean;
		readonly label?: string;
		readonly max?: number;
		readonly offset?: BadgeOffset;
		readonly overlap?: BadgeOverlap;
		readonly placement?: BadgePlacement;
		ref?: HTMLSpanElement | null;
		readonly showZero?: boolean;
		readonly size?: BadgeSize;
		readonly tone?: BadgeTone;
	}

	export const zuiMetadata = {
		category: 'data-display',
		id: 'badge',
		importStatement: "import { ZBadge } from '@zadmin/zui';",
		name: 'ZBadge',
		bindings: [{ description: '真实anchor根span。', name: 'ref', type: 'HTMLSpanElement | null' }],
		dependencies: [
			'Intl.NumberFormat',
			'ReducedMotionState',
			'ZVisuallyHidden',
			'logical CSS positioning'
		],
		events: [],
		keyboard: [],
		parts: [
			{ description: '相对定位或standalone根。', name: 'root' },
			{ description: '计数或圆点指示器。', name: 'indicator' },
			{ description: '视觉计数文本；完整数量由indicator可访问名称保留。', name: 'count' }
		],
		props: [
			{
				default: 'undefined',
				description: '非负整数计数；null/undefined不显示计数指示器。',
				name: 'count',
				type: 'number | null'
			},
			{
				default: '99',
				description: '视觉封顶值；可访问名称仍保留完整count。',
				name: 'max',
				type: 'number'
			},
			{
				default: 'false',
				description: 'count为0时仍显示。',
				name: 'showZero',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '以圆点替代视觉计数；无count时应提供label。',
				name: 'dot',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '隐藏指示器但保留anchor。',
				name: 'invisible',
				type: 'boolean'
			},
			{
				default: '格式化的完整count',
				description: '指示器可访问名称；dot且无count时建议显式提供。',
				name: 'label',
				type: 'string'
			},
			{
				default: "'top-end'",
				description: '相对children的逻辑角落，自动跟随RTL。',
				name: 'placement',
				type: 'BadgePlacement'
			},
			{
				default: "'rectangular'",
				description: '按anchor外形调整角落重叠比例。',
				name: 'overlap',
				type: 'BadgeOverlap'
			},
			{
				default: '[0, 0]',
				description: '沿逻辑inline/block方向向外偏移的像素值。',
				name: 'offset',
				type: 'BadgeOffset'
			},
			{
				default: "'medium'",
				description: '计数指示器尺寸。',
				name: 'size',
				type: 'BadgeSize'
			},
			{
				default: "'default'",
				description: '计数或圆点的语义tone。',
				name: 'tone',
				type: 'BadgeTone'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '可选anchor内容；缺省时Badge作为standalone计数。',
				name: 'children',
				type: 'Snippet'
			}
		],
		source: 'ui/zui/src/components/data-display/ZBadge.svelte',
		states: [
			{ description: '存在anchor children。', name: 'data-anchored', values: ['true'] },
			{ description: '圆点模式。', name: 'data-dot', values: ['true'] },
			{ description: '指示器未渲染。', name: 'data-invisible', values: ['true'] },
			{
				description: '逻辑角落。',
				name: 'data-placement',
				values: ['top-start', 'top-end', 'bottom-start', 'bottom-end']
			}
		],
		status: 'experimental',
		summary:
			'以非负计数、max/showZero、dot、逻辑角落、anchor overlap和完整可访问数量组成的通知Badge。'
	} as const satisfies ZuiComponentMetadata;

	const rootRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.inlineFlex;
			s.position.relative;
			s.verticalAlign.middle;
		},
		variants: {},
		defaultVariants: {}
	});
	const indicatorRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.borderColor._canvas;
			s.borderRadius.percent(50);
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxSizing.borderBox;
			s.display.inlineFlex;
			s.fontWeight._semibold;
			s.justifyContent.center;
			s.lineHeight(1);
			s.pointerEvents.none;
			s.transitionDuration._fast;
			s.transitionProperty.raw('opacity, transform');
			s.transitionTimingFunction.ease;
			s.whiteSpace.nowrap;
		},
		variants: {
			anchored: {
				false: () => undefined,
				true: (s) => s.position.absolute
			},
			motion: {
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			placement: {
				'bottom-end': (s) => {
					s.insetBlockEnd.px(0);
					s.insetInlineEnd.px(0);
				},
				'bottom-start': (s) => {
					s.insetBlockEnd.px(0);
					s.insetInlineStart.px(0);
				},
				'top-end': (s) => {
					s.insetBlockStart.px(0);
					s.insetInlineEnd.px(0);
				},
				'top-start': (s) => {
					s.insetBlockStart.px(0);
					s.insetInlineStart.px(0);
				}
			},
			size: {
				medium: (s) => {
					s.fontSize._small;
					s.minHeight._medium;
					s.minWidth._medium;
					s.paddingInline._small;
				},
				small: (s) => {
					s.fontSize._small;
					s.minHeight._small;
					s.minWidth._small;
					s.paddingInline._xsmall;
				}
			},
			dot: {
				false: () => undefined,
				true: (s) => {
					s.height._small;
					s.minHeight._small;
					s.minWidth._small;
					s.padding.px(0);
					s.width._small;
				}
			},
			tone: {
				accent: (s) => {
					s.backgroundColor._accent;
					s.color._canvas;
				},
				danger: (s) => {
					s.backgroundColor._danger;
					s.color._canvas;
				},
				default: (s) => {
					s.backgroundColor._surface;
					s.color._text;
				},
				success: (s) => {
					s.backgroundColor._success;
					s.color._canvas;
				},
				warning: (s) => {
					s.backgroundColor._warning;
					s.color._canvas;
				}
			}
		},
		defaultVariants: {
			anchored: false,
			dot: false,
			motion: 'full',
			placement: 'top-end',
			size: 'medium',
			tone: 'default'
		}
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, indicatorRecipe);
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import ZVisuallyHidden from '../gene/ZVisuallyHidden.svelte';

	interface IndicatorAnimationOptions {
		readonly key: string;
		readonly reduced: boolean;
	}

	let {
		children,
		class: className,
		count,
		dot = false,
		invisible = false,
		label,
		max = 99,
		offset = [0, 0],
		overlap = 'rectangular',
		placement = 'top-end',
		ref = $bindable(null),
		showZero = false,
		size = 'medium',
		style,
		tone = 'default',
		...rest
	}: ZBadgeProps = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const anchored = $derived(children !== undefined);
	const numberFormatter = $derived(new Intl.NumberFormat(zui.locale));
	const normalizedCount = $derived.by(() => {
		if (count === undefined || count === null) return undefined;
		if (!Number.isSafeInteger(count) || count < 0) {
			throw new TypeError('ZBadge count must be a non-negative safe integer.');
		}
		return count;
	});
	const normalizedMax = $derived.by(() => {
		if (!Number.isSafeInteger(max) || max < 1) {
			throw new TypeError('ZBadge max must be a positive safe integer.');
		}
		return max;
	});
	const normalizedOffset = $derived.by(() => {
		if (offset.length !== 2 || offset.some((value) => !Number.isFinite(value))) {
			throw new TypeError('ZBadge offset must contain two finite numbers.');
		}
		return offset;
	});
	const resolvedLabel = $derived.by(() => {
		if (label !== undefined && label.trim().length === 0) {
			throw new TypeError('ZBadge label must not be empty.');
		}
		return (
			label ?? (normalizedCount === undefined ? undefined : numberFormatter.format(normalizedCount))
		);
	});
	const indicatorVisible = $derived(
		!invisible &&
			(dot || normalizedCount !== undefined) &&
			(normalizedCount === undefined || normalizedCount !== 0 || showZero)
	);
	const visualCount = $derived(
		normalizedCount === undefined
			? ''
			: normalizedCount > normalizedMax
				? `${numberFormatter.format(normalizedMax)}+`
				: numberFormatter.format(normalizedCount)
	);
	const rootClass = $derived(zui.recipe(rootRecipe));
	const indicatorClass = $derived(
		zui.recipe(indicatorRecipe, {
			anchored,
			dot,
			motion: reducedMotion.current ? 'reduced' : 'full',
			placement,
			size,
			tone
		})
	);
	const indicatorTransform = $derived.by(() => {
		if (!anchored) return 'none';
		const inlineEdge = placement.endsWith('start') ? -1 : 1;
		const inlineDirection = zui.direction === 'rtl' ? -1 : 1;
		const inlineSign = inlineEdge * inlineDirection;
		const blockSign = placement.startsWith('top') ? -1 : 1;
		const overlapPercent = overlap === 'circular' ? 35 : 50;
		return `translate(calc(${inlineSign * overlapPercent}% + ${inlineSign * normalizedOffset[0]}px), calc(${blockSign * overlapPercent}% + ${blockSign * normalizedOffset[1]}px))`;
	});
	untrack(() => {
		void normalizedCount;
		void normalizedMax;
		void normalizedOffset;
		void resolvedLabel;
	});
	const indicatorStyle = $derived(anchored ? `transform: ${indicatorTransform};` : undefined);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function animateIndicator(
		node: HTMLElement,
		initial: IndicatorAnimationOptions
	): { destroy(): void; update(next: IndicatorAnimationOptions): void } {
		let currentKey = initial.key;
		let animation: Animation | undefined;
		return {
			destroy: () => animation?.cancel(),
			update(next) {
				if (next.key === currentKey) return;
				currentKey = next.key;
				animation?.cancel();
				if (next.reduced || typeof node.animate !== 'function') return;
				const positionedTransform = indicatorTransform === 'none' ? '' : `${indicatorTransform} `;
				animation = node.animate(
					[
						{ opacity: 0.55, transform: `${positionedTransform}scale(0.88)` },
						{ opacity: 1, transform: `${positionedTransform}scale(1)` }
					],
					{ duration: zui.theme.duration.fast, easing: 'ease-out' }
				);
			}
		};
	}

	onMount(() => reducedMotion.connect(ref?.ownerDocument.defaultView));
</script>

<span
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	data-anchored={anchored || undefined}
	data-dot={dot || undefined}
	data-invisible={!indicatorVisible || undefined}
	data-overlap={overlap}
	data-placement={placement}
	data-size={size}
	data-slot="root"
>
	{@render children?.()}
	{#if indicatorVisible}
		<span
			class={indicatorClass}
			style={indicatorStyle}
			aria-hidden={resolvedLabel === undefined ? 'true' : undefined}
			data-slot="indicator"
			use:animateIndicator={{
				key: dot
					? `dot:${resolvedLabel ?? ''}`
					: `count:${normalizedCount ?? 'none'}:${visualCount}`,
				reduced: reducedMotion.current
			}}
		>
			{#if resolvedLabel !== undefined}
				<ZVisuallyHidden data-slot="accessible-count">{resolvedLabel}</ZVisuallyHidden>
			{/if}
			{#if !dot}<span aria-hidden="true" data-slot="count">{visualCount}</span>{/if}
		</span>
	{/if}
</span>
