<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface ZCarouselProps<TItem = unknown> extends Omit<
		HTMLAttributes<HTMLElement>,
		'aria-label' | 'children'
	> {
		readonly 'aria-label'?: string;
		/** @deprecated Use the native `aria-label` spelling. */
		readonly ariaLabel?: string;
		readonly autoplayInterval?: number;
		readonly defaultValue?: SelectionKey;
		readonly item: Snippet<[TItem, number]>;
		readonly itemKey: (item: TItem, index: number) => SelectionKey;
		readonly itemLabel: (item: TItem, index: number) => string;
		readonly items: readonly TItem[];
		readonly loop?: boolean;
		readonly nextLabel?: string;
		readonly onValueChange?: (value: SelectionKey) => void;
		readonly pauseLabel?: string;
		readonly pauseOnHover?: boolean;
		readonly playLabel?: string;
		readonly previousLabel?: string;
		ref?: HTMLElement | null;
		value?: SelectionKey;
	}
	export const zuiMetadata = {
		category: 'data-display',
		id: 'carousel',
		importStatement: "import { ZCarousel } from '@zadmin/zui';",
		name: 'ZCarousel',
		bindings: [
			{ description: '当前稳定slide key。', name: 'value', type: 'SelectionKey' },
			{ description: '真实region引用。', name: 'ref', type: 'HTMLElement | null' }
		],
		dependencies: [
			'ControllableState',
			'typed locale pack',
			'owner realm reduced motion',
			'owner realm visibility',
			'owned autoplay timer'
		],
		events: [
			{
				description: '用户、控制或自动轮播切换。',
				name: 'onValueChange',
				type: '(value: SelectionKey) => void'
			}
		],
		keyboard: [
			{ description: '原生上一张、下一张、暂停和直接跳转按钮。', key: 'Tab / Enter / Space' }
		],
		parts: [
			{ description: 'slide viewport。', name: 'viewport' },
			{ description: '单个slide。', name: 'slide' },
			{ description: '上一张/下一张/暂停控制。', name: 'controls' },
			{ description: '直接跳转按钮。', name: 'indicators' }
		],
		props: [
			{
				default: '必填',
				description: 'Carousel region的原生可访问名称。',
				name: 'aria-label',
				required: true,
				type: 'string'
			},
			{
				default: 'undefined',
				description: 'deprecated兼容别名；新代码使用aria-label。',
				name: 'ariaLabel',
				type: 'string',
				deprecatedSince: 'unreleased',
				replacement: 'aria-label',
				replacementExternal: true
			},
			{
				default: 'undefined',
				description: '初始slide key；缺失时使用items的第一个key。',
				name: 'defaultValue',
				type: 'SelectionKey'
			},
			{
				default: '必填',
				description: 'slides数据。',
				name: 'items',
				required: true,
				type: 'readonly TItem[]',
				opaque: {
					kind: 'caller-generic',
					resolution: 'generic-unexpanded',
					type: 'readonly TItem[]',
					genericParameters: ['TItem'],
					reason: 'slide item结构由调用方定义。',
					owner: 'caller'
				}
			},
			{
				default: '必填',
				description: '稳定slide key。',
				name: 'itemKey',
				required: true,
				type: '(item: TItem, index: number) => SelectionKey'
			},
			{
				default: '必填',
				description: '生成每张slide的可访问位置名称。',
				name: 'itemLabel',
				required: true,
				type: '(item: TItem, index: number) => string'
			},
			{
				default: 'undefined',
				description: '至少1000ms；缺失不自动轮播。',
				name: 'autoplayInterval',
				type: 'number'
			},
			{
				default: 'localePack.carousel.nextSlide',
				description: '下一张控制的可访问名称。',
				name: 'nextLabel',
				type: 'string'
			},
			{ default: 'true', description: '边界是否循环。', name: 'loop', type: 'boolean' },
			{
				default: 'localePack.carousel.pauseRotation',
				description: '暂停自动轮播控制的可访问名称。',
				name: 'pauseLabel',
				type: 'string'
			},
			{ default: 'true', description: 'hover期间暂停。', name: 'pauseOnHover', type: 'boolean' },
			{
				default: 'localePack.carousel.startRotation',
				description: '恢复自动轮播控制的可访问名称。',
				name: 'playLabel',
				type: 'string'
			},
			{
				default: 'localePack.carousel.previousSlide',
				description: '上一张控制的可访问名称。',
				name: 'previousLabel',
				type: 'string'
			}
		],
		since: 'unreleased',
		snippets: [{ description: 'slide内容。', name: 'item', type: 'Snippet<[TItem, number]>' }],
		source: 'ui/zui/src/components/data-display/ZCarousel.svelte',
		states: [
			{ description: '当前slide。', name: 'data-active', values: ['true'] },
			{ description: '自动轮播暂停。', name: 'data-paused', values: ['true'] },
			{ description: '减少动画并停用自动轮播。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'stable',
		summary: '使用稳定collection、显式rotation control和多原因暂停策略的Carousel。'
	} as const satisfies ZuiComponentMetadata;
	const recipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._large;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.overflow.hidden;
		},
		variants: {},
		defaultVariants: {}
	});
	const viewportRecipe = defineRecipe({
		base: (s) => s.position.relative,
		variants: {},
		defaultVariants: {}
	});
	const slideRecipe = defineRecipe({
		base: (s) => s.padding._xlarge,
		variants: {},
		defaultVariants: {}
	});
	const controlsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.gap._medium;
			s.justifyContent.spaceBetween;
			s.padding._large;
		},
		variants: {},
		defaultVariants: {}
	});
	const indicatorsRecipe = defineRecipe({
		base: (s) => {
			s.display.flex;
			s.gap._small;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, recipe);
	registerRecipeHmr(import.meta, viewportRecipe);
	registerRecipeHmr(import.meta, slideRecipe);
	registerRecipeHmr(import.meta, controlsRecipe);
	registerRecipeHmr(import.meta, indicatorsRecipe);
</script>

<script lang="ts" generics="TItem">
	/* eslint-disable svelte/prefer-svelte-reactivity -- The Set validates stable keys. */
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import { onMount, untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { isDomNode } from '../../runtime/layer/dom-realm.js';
	import ZButton from '../gene/ZButton.svelte';
	let {
		'aria-label': ariaLabelNative,
		ariaLabel,
		autoplayInterval,
		class: className,
		defaultValue,
		item,
		itemKey,
		itemLabel,
		items,
		loop = true,
		nextLabel,
		onValueChange,
		pauseLabel,
		pauseOnHover = true,
		playLabel,
		previousLabel,
		ref = $bindable(null),
		style,
		value = $bindable(),
		...rest
	}: ZCarouselProps<TItem> = $props();
	const zui = useZui();
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let pausedByUser = $state(false);
	let hovered = $state(false);
	let focusWithin = $state(false);
	let documentHidden = $state(false);
	const normalized = $derived.by(() => {
		if (items.length === 0) throw new Error('ZCarousel requires at least one item.');
		const keys = new Set<SelectionKey>();
		return items.map((entry, index) => {
			const key = itemKey(entry, index);
			if (keys.has(key)) throw new Error(`Duplicate ZCarousel key "${String(key)}".`);
			keys.add(key);
			return { entry, key, label: itemLabel(entry, index) };
		});
	});
	const firstKey = () => defaultValue ?? normalized[0]!.key;
	const valueState = new ControllableState<SelectionKey>({
		defaultValue: firstKey,
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const activeIndex = $derived.by(() => {
		const index = normalized.findIndex(({ key }) => Object.is(key, valueState.current));
		if (index < 0) throw new Error(`Unknown ZCarousel value "${String(valueState.current)}".`);
		return index;
	});
	const reduced = $derived(reducedMotion.current);
	const resolvedAriaLabel = $derived.by(() => {
		const label = ariaLabelNative ?? ariaLabel;
		if (!label) throw new TypeError('ZCarousel requires aria-label.');
		return label;
	});
	const numberFormatter = $derived(new Intl.NumberFormat(zui.locale));
	const resolvedNextLabel = $derived(nextLabel ?? zui.localePack.carousel.nextSlide);
	const resolvedPauseLabel = $derived(pauseLabel ?? zui.localePack.carousel.pauseRotation);
	const resolvedPlayLabel = $derived(playLabel ?? zui.localePack.carousel.startRotation);
	const resolvedPreviousLabel = $derived(previousLabel ?? zui.localePack.carousel.previousSlide);
	const PreviousIcon = $derived(zui.direction === 'rtl' ? ChevronRight : ChevronLeft);
	const NextIcon = $derived(zui.direction === 'rtl' ? ChevronLeft : ChevronRight);
	const autoPaused = $derived(
		pausedByUser || focusWithin || documentHidden || (pauseOnHover && hovered) || reduced
	);
	const rootClass = $derived(zui.recipe(recipe));
	const viewportClass = $derived(zui.recipe(viewportRecipe));
	const slideClass = $derived(zui.recipe(slideRecipe));
	const controlsClass = $derived(zui.recipe(controlsRecipe));
	const indicatorsClass = $derived(zui.recipe(indicatorsRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	onMount(() => {
		const ownerDocument = ref?.ownerDocument;
		const disconnectMotion = reducedMotion.connect(ownerDocument?.defaultView);
		if (!ownerDocument) return disconnectMotion;
		const updateVisibility = (): void => {
			documentHidden = ownerDocument.visibilityState === 'hidden';
		};
		updateVisibility();
		ownerDocument.addEventListener('visibilitychange', updateVisibility);
		return () => {
			disconnectMotion();
			ownerDocument.removeEventListener('visibilitychange', updateVisibility);
		};
	});
	$effect(() => {
		if (autoplayInterval === undefined) return;
		if (!Number.isFinite(autoplayInterval) || autoplayInterval < 1000)
			throw new TypeError('ZCarousel autoplayInterval must be at least 1000ms.');
		if (autoPaused || normalized.length < 2) return;
		const view = ref?.ownerDocument.defaultView;
		if (!view) return;
		const timer = view.setInterval(() => move(1), autoplayInterval);
		return () => view.clearInterval(timer);
	});
	function move(delta: -1 | 1): void {
		const target = activeIndex + delta;
		if (!loop && (target < 0 || target >= normalized.length)) return;
		const index = (target + normalized.length) % normalized.length;
		valueState.setFromUser(normalized[index]!.key);
	}
	function choose(index: number): void {
		valueState.setFromUser(normalized[index]!.key);
	}
	function focusOut(event: FocusEvent & { currentTarget: HTMLElement }): void {
		if (isDomNode(event.relatedTarget) && event.currentTarget.contains(event.relatedTarget)) return;
		focusWithin = false;
	}
</script>

<section
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	aria-roledescription={zui.localePack.carousel.carouselRole}
	aria-label={resolvedAriaLabel}
	data-paused={autoPaused || undefined}
	data-reduced-motion={reduced || undefined}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	onfocusin={() => (focusWithin = true)}
	onfocusout={focusOut}
>
	{#if autoplayInterval !== undefined}<ZButton
			aria-label={reduced
				? zui.localePack.carousel.automaticRotationDisabled
				: pausedByUser
					? resolvedPlayLabel
					: resolvedPauseLabel}
			aria-pressed={pausedByUser}
			disabled={reduced}
			size="small"
			variant="ghost"
			onclick={() => (pausedByUser = !pausedByUser)}
			>{#if pausedByUser}<Play aria-hidden="true" size={16} />{:else}<Pause
					aria-hidden="true"
					size={16}
				/>{/if}</ZButton
		>{/if}
	<div
		class={viewportClass}
		data-slot="viewport"
		aria-live={autoplayInterval !== undefined && !autoPaused ? 'off' : 'polite'}
	>
		{#each normalized as slide, index (slide.key)}<div
				class={slideClass}
				data-slot="slide"
				role="group"
				aria-roledescription={zui.localePack.carousel.slideRole}
				aria-label={zui.localePack.carousel.slidePosition(
					numberFormatter.format(index + 1),
					numberFormatter.format(normalized.length),
					slide.label
				)}
				data-active={index === activeIndex || undefined}
				hidden={index !== activeIndex}
			>
				{@render item(slide.entry, index)}
			</div>{/each}
	</div>
	<div class={controlsClass} data-slot="controls">
		<ZButton
			aria-label={resolvedPreviousLabel}
			disabled={!loop && activeIndex === 0}
			size="small"
			variant="secondary"
			onclick={() => move(-1)}><PreviousIcon aria-hidden="true" size={16} /></ZButton
		>
		<div
			class={indicatorsClass}
			data-slot="indicators"
			role="group"
			aria-label={zui.localePack.carousel.chooseSlide}
		>
			{#each normalized as slide, index (slide.key)}<ZButton
					aria-label={zui.localePack.carousel.goToSlide(
						numberFormatter.format(index + 1),
						slide.label
					)}
					aria-current={index === activeIndex ? 'true' : undefined}
					size="small"
					variant={index === activeIndex ? 'primary' : 'ghost'}
					onclick={() => choose(index)}>{index + 1}</ZButton
				>{/each}
		</div>
		<ZButton
			aria-label={resolvedNextLabel}
			disabled={!loop && activeIndex === normalized.length - 1}
			size="small"
			variant="secondary"
			onclick={() => move(1)}><NextIcon aria-hidden="true" size={16} /></ZButton
		>
	</div>
</section>
