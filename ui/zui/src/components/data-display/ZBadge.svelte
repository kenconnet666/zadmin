<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	import { controlSizes, type ZControlSize } from '../../runtime/foundation/control-size.js';
	import { semanticTones, type ZSemanticTone } from '../../theme/semantics.js';

	export type BadgeTone = ZSemanticTone;
	export type BadgeSize = ZControlSize;
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
		bindings: [
			{ description: '真实Badge根span引用。', name: 'ref', type: 'HTMLSpanElement | null' }
		],
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
				default: "componentDefaults.badge.placement → 'top-end'",
				description: '相对children的逻辑角落，自动跟随RTL。',
				name: 'placement',
				type: 'BadgePlacement'
			},
			{
				default: "componentDefaults.badge.overlap → 'rectangular'",
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
				default: "componentDefaults.badge.size → 'medium'",
				description: '计数指示器尺寸。',
				name: 'size',
				type: 'BadgeSize'
			},
			{
				default: "componentDefaults.badge.tone → 'neutral'",
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
				description: '按anchor外形计算的重叠比例。',
				name: 'data-overlap',
				values: ['circular', 'rectangular']
			},
			{
				description: '逻辑角落。',
				name: 'data-placement',
				values: ['top-start', 'top-end', 'bottom-start', 'bottom-end']
			},
			{
				description: '解析后的指示器尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{
				description: '指示器语义tone。',
				name: 'data-tone',
				values: ['neutral', 'info', 'success', 'warning', 'danger']
			}
		],
		status: 'stable',
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
			s.transitionTimingFunction._standard;
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
				xsmall: (s) => {
					s.fontSize._xsmall;
					s.minHeight._badgeXsmall;
					s.minWidth._badgeXsmall;
					s.paddingInline._xsmall;
					s._selector('&[data-dot="true"]', (dot) => {
						dot.height._badgeDotXsmall;
						dot.width._badgeDotXsmall;
						dot.minHeight._badgeDotXsmall;
						dot.minWidth._badgeDotXsmall;
						dot.padding.px(0);
					});
				},
				small: (s) => {
					s.fontSize._xsmall;
					s.minHeight._badgeSmall;
					s.minWidth._badgeSmall;
					s.paddingInline._xsmall;
					s._selector('&[data-dot="true"]', (dot) => {
						dot.height._badgeDotSmall;
						dot.width._badgeDotSmall;
						dot.minHeight._badgeDotSmall;
						dot.minWidth._badgeDotSmall;
						dot.padding.px(0);
					});
				},
				medium: (s) => {
					s.fontSize._small;
					s.minHeight._badgeMedium;
					s.minWidth._badgeMedium;
					s.paddingInline._xsmall;
					s._selector('&[data-dot="true"]', (dot) => {
						dot.height._badgeDotMedium;
						dot.width._badgeDotMedium;
						dot.minHeight._badgeDotMedium;
						dot.minWidth._badgeDotMedium;
						dot.padding.px(0);
					});
				},
				large: (s) => {
					s.fontSize._small;
					s.minHeight._badgeLarge;
					s.minWidth._badgeLarge;
					s.paddingInline._xsmall;
					s._selector('&[data-dot="true"]', (dot) => {
						dot.height._badgeDotLarge;
						dot.width._badgeDotLarge;
						dot.minHeight._badgeDotLarge;
						dot.minWidth._badgeDotLarge;
						dot.padding.px(0);
					});
				},
				xlarge: (s) => {
					s.fontSize._medium;
					s.minHeight._badgeXlarge;
					s.minWidth._badgeXlarge;
					s.paddingInline._xsmall;
					s._selector('&[data-dot="true"]', (dot) => {
						dot.height._badgeDotXlarge;
						dot.width._badgeDotXlarge;
						dot.minHeight._badgeDotXlarge;
						dot.minWidth._badgeDotXlarge;
						dot.padding.px(0);
					});
				}
			},
			dot: { false: () => undefined, true: () => undefined },
			tone: {
				neutral: (s) => {
					s.backgroundColor._neutral;
					s.color._onNeutral;
				},
				info: (s) => {
					s.backgroundColor._info;
					s.color._onInfo;
				},
				success: (s) => {
					s.backgroundColor._success;
					s.color._onSuccess;
				},
				warning: (s) => {
					s.backgroundColor._warning;
					s.color._onWarning;
				},
				danger: (s) => {
					s.backgroundColor._danger;
					s.color._onDanger;
				}
			}
		},
		defaultVariants: {
			anchored: false,
			dot: false,
			motion: 'full',
			placement: 'top-end',
			size: 'medium',
			tone: 'neutral'
		}
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, indicatorRecipe);
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { durationMilliseconds } from '../../theme/units.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import ZVisuallyHidden from '../gene/ZVisuallyHidden.svelte';
	import { resolveComponentDefault } from '../../runtime/foundation/component-defaults.js';

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
		overlap,
		placement,
		ref = $bindable(null),
		showZero = false,
		size,
		style,
		tone,
		...rest
	}: ZBadgeProps = $props();
	const zui = useZui();
	const defaults = $derived(zui.componentDefaults.badge);
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const anchored = $derived(children !== undefined);
	const numberFormatter = $derived(new Intl.NumberFormat(zui.locale));
	const resolvedDot = $derived.by(() => {
		if (typeof dot !== 'boolean') throw new TypeError('ZBadge dot must be boolean.');
		return dot;
	});
	const resolvedInvisible = $derived.by(() => {
		if (typeof invisible !== 'boolean') throw new TypeError('ZBadge invisible must be boolean.');
		return invisible;
	});
	const resolvedShowZero = $derived.by(() => {
		if (typeof showZero !== 'boolean') throw new TypeError('ZBadge showZero must be boolean.');
		return showZero;
	});
	const resolvedOverlap = $derived.by(() => {
		const next = resolveComponentDefault(overlap, defaults?.overlap, 'rectangular');
		if (!['circular', 'rectangular'].includes(next)) {
			throw new TypeError('ZBadge overlap must be circular or rectangular.');
		}
		return next;
	});
	const resolvedPlacement = $derived.by(() => {
		const next = resolveComponentDefault(placement, defaults?.placement, 'top-end');
		if (!['bottom-end', 'bottom-start', 'top-end', 'top-start'].includes(next)) {
			throw new TypeError('ZBadge placement must be a supported logical corner.');
		}
		return next;
	});
	const resolvedSize = $derived.by(() => {
		const next = resolveComponentDefault(size, defaults?.size, 'medium');
		if (!controlSizes.includes(next)) {
			throw new TypeError('ZBadge size must be xsmall, small, medium, large or xlarge.');
		}
		return next;
	});
	const resolvedTone = $derived.by(() => {
		const next = resolveComponentDefault(tone, defaults?.tone, 'neutral');
		if (!semanticTones.includes(next)) {
			throw new TypeError('ZBadge tone must be neutral, info, success, warning or danger.');
		}
		return next;
	});
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
		if (
			!Array.isArray(offset) ||
			offset.length !== 2 ||
			!Number.isFinite(offset[0]) ||
			!Number.isFinite(offset[1])
		) {
			throw new TypeError('ZBadge offset must contain two finite numbers.');
		}
		return offset;
	});
	const resolvedLabel = $derived.by(() => {
		if (label !== undefined && (typeof label !== 'string' || label.trim().length === 0)) {
			throw new TypeError('ZBadge label must not be empty.');
		}
		return (
			label ?? (normalizedCount === undefined ? undefined : numberFormatter.format(normalizedCount))
		);
	});
	const indicatorVisible = $derived(
		!resolvedInvisible &&
			(resolvedDot || normalizedCount !== undefined) &&
			(normalizedCount === undefined || normalizedCount !== 0 || resolvedShowZero)
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
			dot: resolvedDot,
			motion: reducedMotion.current ? 'reduced' : 'full',
			placement: resolvedPlacement,
			size: resolvedSize,
			tone: resolvedTone
		})
	);
	const indicatorTransform = $derived.by(() => {
		if (!anchored) return 'none';
		const inlineEdge = resolvedPlacement.endsWith('start') ? -1 : 1;
		const inlineDirection = zui.direction === 'rtl' ? -1 : 1;
		const inlineSign = inlineEdge * inlineDirection;
		const blockSign = resolvedPlacement.startsWith('top') ? -1 : 1;
		const overlapPercent = resolvedOverlap === 'circular' ? 35 : 50;
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
				if (next.reduced) {
					currentKey = next.key;
					animation?.cancel();
					animation = undefined;
					return;
				}
				if (next.key === currentKey) return;
				currentKey = next.key;
				animation?.cancel();
				animation = undefined;
				if (typeof node.animate !== 'function') return;
				const positionedTransform = indicatorTransform === 'none' ? '' : `${indicatorTransform} `;
				animation = node.animate(
					[
						{ opacity: 0.55, transform: `${positionedTransform}scale(0.88)` },
						{ opacity: 1, transform: `${positionedTransform}scale(1)` }
					],
					{
						duration: durationMilliseconds(zui.theme.duration.fast),
						easing: zui.theme.easing.enter
					}
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
	data-dot={resolvedDot || undefined}
	data-invisible={!indicatorVisible || undefined}
	data-overlap={resolvedOverlap}
	data-placement={resolvedPlacement}
	data-size={resolvedSize}
	data-tone={resolvedTone}
	data-slot="root"
>
	{@render children?.()}
	{#if indicatorVisible}
		<span
			class={indicatorClass}
			style={indicatorStyle}
			aria-hidden={resolvedLabel === undefined ? 'true' : undefined}
			data-slot="indicator"
			data-dot={resolvedDot || undefined}
			use:animateIndicator={{
				key: resolvedDot
					? `dot:${resolvedLabel ?? ''}`
					: `count:${normalizedCount ?? 'none'}:${visualCount}`,
				reduced: reducedMotion.current
			}}
		>
			{#if resolvedLabel !== undefined}
				<ZVisuallyHidden data-slot="accessible-count">{resolvedLabel}</ZVisuallyHidden>
			{/if}
			{#if !resolvedDot}<span aria-hidden="true" data-slot="count">{visualCount}</span>{/if}
		</span>
	{/if}
</span>
