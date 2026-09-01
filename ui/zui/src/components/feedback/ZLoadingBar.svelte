<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZLoadingBarProps extends HTMLAttributes<HTMLDivElement> {
		readonly label?: string;
		readonly page?: boolean;
		ref?: HTMLDivElement | null;
		readonly value?: number;
	}
	export const zuiMetadata = {
		category: 'feedback',
		id: 'loading-bar',
		importStatement: "import { ZLoadingBar } from '@zadmin/zui';",
		name: 'ZLoadingBar',
		bindings: [
			{ description: '真实progressbar根引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['Web Animations API', 'owner realm reduced motion', 'Theme duration token'],
		events: [],
		keyboard: [],
		parts: [{ description: '进度条。', name: 'indicator' }],
		props: [
			{
				default: 'undefined',
				description: '0–100确定进度；缺失为不确定。',
				name: 'value',
				type: 'number'
			},
			{ default: 'false', description: '固定到视口顶部。', name: 'page', type: 'boolean' },
			{
				default: 'localePack.feedback.loading',
				description: '可访问名称；显式值优先于Provider locale。',
				name: 'label',
				type: 'string'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/feedback/ZLoadingBar.svelte',
		states: [
			{ description: '没有确定值。', name: 'data-indeterminate', values: ['true'] },
			{ description: '当前减少动画。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'experimental',
		summary: '支持确定值、页面固定模式与reduced-motion的不确定Loading Bar。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._surface;
			s.borderRadius._large;
			s.height._loadingBar;
			s.overflow.hidden;
			s.position.relative;
			s.width.percent(100);
		},
		variants: {
			page: {
				false: () => undefined,
				true: (s) => {
					s.borderRadius._none;
					s.insetBlockStart.px(0);
					s.insetInlineEnd.px(0);
					s.insetInlineStart.px(0);
					s.position.fixed;
					s.zIndex(100);
				}
			}
		},
		defaultVariants: { page: false }
	});
	const indicatorRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._primary;
			s.height.percent(100);
			s.insetBlockStart.px(0);
			s.insetInlineStart.px(0);
			s.position.absolute;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
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
	let {
		class: className,
		label,
		page = false,
		ref = $bindable(null),
		style,
		value,
		...rest
	}: ZLoadingBarProps = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let indicator = $state<HTMLDivElement | null>(null);
	const normalized = $derived.by(() => {
		if (value === undefined) return undefined;
		if (!Number.isFinite(value)) throw new TypeError('ZLoadingBar value must be finite.');
		return Math.min(100, Math.max(0, value));
	});
	const reduced = $derived(reducedMotion.current);
	const resolvedLabel = $derived(label ?? zui.localePack.feedback.loading);
	const rootClass = $derived(zui.recipe(recipe, { page }));
	const indicatorClass = $derived(zui.recipe(indicatorRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	onMount(() => reducedMotion.connect(ref?.ownerDocument.defaultView));
	$effect(() => {
		if (
			!indicator ||
			normalized !== undefined ||
			reduced ||
			typeof indicator.animate !== 'function'
		)
			return;
		const from = zui.direction === 'rtl' ? 'translateX(100%)' : 'translateX(-100%)';
		const to = zui.direction === 'rtl' ? 'translateX(-400%)' : 'translateX(400%)';
		const animation = indicator.animate([{ transform: from }, { transform: to }], {
			duration: durationMilliseconds(zui.theme.duration.loadingBarIndeterminate),
			easing: 'ease-in-out',
			iterations: Infinity
		});
		return () => animation.cancel();
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	role="progressbar"
	aria-label={resolvedLabel}
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow={normalized}
	aria-valuetext={normalized === undefined ? resolvedLabel : undefined}
	data-indeterminate={normalized === undefined || undefined}
	data-reduced-motion={reduced || undefined}
>
	<div
		bind:this={indicator}
		class={indicatorClass}
		data-slot="indicator"
		style={`width: ${normalized ?? 25}%`}
	></div>
</div>
