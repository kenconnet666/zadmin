<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type SpinnerSize = 'large' | 'medium' | 'small';
	export type SpinnerTone = 'inherit' | 'muted' | 'primary';
	export interface ZSpinnerProps extends HTMLAttributes<HTMLSpanElement> {
		readonly label?: string;
		ref?: HTMLSpanElement | null;
		readonly size?: SpinnerSize;
		readonly tone?: SpinnerTone;
	}
	export const zuiMetadata = {
		category: 'feedback',
		id: 'spinner',
		importStatement: "import { ZSpinner } from '@zadmin/zui';",
		name: 'ZSpinner',
		bindings: [{ description: '真实status根引用。', name: 'ref', type: 'HTMLSpanElement | null' }],
		dependencies: [
			'@lucide/svelte',
			'Web Animations API',
			'owner realm reduced motion',
			'Theme duration token'
		],
		events: [],
		keyboard: [],
		parts: [{ description: '旋转弧。', name: 'indicator' }],
		props: [
			{
				default: 'localePack.feedback.loading',
				description: '可访问加载名称；显式值优先于Provider locale。',
				name: 'label',
				type: 'string'
			},
			{
				default: "'medium'",
				description: '视觉尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			},
			{
				default: "'primary'",
				description: '有限视觉tone；inherit用于Button等组合边界，muted用于低强调加载。',
				name: 'tone',
				type: "'primary' | 'muted' | 'inherit'"
			}
		],
		since: '0.2.0',
		snippets: [],
		source: 'ui/zui/src/components/feedback/ZSpinner.svelte',
		states: [
			{ description: '当前减少动画。', name: 'data-reduced-motion', values: ['true'] },
			{ description: '视觉tone。', name: 'data-tone', values: ['primary', 'muted', 'inherit'] }
		],
		status: 'stable',
		summary:
			'使用Lucide LoaderCircle与owner Window Web Animations，在Provider或系统要求时停止动画的具名行内Spinner；不拥有overlay或业务任务。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.display.inlineFlex;
			s.flexShrink(0);
		},
		variants: {
			size: {
				large: (s) => {
					s.height._large;
					s.width._large;
				},
				medium: (s) => {
					s.height._medium;
					s.width._medium;
				},
				small: (s) => {
					s.height._small;
					s.width._small;
				}
			},
			tone: {
				inherit: () => undefined,
				muted: (s) => s.color._textMuted,
				primary: (s) => s.color._primary
			}
		},
		defaultVariants: { size: 'medium', tone: 'primary' }
	});
	registerRecipeHmr(import.meta, recipe);
</script>

<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { onMount, untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { durationMilliseconds } from '../../runtime/foundation/presence.svelte.js';
	let {
		'aria-hidden': ariaHidden,
		class: className,
		label,
		ref = $bindable(null),
		size = 'medium',
		style,
		tone = 'primary',
		...rest
	}: ZSpinnerProps = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let indicator = $state<SVGSVGElement | null>(null);
	const hidden = $derived(ariaHidden === true || ariaHidden === 'true');
	const resolvedSize = $derived.by(() => {
		if (!['large', 'medium', 'small'].includes(size)) {
			throw new TypeError('ZSpinner size must be small, medium or large.');
		}
		return size;
	});
	const resolvedTone = $derived.by(() => {
		if (!['inherit', 'muted', 'primary'].includes(tone)) {
			throw new TypeError('ZSpinner tone must be primary, muted or inherit.');
		}
		return tone;
	});
	const reduced = $derived(reducedMotion.current);
	const resolvedLabel = $derived.by(() => {
		const next = label ?? zui.localePack.feedback.loading;
		if (!hidden && next.trim().length === 0) {
			throw new TypeError('ZSpinner label must be non-empty unless aria-hidden.');
		}
		return next;
	});
	const rootClass = $derived(zui.recipe(recipe, { size: resolvedSize, tone: resolvedTone }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const attachIndicator: Attachment<SVGSVGElement> = (node) => {
		indicator = node;
		return () => {
			if (indicator === node) indicator = null;
		};
	};
	onMount(() => reducedMotion.connect(ref?.ownerDocument.defaultView));
	$effect(() => {
		if (!indicator || reduced || typeof indicator.animate !== 'function') return;
		const animation = indicator.animate(
			[{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
			{
				duration: durationMilliseconds(zui.theme.duration.spinnerSpin),
				easing: 'linear',
				iterations: Infinity
			}
		);
		return () => animation.cancel();
	});
</script>

<span
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-hidden={ariaHidden}
	role={hidden ? undefined : 'status'}
	aria-label={hidden ? undefined : resolvedLabel}
	data-reduced-motion={reduced || undefined}
	data-tone={resolvedTone}
>
	<LoaderCircle
		{@attach attachIndicator}
		aria-hidden="true"
		color="currentColor"
		data-slot="indicator"
		size="100%"
		strokeWidth={3}
	/>
</span>
