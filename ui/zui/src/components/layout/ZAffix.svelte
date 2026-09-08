<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ScrollContainer } from '../../runtime/scroll-target.js';
	import type { PortalTarget } from '../../runtime/layer/portal.js';
	import { defineSlotRecipe } from '../../recipes/slots.js';

	export interface ZAffixProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		readonly boundary?: HTMLElement | null;
		readonly children?: Snippet;
		readonly offsetBottom?: number;
		readonly offsetTop?: number;
		readonly onAffixChange?: (affixed: boolean) => void;
		readonly portalTarget?: PortalTarget;
		readonly scrollContainer?: ScrollContainer | null;
		ref?: HTMLDivElement | null;
	}

	export const zuiMetadata = {
		category: 'layout',
		id: 'affix',
		name: 'ZAffix',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/layout/ZAffix.svelte',
		importStatement: "import { ZAffix } from '@zadmin/zui';",
		summary:
			'默认以原生sticky固定内容；显式scrollContainer时用带占位、边界和owner清理的fixed投影。',
		dependencies: [
			'native position:sticky',
			'@floating-ui/dom getOverflowAncestors',
			'owner Window ResizeObserver',
			'scroll target geometry'
		],
		bindings: [
			{ name: 'ref', type: 'HTMLDivElement | null', description: '保留布局占位的真实根div。' }
		],
		events: [
			{
				name: 'onAffixChange',
				type: '(affixed: boolean) => void',
				description: '显式scrollContainer投影跨越阈值时调用；初始未固定状态不发事件。'
			}
		],
		keyboard: [],
		parts: [
			{ name: 'root', description: '接收原生属性、class、style、ICSS和ref的布局占位。' },
			{ name: 'content', description: 'native sticky或scrollContainer fixed投影的内容容器。' }
		],
		props: [
			{
				name: 'children',
				type: 'Snippet',
				default: 'undefined',
				description: '被固定的完整内容。'
			},
			{
				name: 'offsetTop',
				type: 'number',
				default: '0（offsetBottom存在时不使用）',
				description: '距离滚动owner可视区顶部的非负像素偏移。'
			},
			{
				name: 'offsetBottom',
				type: 'number',
				default: 'undefined',
				description: '距离滚动owner可视区底部的非负像素偏移；与offsetTop不能同时显式提供。'
			},
			{
				name: 'scrollContainer',
				type: 'ScrollContainer | null',
				default: 'undefined（原生sticky）',
				description: '显式滚动owner；提供后启用JS fixed投影，null表示暂不连接。'
			},
			{
				name: 'boundary',
				type: 'HTMLElement | null',
				default: 'fixed模式下root.parentElement',
				description: '限制fixed内容不越过的同owner边界。'
			},
			{
				name: 'onAffixChange',
				type: '(affixed: boolean) => void',
				default: 'undefined',
				description: '真实fixed状态变化回调。'
			},
			{
				name: 'portalTarget',
				type: 'PortalTarget',
				default: 'Provider portalContainer → owner Document/ShadowRoot',
				description: 'fixed时承载内容的同owner逃逸容器；默认避开transform祖先。'
			},
			{
				name: 'ref',
				type: 'HTMLDivElement | null',
				default: 'null',
				bindable: true,
				description: '真实占位根引用。'
			}
		],
		snippets: [{ name: 'children', type: 'Snippet', description: 'Affix内容。' }],
		states: [
			{
				name: 'data-mode',
				values: ['sticky', 'fixed'],
				description: '原生sticky或显式scrollContainer投影模式。'
			},
			{ name: 'data-affixed', values: ['true'], description: 'fixed模式当前跨越阈值。' },
			{ name: 'data-edge', values: ['top', 'bottom'], description: '当前约束的物理滚动边。' }
		]
	} as const satisfies ZuiComponentMetadata;

	const recipe = defineSlotRecipe(
		{
			slots: ['root', 'content'] as const,
			base: {
				root: (s) => {
					s.boxSizing.borderBox;
					s.minWidth.px(0);
					s.position.relative;
				},
				content: (s) => {
					s.boxSizing.borderBox;
					s.maxWidth.percent(100);
					s.minWidth.px(0);
					s.zIndex._sticky;
				}
			},
			variants: {
				affixed: {
					false: {},
					true: {
						root: (s) => s.blockSize.raw('var(--zui-affix-height)'),
						content: (s) => {
							s.color.raw('var(--zui-affix-color, inherit)');
							s.fontFamily.raw('var(--zui-affix-font-family, inherit)');
							s.fontSize.raw('var(--zui-affix-font-size, inherit)');
							s.fontWeight.raw('var(--zui-affix-font-weight, inherit)');
							s.letterSpacing.raw('var(--zui-affix-letter-spacing, inherit)');
							s.lineHeight.raw('var(--zui-affix-line-height, inherit)');
							s.left.raw('var(--zui-affix-left)');
							s.position.fixed;
							s.top.raw('var(--zui-affix-top)');
							s.width.raw('var(--zui-affix-width)');
						}
					}
				},
				mode: {
					fixed: {},
					sticky: { content: (s) => s.position.sticky }
				}
			}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { getOverflowAncestors } from '@floating-ui/dom';
	import { onDestroy, untrack } from 'svelte';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import {
		containsComposedNode,
		isDomDocument,
		isDomHtmlElement,
		isDomShadowRoot
	} from '../../runtime/layer/dom-realm.js';
	import { portal, resolvePortalTarget } from '../../runtime/layer/portal.js';
	import {
		assertScrollTargetOwner,
		isDomWindow,
		scrollTargetPosition,
		scrollTargetViewport
	} from '../../runtime/scroll-target.js';

	let {
		boundary,
		children,
		class: className,
		offsetBottom,
		offsetTop,
		onAffixChange,
		portalTarget,
		ref = $bindable(null),
		scrollContainer,
		style,
		...rest
	}: ZAffixProps = $props();
	const zui = useZui();
	const edge = $derived(offsetBottom === undefined ? 'top' : 'bottom');
	const offset = $derived(offsetBottom ?? offsetTop ?? 0);
	const mode = $derived(scrollContainer === undefined ? 'sticky' : 'fixed');
	let content = $state<HTMLDivElement | null>(null);
	let affixed = $state(false);
	let fixedLeft = $state(0);
	let fixedTop = $state(0);
	let fixedWidth = $state(0);
	let placeholderHeight = $state(0);
	let presentationColor = $state('inherit');
	let presentationFontFamily = $state('inherit');
	let presentationFontSize = $state('inherit');
	let presentationFontWeight = $state('inherit');
	let presentationLetterSpacing = $state('inherit');
	let presentationLineHeight = $state('inherit');
	let presentationDirection = $state<'ltr' | 'rtl'>('ltr');
	let alive = true;
	const validated = $derived.by(() => {
		if (offsetTop !== undefined && offsetBottom !== undefined)
			throw new TypeError('ZAffix offsetTop and offsetBottom are mutually exclusive.');
		for (const [name, value] of [
			['offsetTop', offsetTop],
			['offsetBottom', offsetBottom]
		] as const) {
			if (value !== undefined && (!Number.isFinite(value) || value < 0))
				throw new TypeError(`ZAffix ${name} must be a non-negative finite number.`);
		}
		return true;
	});
	const classes = $derived.by(() => {
		void validated;
		return zui.slots(recipe, { affixed: mode === 'fixed' && affixed, mode });
	});
	const rootVariables = $derived({
		...readIcssCarrier(rest),
		'--zui-affix-height': `${placeholderHeight}px`
	} as const);
	const contentVariables = $derived({
		...readIcssCarrier(rest),
		'--zui-affix-color': presentationColor,
		'--zui-affix-font-family': presentationFontFamily,
		'--zui-affix-font-size': presentationFontSize,
		'--zui-affix-font-weight': presentationFontWeight,
		'--zui-affix-left': `${fixedLeft}px`,
		'--zui-affix-letter-spacing': presentationLetterSpacing,
		'--zui-affix-line-height': presentationLineHeight,
		'--zui-affix-top': `${fixedTop}px`,
		'--zui-affix-width': `${fixedWidth}px`
	} as const);
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(rootVariables)));
	const stickyStyle = $derived(edge === 'top' ? `top: ${offset}px;` : `bottom: ${offset}px;`);
	const initialContentStyle = untrack(() =>
		mergeStyles(
			mode === 'sticky' ? stickyStyle : undefined,
			serializeIcssVariables(contentVariables)
		)
	);
	const resolvedPortalTarget = $derived.by(() => {
		if (mode !== 'fixed' || !affixed || !ref) return null;
		const candidate = resolvePortalTarget(ref, portalTarget ?? zui.portalContainer);
		const ownerDocument = isDomDocument(candidate)
			? candidate
			: isDomHtmlElement(candidate) || isDomShadowRoot(candidate)
				? candidate.ownerDocument
				: null;
		if (ownerDocument && ownerDocument !== ref.ownerDocument)
			throw new TypeError('ZAffix portalTarget must belong to the component ownerDocument.');
		return candidate;
	});

	function setAffixed(next: boolean): void {
		if (next === affixed) return;
		affixed = next;
		onAffixChange?.(next);
	}

	function capturePresentation(root: HTMLElement): void {
		const view = root.ownerDocument.defaultView;
		if (!view) return;
		const computed = view.getComputedStyle(root);
		presentationColor = computed.color;
		presentationFontFamily = computed.fontFamily;
		presentationFontSize = computed.fontSize;
		presentationFontWeight = computed.fontWeight;
		presentationLetterSpacing = computed.letterSpacing;
		presentationLineHeight = computed.lineHeight;
		presentationDirection = computed.direction === 'rtl' ? 'rtl' : 'ltr';
	}

	$effect(() => {
		zui.theme;
		zui.direction;
		rest.dir;
		className;
		style;
		const root = ref;
		if (root) untrack(() => capturePresentation(root));
	});

	$effect(() => {
		void validated;
		const root = ref;
		const item = content;
		const currentScrollContainer = scrollContainer;
		const boundaryElement = boundary ?? root?.parentElement;
		const currentEdge = edge;
		const currentOffset = offset;
		if (!root || !item || mode !== 'fixed') {
			untrack(() => setAffixed(false));
			return;
		}
		const scrollTarget = currentScrollContainer;
		if (!scrollTarget || (!isDomHtmlElement(scrollTarget) && !isDomWindow(scrollTarget))) {
			untrack(() => setAffixed(false));
			return;
		}
		assertScrollTargetOwner(scrollTarget, root.ownerDocument);
		if (boundaryElement && boundaryElement.ownerDocument !== root.ownerDocument)
			throw new TypeError('ZAffix boundary must belong to the component ownerDocument.');
		const ownerWindow = root.ownerDocument.defaultView;
		if (!ownerWindow) return;
		const contained = isDomHtmlElement(scrollTarget) && containsComposedNode(scrollTarget, root);
		const initialViewport = scrollTargetViewport(scrollTarget);
		const initialScroll = scrollTargetPosition(scrollTarget);
		const initialRoot = root.getBoundingClientRect();
		const anchorTop = initialRoot.top - initialViewport.top + initialScroll;
		const anchorBottom = initialRoot.bottom - initialViewport.top + initialScroll;
		let frame = 0;
		const update = () => {
			frame = 0;
			if (!root.isConnected || !item.isConnected) return;
			const viewport = scrollTargetViewport(scrollTarget);
			capturePresentation(root);
			const rootRect = root.getBoundingClientRect();
			const scroll = scrollTargetPosition(scrollTarget);
			const projectedTop = contained ? rootRect.top : viewport.top + anchorTop - scroll;
			const projectedBottom = contained ? rootRect.bottom : viewport.top + anchorBottom - scroll;
			const itemHeight = item.offsetHeight || rootRect.height;
			placeholderHeight = rootRect.height || itemHeight;
			const width = Math.min(rootRect.width, Math.max(0, viewport.right - viewport.left));
			let top =
				currentEdge === 'top'
					? viewport.top + currentOffset
					: viewport.bottom - currentOffset - itemHeight;
			const next =
				currentEdge === 'top'
					? projectedTop <= viewport.top + currentOffset
					: projectedBottom >= viewport.bottom - currentOffset;
			if (next && boundaryElement) {
				const boundaryRect = boundaryElement.getBoundingClientRect();
				top =
					currentEdge === 'top'
						? Math.min(top, boundaryRect.bottom - itemHeight)
						: Math.max(top, boundaryRect.top);
			}
			fixedLeft = Math.min(
				Math.max(rootRect.left, viewport.left),
				Math.max(viewport.left, viewport.right - width)
			);
			fixedTop = top;
			fixedWidth = width;
			untrack(() => setAffixed(next));
		};
		const schedule = () => {
			if (!frame) frame = ownerWindow.requestAnimationFrame(update);
		};
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Local listener targets for this attachment, not UI state.
		const eventSources = new Set<EventTarget>(getOverflowAncestors(root));
		if (isDomHtmlElement(scrollTarget)) {
			eventSources.add(scrollTarget);
			for (const ancestor of getOverflowAncestors(scrollTarget)) eventSources.add(ancestor);
		} else eventSources.add(ownerWindow);
		for (const source of eventSources) {
			source.addEventListener('scroll', schedule, { passive: true });
			source.addEventListener('resize', schedule);
		}
		const Resize = ownerWindow.ResizeObserver;
		const resize = Resize ? new Resize(schedule) : undefined;
		resize?.observe(root);
		resize?.observe(item);
		if (isDomHtmlElement(scrollTarget)) resize?.observe(scrollTarget);
		if (boundaryElement) resize?.observe(boundaryElement);
		update();
		return () => {
			for (const source of eventSources) {
				source.removeEventListener('scroll', schedule);
				source.removeEventListener('resize', schedule);
			}
			resize?.disconnect();
			if (frame) ownerWindow.cancelAnimationFrame(frame);
			if (alive) untrack(() => setAffixed(false));
		};
	});

	onDestroy(() => {
		alive = false;
	});
</script>

<div
	{...rest}
	dir={rest.dir ?? zui.direction}
	bind:this={ref}
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: rootVariables }}
	data-mode={mode}
	data-affixed={affixed || undefined}
	data-edge={edge}
	data-slot="root"
>
	<div
		bind:this={content}
		class={classes.content}
		data-slot="content"
		dir={affixed ? presentationDirection : undefined}
		style={initialContentStyle}
		use:applyIcssRootStyle={{
			style: mode === 'sticky' ? stickyStyle : undefined,
			variables: contentVariables
		}}
		use:portal={{ target: resolvedPortalTarget }}
	>
		{@render children?.()}
	</div>
</div>
