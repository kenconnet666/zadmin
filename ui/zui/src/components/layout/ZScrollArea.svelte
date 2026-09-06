<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ResponsiveQuery, ResponsiveValue } from '../../runtime/foundation/responsive.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type ScrollAreaAxis = 'x' | 'y' | 'both';
	export interface ScrollAreaPosition {
		readonly left: number;
		readonly top: number;
	}
	export interface ZScrollAreaController {
		readonly element: HTMLDivElement | null;
		readonly position: ScrollAreaPosition | null;
		scrollTo(options: ScrollToOptions): void;
		scrollBy(options: ScrollToOptions): void;
	}
	export interface ZScrollAreaProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly children?: Snippet;
		readonly axis?: ScrollAreaAxis;
		readonly height?: ResponsiveValue<number | string>;
		readonly minHeight?: ResponsiveValue<number | string>;
		readonly maxHeight?: ResponsiveValue<number | string>;
		readonly query?: ResponsiveQuery;
		readonly scrollbarWidth?: 'auto' | 'thin' | 'none';
		readonly scrollbarGutter?: 'auto' | 'stable' | 'stable both-edges';
		readonly scrollbarStyle?: 'native' | 'themed';
		readonly overscroll?: 'auto' | 'contain' | 'none';
		readonly scrollBehavior?: 'auto' | 'smooth';
		readonly onScrollPositionChange?: (position: ScrollAreaPosition) => void;
		controller?: ZScrollAreaController | null;
		ref?: HTMLDivElement | null;
	}
	export const zuiMetadata = {
		category: 'layout',
		id: 'scroll-area',
		name: 'ZScrollArea',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/layout/ZScrollArea.svelte',
		importStatement: "import { ZScrollArea } from '@zadmin/zui';",
		summary: '原生可聚焦滚动区域，标准CSS滚动条、响应式高度与遵从动画偏好的原生滚动控制。',
		dependencies: ['native CSS overflow', 'ReducedMotionState'],
		parts: [],
		bindings: [
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				description: '真实scroll container；原生onscroll/onscrollend也属于同一节点。'
			},
			{
				name: 'controller',
				type: 'ZScrollAreaController | null',
				description: '挂载后可用的滚动控制器，卸载后释放绑定。'
			}
		],
		snippets: [
			{
				name: 'children',
				type: 'Snippet',
				description: '原始内容与DOM顺序；大数据可在其中组合自己的窗口策略。'
			}
		],
		keyboard: [
			{
				key: 'Tab',
				description: '默认进入真实滚动容器；可用原生tabindex调整，不拦截内部控件焦点。'
			},
			{
				key: 'Arrow / PageUp / PageDown / Home / End',
				description: '聚焦滚动区时由浏览器处理适用的原生滚动，不改写子控件按键。'
			}
		],
		states: [{ name: 'data-axis', values: ['x', 'y', 'both'], description: '允许用户滚动的轴。' }],
		events: [
			{
				name: 'onScrollPositionChange',
				type: '(position: ScrollAreaPosition) => void',
				description: '每次原生scroll事件报告原始scrollLeft/scrollTop；RTL的left可为负数。'
			}
		],
		props: [
			{
				name: 'axis',
				type: 'ScrollAreaAxis',
				default: "'y'",
				description: 'x/y/both；未启用轴使用hidden，保留原生程序滚动与焦点滚入能力。'
			},
			{
				name: 'height',
				type: 'ResponsiveValue<number | string>',
				default: '—',
				description: '滚动区域高度；数字按px，字符串按CSS长度/关键字处理。'
			},
			{
				name: 'minHeight',
				type: 'ResponsiveValue<number | string>',
				default: '—',
				description: '可选最小高度。'
			},
			{
				name: 'maxHeight',
				type: 'ResponsiveValue<number | string>',
				default: '—',
				description: '内容较少时自适应，超出该高度后原生滚动。'
			},
			{
				name: 'query',
				type: 'ResponsiveQuery',
				default: "'viewport'",
				description: '高度响应式配置使用的视口或命名祖先容器。'
			},
			{
				name: 'scrollbarWidth',
				type: "'auto' | 'thin' | 'none'",
				default: "'auto'",
				description: '标准CSS滚动条宽度策略，实际像素由浏览器与系统决定。'
			},
			{
				name: 'scrollbarGutter',
				type: "'auto' | 'stable' | 'stable both-edges'",
				default: "'stable'",
				description: '经典滚动条的布局留位；系统overlay滚动条不保证预留空间。'
			},
			{
				name: 'scrollbarStyle',
				type: "'native' | 'themed'",
				default: "'themed'",
				description: '保留平台配色或使用主题文字/表面色；forced colors下恢复auto。'
			},
			{
				name: 'overscroll',
				type: "'auto' | 'contain' | 'none'",
				default: "'contain'",
				description: '原生滚动边界与向祖先传递策略。'
			},
			{
				name: 'scrollBehavior',
				type: "'auto' | 'smooth'",
				default: "'auto'",
				description: 'CSS和controller的默认行为；减少动画时立即滚动。'
			},
			{
				name: 'onScrollPositionChange',
				type: '(position: ScrollAreaPosition) => void',
				default: '—',
				description: '原生scroll位置通知，与原生onscroll同时可用。'
			},
			{
				name: 'controller',
				type: 'ZScrollAreaController | null',
				default: 'null',
				bindable: true,
				description: 'scrollTo/scrollBy遵从Provider和系统动画偏好；可读取真实element/position。'
			},
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				default: 'null',
				bindable: true,
				description: '真实滚动div引用。'
			}
		]
	} as const satisfies ZuiComponentMetadata;
	const scrollAreaRecipe = defineRecipe({
		base: (s) => {
			s.boxSizing.borderBox;
			s.minWidth.px(0);
			s.minHeight.px(0);
			s.maxWidth.percent(100);
			s._focusVisible((s) => {
				s.outlineStyle.solid;
				s.outlineWidth._medium;
				s.outlineColor._focus;
				s.outlineOffset._inner;
			});
		},
		variants: {}
	});
	registerRecipeHmr(import.meta, scrollAreaRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { applyResponsiveStyles } from '../../runtime/foundation/responsive.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { cssLength } from '../../theme/units.js';

	let {
		children,
		axis = 'y',
		height,
		minHeight,
		maxHeight,
		query = 'viewport',
		scrollbarWidth = 'auto',
		scrollbarGutter = 'stable',
		scrollbarStyle = 'themed',
		overscroll = 'contain',
		scrollBehavior = 'auto',
		onScrollPositionChange,
		controller = $bindable(null),
		ref = $bindable(null),
		class: className,
		dir,
		style,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		role = 'region',
		tabindex = 0,
		onscroll,
		...rest
	}: ZScrollAreaProps = $props();
	const zui = useZui();
	const resolvedDirection = $derived(dir ?? zui.direction);
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const rootClass = $derived(zui.recipe(scrollAreaRecipe));
	function length(value: number | string): string {
		if (
			typeof value === 'number' ? !Number.isFinite(value) || value < 0 : value.trim().length === 0
		)
			throw new TypeError(
				'ScrollArea height must be a CSS length or a non-negative finite number.'
			);
		return cssLength(value);
	}
	const layoutClass = $derived(
		zui.icss((s) => {
			if (!['x', 'y', 'both'].includes(axis)) throw new TypeError('Invalid ScrollArea axis.');
			if (axis === 'x' || axis === 'both') s.overflowX.auto;
			else s.overflowX.hidden;
			if (axis === 'y' || axis === 'both') s.overflowY.auto;
			else s.overflowY.hidden;
			if (!['auto', 'thin', 'none'].includes(scrollbarWidth))
				throw new TypeError('Invalid scrollbarWidth.');
			s.scrollbarWidth[scrollbarWidth];
			switch (scrollbarGutter) {
				case 'auto':
					s.scrollbarGutter.auto;
					break;
				case 'stable':
					s.scrollbarGutter.stable;
					break;
				case 'stable both-edges':
					s.scrollbarGutter.stableBothEdges;
					break;
				default:
					throw new TypeError('Invalid scrollbarGutter.');
			}
			if (scrollbarStyle === 'native' || zui.contrast === 'high') s.scrollbarColor.auto;
			else if (scrollbarStyle === 'themed')
				s.scrollbarColor.raw(`${zui.theme.color.textMuted} ${zui.theme.color.surface}`);
			else throw new TypeError('Invalid scrollbarStyle.');
			if (!['auto', 'contain', 'none'].includes(overscroll))
				throw new TypeError('Invalid overscroll behavior.');
			s.overscrollBehavior[overscroll];
			if (!['auto', 'smooth'].includes(scrollBehavior))
				throw new TypeError('Invalid scroll behavior.');
			if (reducedMotion.current || scrollBehavior === 'auto') s.scrollBehavior.auto;
			else s.scrollBehavior.smooth;
			if (zui.motion === 'auto')
				s._media('(prefers-reduced-motion: reduce)', (s) => s.scrollBehavior.auto);
			s._media('(forced-colors: active)', (s) => s.scrollbarColor.auto);
			applyResponsiveStyles(s, height, (s, value) => s.height.raw(length(value)), query);
			applyResponsiveStyles(s, minHeight, (s, value) => s.minHeight.raw(length(value)), query);
			applyResponsiveStyles(s, maxHeight, (s, value) => s.maxHeight.raw(length(value)), query);
		})
	);
	const position = (): ScrollAreaPosition | null =>
		ref ? { left: ref.scrollLeft, top: ref.scrollTop } : null;
	const behavior = (requested?: ScrollBehavior): ScrollBehavior =>
		zui.motion === 'reduced' || reducedMotion.current ? 'instant' : (requested ?? scrollBehavior);
	const api: ZScrollAreaController = {
		get element() {
			return ref;
		},
		get position() {
			return position();
		},
		scrollTo(options) {
			ref?.scrollTo({ ...options, behavior: behavior(options.behavior) });
		},
		scrollBy(options) {
			ref?.scrollBy({ ...options, behavior: behavior(options.behavior) });
		}
	};
	$effect(() => reducedMotion.connect(ref?.ownerDocument.defaultView));
	$effect(() => {
		controller = api;
		const owned = untrack(() => controller);
		return () => {
			if (controller === owned) controller = null;
		};
	});
	$effect(() => {
		if (reducedMotion.current && ref)
			ref.scrollTo({ left: ref.scrollLeft, top: ref.scrollTop, behavior: 'instant' });
	});
	function handleScroll(event: Parameters<NonNullable<ZScrollAreaProps['onscroll']>>[0]): void {
		onscroll?.(event);
		onScrollPositionChange?.({
			left: event.currentTarget.scrollLeft,
			top: event.currentTarget.scrollTop
		});
	}
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -- named native scroll regions are intentionally keyboard-focusable -->
<div
	{...rest}
	bind:this={ref}
	{role}
	{tabindex}
	aria-label={ariaLabel ?? (ariaLabelledby ? undefined : zui.localePack.common.scrollArea)}
	aria-labelledby={ariaLabelledby}
	data-axis={axis}
	dir={resolvedDirection}
	class={[rootClass, layoutClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	onscroll={handleScroll}
>
	{@render children?.()}
</div>
