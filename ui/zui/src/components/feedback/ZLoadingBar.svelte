<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type LoadingBarMode = 'local' | 'page';
	export type LoadingBarState = 'error' | 'idle' | 'loading' | 'success';

	export interface LoadingBarCompletionOptions {
		readonly hideAfter?: number | null;
	}

	export interface LoadingBarController {
		readonly active: boolean;
		readonly state: LoadingBarState;
		readonly value: number | undefined;
		error(options?: LoadingBarCompletionOptions): void;
		finish(options?: LoadingBarCompletionOptions): void;
		reset(): void;
		start(value?: number): void;
		update(value: number): void;
	}

	export interface ZLoadingBarProps extends HTMLAttributes<HTMLDivElement> {
		active?: boolean;
		controller?: LoadingBarController | null;
		readonly errorDelay?: number | null;
		readonly finishDelay?: number | null;
		readonly label?: string;
		readonly mode?: LoadingBarMode;
		ref?: HTMLDivElement | null;
		state?: LoadingBarState;
		value?: number;
	}

	export const zuiMetadata = {
		category: 'feedback',
		id: 'loading-bar',
		importStatement: "import { ZLoadingBar } from '@zadmin/zui';",
		name: 'ZLoadingBar',
		bindings: [
			{ description: '是否参与可访问树与视觉布局。', name: 'active', type: 'boolean' },
			{
				description: '组件拥有的命令式生命周期面；不持有网络请求。',
				name: 'controller',
				type: 'LoadingBarController | null'
			},
			{ description: '真实progressbar根引用。', name: 'ref', type: 'HTMLDivElement | null' },
			{
				description: '加载、成功、错误或空闲阶段。',
				name: 'state',
				type: 'LoadingBarState'
			},
			{ description: '0–100确定值；undefined为不确定。', name: 'value', type: 'number | undefined' }
		],
		dependencies: [
			'Web Animations API',
			'owner Window timers',
			'owner Document visibility',
			'owner realm reduced motion',
			'Theme duration token'
		],
		events: [],
		keyboard: [],
		parts: [
			{ description: '本地或页面级progressbar轨道。', name: 'root' },
			{ description: '确定值或不确定动画指示条。', name: 'indicator' }
		],
		props: [
			{
				bindable: true,
				default: 'true',
				description: 'false时使用原生hidden退出视觉与可访问树；controller reset/延迟收尾会写回。',
				name: 'active',
				type: 'boolean'
			},
			{
				bindable: true,
				default: "'loading'",
				description: '视觉与控制器阶段；idle始终不展示。',
				name: 'state',
				type: "'idle' | 'loading' | 'success' | 'error'"
			},
			{
				bindable: true,
				default: 'undefined',
				description: '0–100确定进度；缺失为不确定，有限越界值会clamp。',
				name: 'value',
				type: 'number'
			},
			{
				default: "'local'",
				description: 'local参加普通布局；page固定到逻辑视口顶部。',
				name: 'mode',
				type: "'local' | 'page'"
			},
			{
				default: '200',
				description: 'controller.finish后由owner Window隐藏的毫秒数；null保持。',
				name: 'finishDelay',
				type: 'number | null'
			},
			{
				default: 'null',
				description: 'controller.error后的隐藏延迟；默认持久显示错误，等待显式reset/start。',
				name: 'errorDelay',
				type: 'number | null'
			},
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
			{ description: '当前展示。', name: 'data-active', values: ['true', 'false'] },
			{ description: '没有确定值。', name: 'data-indeterminate', values: ['true'] },
			{ description: '本地或页面级布局。', name: 'data-mode', values: ['local', 'page'] },
			{ description: '当前减少动画。', name: 'data-reduced-motion', values: ['true'] },
			{
				description: '生命周期阶段。',
				name: 'data-state',
				values: ['idle', 'loading', 'success', 'error']
			},
			{
				description: 'owner Document当前可见。',
				name: 'data-document-visible',
				values: ['true', 'false']
			}
		],
		status: 'stable',
		summary:
			'在local/page两种布局中表达确定或不确定任务进度，并通过组件作用域controller协调start/update/finish/error、owner realm计时、可见性与清理；不拥有请求或复制ZProgress。'
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
			mode: {
				local: () => undefined,
				page: (s) => {
					s.borderRadius._none;
					s.insetBlockStart.px(0);
					s.insetInlineEnd.px(0);
					s.insetInlineStart.px(0);
					s.position.fixed;
					s.zIndex._pageLoading;
				}
			}
		},
		defaultVariants: { mode: 'local' }
	});
	const indicatorRecipe = defineRecipe({
		base: (s) => {
			s.height.percent(100);
			s.insetBlockStart.px(0);
			s.insetInlineStart.px(0);
			s.position.absolute;
		},
		variants: {
			state: {
				error: (s) => s.backgroundColor._danger,
				idle: (s) => s.backgroundColor._primary,
				loading: (s) => s.backgroundColor._primary,
				success: (s) => s.backgroundColor._success
			}
		},
		defaultVariants: { state: 'loading' }
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
		'aria-valuetext': ariaValueText,
		active = $bindable(true),
		class: className,
		controller = $bindable(null),
		errorDelay = null,
		finishDelay = 200,
		label,
		mode,
		ref = $bindable(null),
		state: loadingState = $bindable('loading'),
		style,
		value = $bindable(),
		...rest
	}: ZLoadingBarProps = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let indicator = $state<HTMLDivElement | null>(null);
	let documentVisible = $state(true);
	let ownerWindow: Window | undefined;
	let timerOwner: Window | undefined;
	let hideTimer: number | undefined;

	function finiteDelay(next: number | null, name: string): number | null {
		if (next === null) return null;
		if (!Number.isFinite(next) || next < 0) {
			throw new TypeError(`ZLoadingBar ${name} must be null or a non-negative finite number.`);
		}
		return next;
	}

	function normalizeValue(next: number | undefined): number | undefined {
		if (next === undefined) return undefined;
		if (!Number.isFinite(next)) throw new TypeError('ZLoadingBar value must be finite.');
		return Math.min(100, Math.max(0, next));
	}

	function clearHideTimer(): void {
		if (hideTimer !== undefined && timerOwner) timerOwner.clearTimeout(hideTimer);
		hideTimer = undefined;
		timerOwner = undefined;
	}

	function scheduleHide(delay: number | null): void {
		clearHideTimer();
		if (delay === null) return;
		const view = ref?.ownerDocument.defaultView ?? ownerWindow;
		if (!view) return;
		timerOwner = view;
		hideTimer = view.setTimeout(() => {
			hideTimer = undefined;
			timerOwner = undefined;
			active = false;
		}, delay);
	}

	function assertState(next: LoadingBarState): LoadingBarState {
		if (!['error', 'idle', 'loading', 'success'].includes(next)) {
			throw new TypeError('ZLoadingBar state must be idle, loading, success or error.');
		}
		return next;
	}

	const normalized = $derived(normalizeValue(value));
	const resolvedFinishDelay = $derived(finiteDelay(finishDelay, 'finishDelay'));
	const resolvedErrorDelay = $derived(finiteDelay(errorDelay, 'errorDelay'));
	const resolvedState = $derived.by(() => {
		void resolvedFinishDelay;
		void resolvedErrorDelay;
		return assertState(loadingState);
	});
	const effectiveValue = $derived(
		resolvedState === 'success' && normalized === undefined ? 100 : normalized
	);
	const resolvedMode = $derived.by(() => {
		const next = mode ?? 'local';
		if (!['local', 'page'].includes(next)) {
			throw new TypeError('ZLoadingBar mode must be local or page.');
		}
		return next;
	});
	const reduced = $derived(reducedMotion.current);
	const resolvedActive = $derived.by(() => {
		if (typeof active !== 'boolean') throw new TypeError('ZLoadingBar active must be boolean.');
		return active;
	});
	const visible = $derived(resolvedActive && resolvedState !== 'idle');
	const resolvedLabel = $derived.by(() => {
		const next = label ?? zui.localePack.feedback.loading;
		if (next.trim().length === 0) throw new TypeError('ZLoadingBar label must be non-empty.');
		return next;
	});
	const rootClass = $derived(zui.recipe(recipe, { mode: resolvedMode }));
	const indicatorClass = $derived(zui.recipe(indicatorRecipe, { state: resolvedState }));
	const indicatorWidth = $derived(
		effectiveValue ?? (resolvedState === 'loading' && !reduced ? 25 : 100)
	);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	const publicController: LoadingBarController = {
		get active() {
			return visible;
		},
		get state() {
			return resolvedState;
		},
		get value() {
			return effectiveValue;
		},
		error(options) {
			clearHideTimer();
			active = true;
			loadingState = 'error';
			scheduleHide(
				finiteDelay(
					options?.hideAfter === undefined ? resolvedErrorDelay : options.hideAfter,
					'hideAfter'
				)
			);
		},
		finish(options) {
			clearHideTimer();
			active = true;
			loadingState = 'success';
			value = 100;
			scheduleHide(
				finiteDelay(
					options?.hideAfter === undefined ? resolvedFinishDelay : options.hideAfter,
					'hideAfter'
				)
			);
		},
		reset() {
			clearHideTimer();
			active = false;
			loadingState = 'idle';
			value = undefined;
		},
		start(nextValue) {
			clearHideTimer();
			active = true;
			loadingState = 'loading';
			value = normalizeValue(nextValue);
		},
		update(nextValue) {
			clearHideTimer();
			active = true;
			loadingState = 'loading';
			value = normalizeValue(nextValue);
		}
	};

	$effect(() => {
		controller = publicController;
		const publishedController = untrack(() => controller);
		return () => {
			if (untrack(() => controller) === publishedController) controller = null;
		};
	});

	onMount(() => {
		const ownerDocument = ref?.ownerDocument;
		ownerWindow = ownerDocument?.defaultView ?? undefined;
		const disconnectMotion = reducedMotion.connect(ownerWindow);
		const syncVisibility = () => {
			documentVisible = ownerDocument?.visibilityState !== 'hidden';
		};
		syncVisibility();
		ownerDocument?.addEventListener('visibilitychange', syncVisibility);
		return () => {
			clearHideTimer();
			disconnectMotion();
			ownerDocument?.removeEventListener('visibilitychange', syncVisibility);
			ownerWindow = undefined;
		};
	});

	$effect(() => {
		if (
			!indicator ||
			!visible ||
			resolvedState !== 'loading' ||
			normalized !== undefined ||
			reduced ||
			!documentVisible ||
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
	hidden={!visible}
	role="progressbar"
	aria-label={resolvedLabel}
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow={effectiveValue}
	aria-valuetext={ariaValueText ?? (effectiveValue === undefined ? resolvedLabel : undefined)}
	data-active={visible}
	data-document-visible={documentVisible}
	data-indeterminate={effectiveValue === undefined || undefined}
	data-mode={resolvedMode}
	data-reduced-motion={reduced || undefined}
	data-state={resolvedState}
>
	<div
		bind:this={indicator}
		class={indicatorClass}
		data-slot="indicator"
		style={`width: ${indicatorWidth}%`}
	></div>
</div>
