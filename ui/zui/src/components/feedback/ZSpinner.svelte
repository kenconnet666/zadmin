<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export type SpinnerSize = 'large' | 'medium' | 'small';
	export interface ZSpinnerProps extends HTMLAttributes<HTMLSpanElement> {
		readonly label?: string;
		ref?: HTMLSpanElement | null;
		readonly size?: SpinnerSize;
	}
	export const zuiMetadata = {
		category: 'feedback',
		id: 'spinner',
		importStatement: "import { ZSpinner } from '@zadmin/zui';",
		name: 'ZSpinner',
		bindings: [{ description: '真实status根引用。', name: 'ref', type: 'HTMLSpanElement | null' }],
		dependencies: ['Web Animations API', 'reduced motion'],
		events: [],
		keyboard: [],
		parts: [{ description: '旋转弧。', name: 'indicator' }],
		props: [
			{ default: "'Loading'", description: '可访问加载名称。', name: 'label', type: 'string' },
			{
				default: "'medium'",
				description: '视觉尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large'"
			}
		],
		since: '0.7.0',
		snippets: [],
		source: 'ui/zui/src/components/feedback/ZSpinner.svelte',
		states: [{ description: '当前减少动画。', name: 'data-reduced-motion', values: ['true'] }],
		status: 'experimental',
		summary: '使用Web Animations并在系统或Provider要求时停止动画的具名Spinner。'
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
			}
		},
		defaultVariants: { size: 'medium' }
	});
	registerRecipeHmr(import.meta, recipe);
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
	let {
		class: className,
		label = 'Loading',
		ref = $bindable(null),
		size = 'medium',
		style,
		...rest
	}: ZSpinnerProps = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let indicator = $state<SVGSVGElement | null>(null);
	const reduced = $derived(reducedMotion.current);
	const rootClass = $derived(zui.recipe(recipe, { size }));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	onMount(() => reducedMotion.connect());
	$effect(() => {
		if (!indicator || reduced) return;
		const animation = indicator.animate(
			[{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
			{ duration: 800, easing: 'linear', iterations: Infinity }
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
	role="status"
	aria-label={label}
	data-reduced-motion={reduced || undefined}
>
	<svg
		bind:this={indicator}
		aria-hidden="true"
		viewBox="0 0 24 24"
		width="100%"
		height="100%"
		data-slot="indicator"
	>
		<circle cx="12" cy="12" r="9" fill="none" stroke={zui.theme.color.border} stroke-width="3" />
		<path
			d="M 12 3 A 9 9 0 0 1 21 12"
			fill="none"
			stroke={zui.theme.color.primary}
			stroke-width="3"
			stroke-linecap="round"
		/>
	</svg>
</span>
