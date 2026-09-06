<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { ZButtonProps } from '../gene/ZButton.svelte';
	import type { ZLayoutSpacing } from '../../runtime/foundation/layout.js';
	import type { ScrollContainer } from '../../runtime/scroll-target.js';
	import type { PortalTarget } from '../../runtime/layer/portal.js';
	import { defineRecipe } from '../../recipes/define.js';

	export interface ZBackTopProps extends Omit<
		ZButtonProps,
		'aria-label' | 'children' | 'onclick' | 'type'
	> {
		readonly behavior?: ScrollBehavior;
		readonly children?: Snippet;
		readonly insetBlockEnd?: ZLayoutSpacing;
		readonly insetInline?: ZLayoutSpacing;
		readonly label?: string;
		readonly onclick?: ZButtonProps['onclick'];
		readonly placement?: 'end' | 'start';
		readonly portalTarget?: PortalTarget;
		readonly scrollContainer?: ScrollContainer | null;
		readonly visibilityHeight?: number;
	}

	export const zuiMetadata = {
		category: 'navigation',
		id: 'back-top',
		name: 'ZBackTop',
		status: 'experimental',
		since: 'unreleased',
		source: 'ui/zui/src/components/navigation/ZBackTop.svelte',
		importStatement: "import { ZBackTop } from '@zadmin/zui';",
		summary: '在真实Window或HTMLElement超过阈值后显示固定ZButton，并以原生scrollTo返回顶部。',
		dependencies: [
			'ZButton',
			'Presence',
			'PresenceEntryMotion',
			'ReducedMotionState',
			'scroll-target'
		],
		bindings: [
			{ name: 'ref', type: 'HTMLButtonElement | null', description: '可见或退出期间的真实button。' }
		],
		events: [
			{
				name: 'onclick',
				type: 'MouseEventHandler<HTMLButtonElement>',
				description: '原生click先调用；preventDefault取消滚动，disabled使用真实button语义。'
			}
		],
		keyboard: [{ key: 'Enter / Space', description: '激活真实button并滚动目标到顶部。' }],
		parts: [
			{ name: 'anchor', description: '仅用于解析owner Window的隐藏原位锚点。' },
			{ name: 'positioner', description: 'Portal后的逻辑边定位和Presence容器。' },
			{ name: 'button', description: '真实ZButton与可访问名称。' }
		],
		props: [
			{
				name: 'label',
				type: 'string',
				default: 'localePack.common.backToTop',
				description: '完整可访问名称；可覆盖本地化默认值。'
			},
			{
				name: 'children',
				type: 'Snippet',
				default: 'ArrowUp Lucide',
				description: '替换默认向上箭头内容。'
			},
			{
				name: 'scrollContainer',
				type: 'ScrollContainer | null',
				default: 'button所属Window',
				description: '监听并滚动的真实owner；null与undefined均使用owner Window。'
			},
			{
				name: 'visibilityHeight',
				type: 'number',
				default: '400',
				description: '显示button前需要达到的非负scrollTop像素。'
			},
			{
				name: 'behavior',
				type: "'auto' | 'smooth' | 'instant'",
				default: 'smooth',
				description: '原生scrollTo行为；reduced motion强制instant。'
			},
			{
				name: 'placement',
				type: "'start' | 'end'",
				default: 'end',
				description: '逻辑inline起始或结束侧，自动适配RTL。'
			},
			{
				name: 'insetBlockEnd',
				type: 'ZLayoutSpacing',
				default: 'large',
				description: '底部Theme间距档位或非负像素。'
			},
			{
				name: 'insetInline',
				type: 'ZLayoutSpacing',
				default: 'large',
				description: '所选逻辑inline边的Theme间距档位或非负像素。'
			},
			{
				name: 'portalTarget',
				type: 'PortalTarget',
				default: 'Provider portalContainer → owner Document/ShadowRoot',
				description: '固定定位的同owner Portal目标。'
			},
			{
				name: 'size',
				type: 'ButtonSize',
				default: 'componentDefaults.backTop → Button默认 → Provider density',
				description: '真实button五档尺寸。'
			},
			{
				name: 'tone',
				type: 'ButtonTone',
				default: 'componentDefaults.backTop → Button默认 → primary',
				description: '复用ZButton语义tone。'
			},
			{
				name: 'variant',
				type: 'ButtonVariant',
				default: 'componentDefaults.backTop → Button默认 → solid',
				description: '复用ZButton视觉层级。'
			},
			{
				name: 'shape',
				type: 'ButtonShape',
				default: 'componentDefaults.backTop → Button默认 → circle',
				description: '默认圆形，也可使用square/default。'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: '映射到真实button disabled并阻止scrollTo。'
			},
			{
				name: 'ref',
				type: 'HTMLButtonElement | null',
				default: 'null',
				bindable: true,
				description: '真实button引用。'
			}
		],
		snippets: [
			{
				name: 'children',
				type: 'Snippet',
				description: '自定义button内容；label仍拥有可访问名称。'
			}
		],
		states: [
			{
				name: 'data-visible',
				values: ['true', 'false'],
				description: '目标scrollTop是否达到显示阈值。'
			},
			{
				name: 'data-presence',
				values: ['entering', 'entered', 'exiting'],
				description: 'button进入、稳定或退出Presence阶段。'
			},
			{ name: 'data-placement', values: ['start', 'end'], description: '逻辑inline定位边。' },
			{
				name: 'data-reduced-motion',
				values: ['true'],
				description: '当前owner Window解析为减少动画。'
			},
			{
				name: 'aria-hidden',
				values: ['true'],
				description: '退出阶段与inert一起立即移出辅助技术和Tab交互。'
			}
		]
	} as const satisfies ZuiComponentMetadata;

	function spacing(
		s: import('../../icss/types.js').IcssStyle<import('../../theme/types.js').ZuiTheme>,
		property: 'insetBlockEnd' | 'insetInlineEnd' | 'insetInlineStart',
		value: ZLayoutSpacing
	): void {
		if (typeof value === 'number') {
			if (!Number.isFinite(value) || value < 0)
				throw new TypeError('ZBackTop inset spacing must be non-negative and finite.');
			s[property].px(value);
			return;
		}
		if (!['none', 'xsmall', 'small', 'medium', 'large', 'xlarge'].includes(value))
			throw new TypeError('ZBackTop inset spacing must be a Theme spacing or number.');
		s[property][`_${value}`];
	}

	const positionRecipe = defineRecipe(
		{
			base: (s) => {
				s.position.fixed;
				s.zIndex._sticky;
			},
			variants: {
				motion: {
					full: (s) => {
						s.transitionDuration._fast;
						s.transitionProperty.raw('opacity, transform');
						s.transitionTimingFunction._standard;
					},
					reduced: (s) => s.transitionDuration.ms(0)
				},
				presence: {
					entering: (s) => {
						s.opacity(0);
						s.pointerEvents.none;
						s.transform.raw('translateY(0.25rem)');
					},
					entered: (s) => {
						s.opacity._opaque;
						s.transform.raw('translateY(0)');
					},
					exiting: (s) => {
						s.opacity(0);
						s.pointerEvents.none;
						s.transform.raw('translateY(0.25rem)');
					}
				}
			},
			defaultVariants: { motion: 'full', presence: 'entered' }
		},
		import.meta
	);
</script>

<script lang="ts">
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import { onDestroy } from 'svelte';
	import {
		createPresence,
		durationMilliseconds
	} from '../../runtime/foundation/presence.svelte.js';
	import { PresenceEntryMotion } from '../../runtime/foundation/presence-entry-motion.svelte.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { controlSizeMetrics, resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { portal, resolvePortalTarget } from '../../runtime/layer/portal.js';
	import {
		isDomDocument,
		getActiveElement,
		isDomHtmlElement,
		isDomShadowRoot
	} from '../../runtime/layer/dom-realm.js';
	import {
		assertScrollTargetOwner,
		isDomWindow,
		scrollTargetElement,
		scrollTargetPosition,
		scrollTargetToTop
	} from '../../runtime/scroll-target.js';
	import ZButton from '../gene/ZButton.svelte';

	let {
		behavior = 'smooth',
		children,
		class: className,
		dir,
		disabled = false,
		insetBlockEnd = 'large',
		insetInline = 'large',
		label,
		onclick,
		placement = 'end',
		portalTarget,
		ref = $bindable(null),
		scrollContainer,
		shape: shapeProp,
		size,
		style,
		tone: toneProp,
		variant: variantProp,
		visibilityHeight = 400,
		...rest
	}: ZBackTopProps = $props();
	const zui = useZui();
	let anchor = $state<HTMLSpanElement | null>(null);
	let visible = $state(false);
	const motion = new ReducedMotionState(() => zui.motion);
	const presence = createPresence(false);
	const entryMotion = new PresenceEntryMotion(false);
	const defaults = $derived(zui.componentDefaults.backTop);
	const buttonDefaults = $derived(zui.componentDefaults.button);
	const resolvedSize = $derived(
		resolveControlSize(size ?? defaults?.size ?? buttonDefaults?.size, zui.density)
	);
	const resolvedTone = $derived(toneProp ?? defaults?.tone ?? buttonDefaults?.tone ?? 'primary');
	const resolvedVariant = $derived(
		variantProp ?? defaults?.variant ?? buttonDefaults?.variant ?? 'solid'
	);
	const resolvedShape = $derived(shapeProp ?? defaults?.shape ?? buttonDefaults?.shape ?? 'circle');
	const resolvedLabel = $derived(label ?? zui.localePack.common.backToTop);
	const resolvedPlacement = $derived.by(() => {
		if (placement !== 'start' && placement !== 'end')
			throw new TypeError('ZBackTop placement must be start or end.');
		return placement;
	});
	const resolvedBehavior = $derived.by<ScrollBehavior>(() => {
		if (!['auto', 'smooth', 'instant'].includes(behavior))
			throw new TypeError('ZBackTop behavior must be auto, smooth or instant.');
		return motion.current ? 'instant' : behavior;
	});
	const visualPresence = $derived(
		presence.state === 'exiting' ? 'exiting' : entryMotion.entered ? 'entered' : 'entering'
	);
	const positionClass = $derived(
		zui.recipe(positionRecipe, {
			motion: motion.current ? 'reduced' : 'full',
			presence: visualPresence
		})
	);
	const insetClass = $derived(
		zui.icss((s) => {
			spacing(s, 'insetBlockEnd', insetBlockEnd);
			spacing(
				s,
				resolvedPlacement === 'start' ? 'insetInlineStart' : 'insetInlineEnd',
				insetInline
			);
		})
	);
	const resolvedPortalTarget = $derived.by(() => {
		if (!anchor) return null;
		const target = resolvePortalTarget(anchor, portalTarget ?? zui.portalContainer);
		const ownerDocument = isDomDocument(target)
			? target
			: isDomHtmlElement(target) || isDomShadowRoot(target)
				? target.ownerDocument
				: null;
		if (ownerDocument && ownerDocument !== anchor.ownerDocument)
			throw new TypeError('ZBackTop portalTarget must belong to the component ownerDocument.');
		return target;
	});
	let stopFocusCleanup: (() => void) | undefined;

	function focusScrollOwner(target: ScrollContainer): void {
		const element = scrollTargetElement(target);
		stopFocusCleanup?.();
		const hadTabindex = element.hasAttribute('tabindex');
		const previousTabindex = element.getAttribute('tabindex');
		if (element.tabIndex < 0) element.setAttribute('tabindex', '-1');
		element.focus({ preventScroll: true });
		const cleanup = () => {
			element.removeEventListener('blur', cleanup);
			if (hadTabindex) element.setAttribute('tabindex', previousTabindex!);
			else element.removeAttribute('tabindex');
			if (stopFocusCleanup === cleanup) stopFocusCleanup = undefined;
		};
		element.addEventListener('blur', cleanup, { once: true });
		stopFocusCleanup = cleanup;
	}

	$effect(() => {
		const ownerWindow = anchor?.ownerDocument.defaultView;
		return motion.connect(ownerWindow);
	});

	$effect(() => entryMotion.update(visible, motion.current, ref));

	$effect(() => {
		const marker = anchor;
		const configured = scrollContainer;
		const threshold = visibilityHeight;
		if (!Number.isFinite(threshold) || threshold < 0)
			throw new TypeError('ZBackTop visibilityHeight must be a non-negative finite number.');
		if (!marker) return;
		const ownerWindow = marker.ownerDocument.defaultView;
		if (!ownerWindow) return;
		const target = configured ?? ownerWindow;
		if (!isDomHtmlElement(target) && !isDomWindow(target))
			throw new TypeError('ZBackTop scrollContainer must be a Window, HTMLElement or null.');
		assertScrollTargetOwner(target, marker.ownerDocument);
		let frame = 0;
		const update = () => {
			frame = 0;
			visible = scrollTargetPosition(target) >= threshold;
		};
		const schedule = () => {
			if (!frame) frame = ownerWindow.requestAnimationFrame(update);
		};
		const eventTarget = isDomHtmlElement(target) ? target : ownerWindow;
		eventTarget.addEventListener('scroll', schedule, { passive: true });
		update();
		return () => {
			eventTarget.removeEventListener('scroll', schedule);
			if (frame) ownerWindow.cancelAnimationFrame(frame);
		};
	});

	$effect(() => {
		const ownerWindow = anchor?.ownerDocument.defaultView;
		if (!visible && ref && getActiveElement(ref) === ref && ownerWindow) {
			const target = scrollContainer ?? ownerWindow;
			if (isDomHtmlElement(target) || isDomWindow(target)) focusScrollOwner(target);
		}
		presence.update(
			visible,
			motion.current ? 0 : durationMilliseconds(zui.theme.duration.fast),
			ownerWindow
		);
	});

	function handleClick(event: MouseEvent & { currentTarget: HTMLButtonElement }): void {
		onclick?.(event);
		if (event.defaultPrevented || disabled) return;
		const target = scrollContainer ?? event.currentTarget.ownerDocument.defaultView;
		if (!target || (!isDomHtmlElement(target) && !isDomWindow(target))) return;
		assertScrollTargetOwner(target, event.currentTarget.ownerDocument);
		scrollTargetToTop(target, resolvedBehavior);
	}

	onDestroy(() => {
		stopFocusCleanup?.();
		entryMotion.destroy();
		presence.destroy();
	});
</script>

<span bind:this={anchor} hidden aria-hidden="true" data-slot="anchor"></span>
{#if presence.mounted}
	<div
		class={[positionClass, insetClass]}
		dir={dir ?? zui.direction}
		data-placement={resolvedPlacement}
		data-presence={visualPresence}
		data-visible={visible}
		data-reduced-motion={motion.current || undefined}
		data-slot="positioner"
		inert={presence.state === 'exiting'}
		aria-hidden={presence.state === 'exiting' || undefined}
		use:portal={{ target: resolvedPortalTarget }}
		ontransitionend={(event) => {
			if (event.target === event.currentTarget) presence.finishExit();
		}}
	>
		<ZButton
			{...rest}
			bind:ref
			aria-label={resolvedLabel}
			class={className}
			{disabled}
			onclick={handleClick}
			shape={resolvedShape}
			size={resolvedSize}
			{style}
			tone={resolvedTone}
			variant={resolvedVariant}
		>
			{#if children}{@render children()}{:else}<ArrowUp
					aria-hidden="true"
					size={controlSizeMetrics(zui.theme, resolvedSize).indicatorSize}
				/>{/if}
		</ZButton>
	</div>
{/if}
