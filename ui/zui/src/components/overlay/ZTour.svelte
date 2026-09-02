<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { FloatingPlacement } from '../../runtime/layer/floating.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export type TourMissingTargetBehavior = 'close' | 'skip' | 'wait';
	export type TourTargetRoot = Document | Element | ShadowRoot;
	export type TourStepContent = Snippet | string;

	export interface TourStep {
		readonly description: TourStepContent;
		readonly id: string;
		readonly placement?: FloatingPlacement;
		/** Omit or pass null for a centered step that does not point at page content. */
		readonly target?: string | (() => HTMLElement | null) | null;
		readonly title: TourStepContent;
	}

	export interface ZTourProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
		readonly closeLabel?: string;
		readonly closeOnEscape?: boolean;
		readonly closeOnMaskClick?: boolean;
		readonly defaultOpen?: boolean;
		readonly defaultStep?: number;
		readonly finishLabel?: string;
		readonly missingTargetBehavior?: TourMissingTargetBehavior;
		readonly modal?: boolean;
		readonly nextLabel?: string;
		readonly onComplete?: () => void;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onStepChange?: (step: number) => void;
		readonly onTargetMissing?: (step: TourStep) => void;
		open?: boolean;
		readonly previousLabel?: string;
		ref?: HTMLDivElement | null;
		readonly scrollIntoViewOptions?: boolean | ScrollIntoViewOptions;
		readonly spotlightOffset?: number;
		step?: number;
		readonly steps: readonly TourStep[];
		readonly targetRoot?: TourTargetRoot | (() => TourTargetRoot | null);
	}

	export const zuiMetadata = {
		category: 'overlay',
		id: 'tour',
		importStatement: "import { ZTour } from '@zadmin/zui';",
		name: 'ZTour',
		bindings: [
			{ description: '是否打开。', name: 'open', type: 'boolean' },
			{ description: '零起始当前步骤。', name: 'step', type: 'number' },
			{ description: '挂载期间的真实dialog card引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'Portal',
			'Floating',
			'DismissableLayer',
			'LayerStack',
			'FocusScope',
			'Presence',
			'ownerDocument',
			'typed locale pack',
			'reduced motion'
		],
		events: [
			{
				description: '用户打开或关闭后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			},
			{
				description: '用户切换步骤后调用一次。',
				name: 'onStepChange',
				type: '(step: number) => void'
			},
			{ description: '最后一步完成。', name: 'onComplete', type: '() => void' },
			{
				description: '当前作用域内找不到目标时调用一次，随后按missingTargetBehavior处理。',
				name: 'onTargetMissing',
				type: '(step: TourStep) => void'
			}
		],
		keyboard: [
			{ description: '按配置关闭最顶层Tour。', key: 'Escape' },
			{ description: 'modal模式在card与高亮目标之间循环。', key: 'Tab / Shift+Tab' },
			{ description: '激活上一步、下一步、完成和关闭。', key: 'Enter / Space' }
		],
		parts: [
			{ description: '四片遮罩。', name: 'mask' },
			{ description: '目标高亮边界。', name: 'spotlight' },
			{ description: '定位dialog。', name: 'content' },
			{ description: '进度与关闭操作。', name: 'header' },
			{ description: '步骤操作。', name: 'actions' }
		],
		props: [
			{
				default: 'localePack.tour.close',
				description: '关闭操作的可访问名称；显式值优先于Provider typed locale pack。',
				name: 'closeLabel',
				type: 'string'
			},
			{
				default: 'true',
				description: '是否允许最顶层Layer处理Escape关闭当前Tour。',
				name: 'closeOnEscape',
				type: 'boolean'
			},
			{
				default: 'true',
				description: 'modal遮罩是否允许点击关闭；高亮目标仍属于Layer branch。',
				name: 'closeOnMaskClick',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控打开状态的初始值；真实目标解析发生在浏览器挂载后。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				default: '0',
				description: '非受控零起始步骤初值；必须指向steps中的合法索引。',
				name: 'defaultStep',
				type: 'number'
			},
			{
				default: 'localePack.tour.finish',
				description: '最后一步完成操作的文案；显式值优先于Provider typed locale pack。',
				name: 'finishLabel',
				type: 'string'
			},
			{
				default: '必填',
				description: '稳定id、可选目标、富标题、富说明和位置。',
				name: 'steps',
				required: true,
				type: 'readonly TourStep[]'
			},
			{ default: 'false', description: '打开状态。', name: 'open', type: 'boolean' },
			{ default: '0', description: '零起始当前步骤。', name: 'step', type: 'number' },
			{ default: 'true', description: '焦点trap和modal遮罩。', name: 'modal', type: 'boolean' },
			{
				default: 'localePack.tour.next',
				description: '下一步操作的文案；显式值优先于Provider typed locale pack。',
				name: 'nextLabel',
				type: 'string'
			},
			{
				default: "'close'",
				description: '目标缺失时关闭、向后跳过，或保留居中card等待DOM出现。',
				name: 'missingTargetBehavior',
				type: "'close' | 'skip' | 'wait'"
			},
			{
				default: '当前组件根节点',
				description: 'selector查询和MutationObserver的Document、Element或ShadowRoot作用域。',
				name: 'targetRoot',
				type: 'TourTargetRoot | (() => TourTargetRoot | null)'
			},
			{
				default: 'localePack.tour.previous',
				description: '上一步操作的文案；显式值优先于Provider typed locale pack。',
				name: 'previousLabel',
				type: 'string'
			},
			{
				default: 'true',
				description: 'false关闭自动滚动；对象透传原生选项，reduced motion强制behavior为auto。',
				name: 'scrollIntoViewOptions',
				type: 'boolean | ScrollIntoViewOptions'
			},
			{
				default: '8',
				description: '目标四周非负有限像素留白；遮罩与spotlight共享裁剪几何。',
				name: 'spotlightOffset',
				type: 'number'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/overlay/ZTour.svelte',
		states: [
			{ description: '当前步骤id。', name: 'data-step', values: ['TourStep.id'] },
			{ description: '目标等待状态。', name: 'data-missing-target', values: ['true'] },
			{ description: 'Presence生命周期。', name: 'data-presence', values: ['entered', 'exiting'] },
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '解析后的减少动画状态。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'experimental',
		summary:
			'根作用域安全、可等待或跳过缺失目标，并复用ZUI layer/focus/floating/Presence基础设施的Tour。'
	} as const satisfies ZuiComponentMetadata;

	const layerRecipe = defineRecipe({
		base: (s) => {
			s.inset.px(0);
			s.pointerEvents.none;
			s.position.fixed;
			s.zIndex._overlay;
		},
		variants: {},
		defaultVariants: {}
	});
	const maskRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._overlay;
			s.borderStyle.none;
			s.opacity._opaque;
			s.padding.px(0);
			s.pointerEvents.auto;
			s.position.fixed;
			s.transitionDuration._normal;
			s.transitionProperty.raw('opacity');
			s.transitionTimingFunction.ease;
		},
		variants: {
			interactive: { false: () => undefined, true: (s) => s.cursor.pointer },
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			open: { false: (s) => s.opacity(0), true: () => undefined }
		},
		defaultVariants: { interactive: true, motion: 'auto', open: false }
	});
	const spotlightRecipe = defineRecipe({
		base: (s) => {
			s.borderColor._focus;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._medium;
			s.boxShadow._medium;
			s.opacity._opaque;
			s.pointerEvents.none;
			s.position.fixed;
			s.transitionDuration._normal;
			s.transitionProperty.raw('left, top, width, height, opacity');
			s.transitionTimingFunction.ease;
		},
		variants: {
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			open: { false: (s) => s.opacity(0), true: () => undefined }
		},
		defaultVariants: { motion: 'auto', open: false }
	});
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._large;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxShadow._medium;
			s.maxHeight.vh(80);
			s.maxWidth._popconfirm;
			s.opacity._opaque;
			s.overflow.auto;
			s.padding._large;
			s.pointerEvents.auto;
			s.position.fixed;
			s.transitionDuration._normal;
			s.transitionProperty.raw('left, top, opacity');
			s.transitionTimingFunction.ease;
			s.zIndex._modal;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			centered: {
				false: () => undefined,
				true: (s) => {
					s.left.percent(50);
					s.top.percent(50);
					s.transform.raw('translate(-50%, -50%)');
				}
			},
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			open: { false: (s) => s.opacity(0), true: () => undefined },
			positioned: { false: (s) => s.opacity(0), true: () => undefined }
		},
		defaultVariants: { centered: false, motion: 'auto', open: false, positioned: false }
	});
	const headerRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.gap._medium;
			s.justifyContent.spaceBetween;
		},
		variants: {},
		defaultVariants: {}
	});
	const progressRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.fontSize._small;
		},
		variants: {},
		defaultVariants: {}
	});
	const titleRecipe = defineRecipe({
		base: (s) => {
			s.fontSize._large;
			s.margin.px(0);
		},
		variants: {},
		defaultVariants: {}
	});
	const descriptionRecipe = defineRecipe({
		base: (s) => {
			s.color._textMuted;
			s.lineHeight._relaxed;
		},
		variants: {},
		defaultVariants: {}
	});
	const actionsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.gap._medium;
			s.justifyContent.spaceBetween;
			s.marginTop._large;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, layerRecipe);
	registerRecipeHmr(import.meta, maskRecipe);
	registerRecipeHmr(import.meta, spotlightRecipe);
	registerRecipeHmr(import.meta, contentRecipe);
	registerRecipeHmr(import.meta, headerRecipe);
	registerRecipeHmr(import.meta, progressRecipe);
	registerRecipeHmr(import.meta, titleRecipe);
	registerRecipeHmr(import.meta, descriptionRecipe);
	registerRecipeHmr(import.meta, actionsRecipe);
</script>

<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Sets validate stable ids and cache missing reports. */
	import X from '@lucide/svelte/icons/x';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import {
		createPresence,
		durationMilliseconds
	} from '../../runtime/foundation/presence.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { DismissableLayer } from '../../runtime/layer/dismissable-layer.js';
	import {
		isDomDocument,
		isDomElement,
		isDomHtmlElement,
		isDomShadowRoot
	} from '../../runtime/layer/dom-realm.js';
	import { FloatingPositioner } from '../../runtime/layer/floating.js';
	import { FocusScope } from '../../runtime/layer/focus-scope.js';
	import { portal } from '../../runtime/layer/portal.js';
	import ZButton from '../gene/ZButton.svelte';

	interface Rect {
		readonly bottom: number;
		readonly height: number;
		readonly left: number;
		readonly right: number;
		readonly top: number;
		readonly width: number;
	}

	type TargetMode = 'centered' | 'element' | 'idle' | 'waiting';

	let {
		class: className,
		closeLabel,
		closeOnEscape = true,
		closeOnMaskClick = true,
		defaultOpen = false,
		defaultStep = 0,
		finishLabel,
		missingTargetBehavior = 'close',
		modal = true,
		nextLabel,
		onComplete,
		onOpenChange,
		onStepChange,
		onTargetMissing,
		open = $bindable(),
		previousLabel,
		ref = $bindable(null),
		scrollIntoViewOptions = true,
		spotlightOffset = 8,
		step = $bindable(),
		steps,
		style,
		targetRoot,
		...rest
	}: ZTourProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const titleId = $derived(createZuiId(zui.idPrefix, uid, 'tour-title'));
	const descriptionId = $derived(createZuiId(zui.idPrefix, uid, 'tour-description'));
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	const presence = createPresence(false);
	let anchor = $state<HTMLElement | null>(null);
	let clientMounted = $state(false);
	let layer = $state<HTMLDivElement | null>(null);
	let target = $state<HTMLElement | null>(null);
	let targetMode = $state<TargetMode>('idle');
	let renderStep = $state<TourStep | null>(null);
	let renderIndex = $state(0);
	let positioned = $state(false);
	let resolvedPlacement = $state<FloatingPlacement | undefined>(undefined);
	let mutationVersion = $state(0);
	let reportedMissingId = $state<string | null>(null);
	let lastScrolledTarget: HTMLElement | null = null;
	let lastScrolledStepId: string | null = null;
	let rect = $state<Rect>({ bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0 });
	let viewport = $state({ height: 0, width: 0 });

	const normalized = $derived.by(() => {
		if (steps.length === 0) throw new Error('ZTour requires at least one step.');
		const ids = new Set<string>();
		for (const entry of steps) {
			if (!entry.id || ids.has(entry.id))
				throw new Error(`Duplicate or empty ZTour step id "${entry.id}".`);
			ids.add(entry.id);
		}
		return steps;
	});
	const openState = new ControllableState<boolean>({
		defaultValue: () => defaultOpen,
		onChange: () => onOpenChange,
		read: () => open,
		write: (next) => (open = next)
	});
	const stepState = new ControllableState<number>({
		defaultValue: () => defaultStep,
		onChange: () => onStepChange,
		read: () => step,
		write: (next) => (step = next)
	});
	const currentIndex = $derived.by(() => {
		if (
			!Number.isInteger(stepState.current) ||
			stepState.current < 0 ||
			stepState.current >= normalized.length
		)
			throw new RangeError('ZTour step is outside the available step range.');
		return stepState.current;
	});
	const current = $derived(normalized[currentIndex]!);
	const reduced = $derived(reducedMotion.current);
	const targetMissingBehavior = $derived.by(() => {
		if (!['close', 'skip', 'wait'].includes(missingTargetBehavior)) {
			throw new TypeError('ZTour missingTargetBehavior must be close, skip or wait.');
		}
		return missingTargetBehavior;
	});
	const offset = $derived.by(() => {
		if (!Number.isFinite(spotlightOffset) || spotlightOffset < 0)
			throw new TypeError('ZTour spotlightOffset must be a non-negative finite number.');
		return spotlightOffset;
	});
	const root = $derived.by(resolveTargetRoot);
	const portalTarget = $derived.by(() => {
		if (zui.portalContainer) return zui.portalContainer;
		const resolvedRoot = root;
		if (isDomDocument(resolvedRoot) || isDomShadowRoot(resolvedRoot)) return resolvedRoot;
		const rootNode = resolvedRoot?.getRootNode();
		if (isDomDocument(rootNode) || isDomShadowRoot(rootNode)) return rootNode;
		return anchor?.ownerDocument ?? null;
	});
	const exitDuration = $derived(reduced ? 0 : durationMilliseconds(zui.theme.duration.normal));
	const shouldPresent = $derived(
		clientMounted && openState.current && targetMode !== 'idle' && renderStep !== null
	);
	const centered = $derived(targetMode === 'centered' || targetMode === 'waiting');
	const numberFormatter = $derived(new Intl.NumberFormat(zui.locale));
	const progressText = $derived(
		zui.localePack.tour.progress(
			numberFormatter.format(renderIndex + 1),
			numberFormatter.format(normalized.length)
		)
	);
	const resolvedCloseLabel = $derived(closeLabel ?? zui.localePack.tour.close);
	const resolvedFinishLabel = $derived(finishLabel ?? zui.localePack.tour.finish);
	const resolvedNextLabel = $derived(nextLabel ?? zui.localePack.tour.next);
	const resolvedPreviousLabel = $derived(previousLabel ?? zui.localePack.tour.previous);
	const box = $derived.by(() => {
		const left = Math.max(0, Math.min(viewport.width, rect.left - offset));
		const right = Math.max(left, Math.min(viewport.width, rect.right + offset));
		const top = Math.max(0, Math.min(viewport.height, rect.top - offset));
		const bottom = Math.max(top, Math.min(viewport.height, rect.bottom + offset));
		return { bottom, height: bottom - top, left, right, top, width: right - left };
	});
	const layerClass = $derived(zui.recipe(layerRecipe));
	const maskClass = $derived(
		zui.recipe(maskRecipe, {
			interactive: closeOnMaskClick,
			motion: reduced ? 'reduced' : 'full',
			open: openState.current
		})
	);
	const spotlightClass = $derived(
		zui.recipe(spotlightRecipe, {
			motion: reduced ? 'reduced' : 'full',
			open: openState.current
		})
	);
	const contentClass = $derived(
		zui.recipe(contentRecipe, {
			centered,
			motion: reduced ? 'reduced' : 'full',
			open: openState.current,
			positioned: centered || positioned
		})
	);
	const headerClass = $derived(zui.recipe(headerRecipe));
	const progressClass = $derived(zui.recipe(progressRecipe));
	const titleClass = $derived(zui.recipe(titleRecipe));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const actionsClass = $derived(zui.recipe(actionsRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));

	function resolveTargetRoot(): TourTargetRoot | null {
		const configured = typeof targetRoot === 'function' ? targetRoot() : targetRoot;
		if (configured !== undefined && configured !== null) {
			if (!isDomDocument(configured) && !isDomElement(configured) && !isDomShadowRoot(configured))
				throw new TypeError('ZTour targetRoot must resolve to a Document, Element or ShadowRoot.');
			return configured;
		}
		const rootNode = anchor?.getRootNode();
		return isDomDocument(rootNode) || isDomShadowRoot(rootNode) ? rootNode : null;
	}

	function ownerDocumentFor(targetRoot: TourTargetRoot): Document {
		return isDomDocument(targetRoot) ? targetRoot : targetRoot.ownerDocument;
	}

	function containsTarget(targetRoot: TourTargetRoot, candidate: HTMLElement): boolean {
		if (isDomDocument(targetRoot)) return candidate.ownerDocument === targetRoot;
		return targetRoot.contains(candidate);
	}

	function resolveStepTarget(
		entry: TourStep,
		targetRoot: TourTargetRoot
	): { readonly element: HTMLElement | null; readonly mode: 'centered' | 'element' | 'missing' } {
		if (entry.target === undefined || entry.target === null)
			return { element: null, mode: 'centered' };
		const candidate =
			typeof entry.target === 'string' ? targetRoot.querySelector(entry.target) : entry.target();
		if (candidate === null || !candidate.isConnected) return { element: null, mode: 'missing' };
		if (!isDomHtmlElement(candidate))
			throw new TypeError('ZTour target must resolve to an HTMLElement or null.');
		if (!containsTarget(targetRoot, candidate))
			throw new TypeError('ZTour target must belong to targetRoot.');
		return { element: candidate, mode: 'element' };
	}

	function reportMissing(entry: TourStep): void {
		if (reportedMissingId === entry.id) return;
		reportedMissingId = entry.id;
		queueMicrotask(() => {
			if (openState.current && current.id === entry.id) onTargetMissing?.(entry);
		});
	}

	function handleMissing(entry: TourStep, index: number): void {
		reportMissing(entry);
		if (targetMissingBehavior === 'wait') {
			target = null;
			targetMode = 'waiting';
			renderStep = entry;
			renderIndex = index;
			positioned = true;
			return;
		}
		targetMode = 'idle';
		queueMicrotask(() => {
			if (!openState.current || current.id !== entry.id) return;
			if (targetMissingBehavior === 'skip' && index < normalized.length - 1)
				stepState.setFromUser(index + 1);
			else openState.setFromUser(false);
		});
	}

	function scrollTargetIntoView(element: HTMLElement, entry: TourStep): void {
		if (
			scrollIntoViewOptions === false ||
			(lastScrolledTarget === element && lastScrolledStepId === entry.id)
		)
			return;
		const options: ScrollIntoViewOptions =
			scrollIntoViewOptions === true
				? { block: 'center', inline: 'nearest' }
				: scrollIntoViewOptions;
		element.scrollIntoView({
			...options,
			behavior: reduced ? 'auto' : (options.behavior ?? 'smooth')
		});
		lastScrolledTarget = element;
		lastScrolledStepId = entry.id;
	}

	onMount(() => {
		clientMounted = true;
		const disconnect = reducedMotion.connect(anchor?.ownerDocument.defaultView);
		return () => {
			clientMounted = false;
			disconnect();
		};
	});
	onDestroy(() => presence.destroy());

	$effect(() => presence.update(shouldPresent, exitDuration));
	$effect(() => {
		if (!clientMounted || !openState.current) {
			reportedMissingId = null;
			lastScrolledTarget = null;
			lastScrolledStepId = null;
			if (!presence.mounted) {
				target = null;
				targetMode = 'idle';
				renderStep = null;
			}
			return;
		}
		mutationVersion;
		const targetRoot = root;
		if (!targetRoot) {
			handleMissing(current, currentIndex);
			return;
		}
		const resolved = resolveStepTarget(current, targetRoot);
		if (resolved.mode === 'missing') {
			handleMissing(current, currentIndex);
			return;
		}
		reportedMissingId = null;
		renderStep = current;
		renderIndex = currentIndex;
		target = resolved.element;
		targetMode = resolved.mode;
		positioned = resolved.mode === 'centered';
		resolvedPlacement = resolved.mode === 'element' ? (current.placement ?? 'bottom') : undefined;
		if (resolved.element) scrollTargetIntoView(resolved.element, current);
	});
	$effect(() => {
		if (!clientMounted || !openState.current || !root) return;
		const view = ownerDocumentFor(root).defaultView;
		const Observer = view?.MutationObserver;
		if (!Observer) return;
		const observer = new Observer(() => (mutationVersion += 1));
		observer.observe(root, { attributes: true, childList: true, subtree: true });
		return () => observer.disconnect();
	});
	$effect(() => {
		const resolved = target;
		if (!resolved || !openState.current) return;
		const ownerDocument = resolved.ownerDocument;
		const view = ownerDocument.defaultView;
		if (!view) return;
		const update = () => {
			if (!resolved.isConnected) {
				mutationVersion += 1;
				return;
			}
			const next = resolved.getBoundingClientRect();
			rect = {
				bottom: next.bottom,
				height: next.height,
				left: next.left,
				right: next.right,
				top: next.top,
				width: next.width
			};
			viewport = { height: view.innerHeight, width: view.innerWidth };
		};
		update();
		const Observer = view.ResizeObserver;
		const observer = Observer ? new Observer(update) : null;
		observer?.observe(resolved);
		view.addEventListener('resize', update);
		view.addEventListener('scroll', update, true);
		view.visualViewport?.addEventListener('resize', update);
		view.visualViewport?.addEventListener('scroll', update);
		return () => {
			observer?.disconnect();
			view.removeEventListener('resize', update);
			view.removeEventListener('scroll', update, true);
			view.visualViewport?.removeEventListener('resize', update);
			view.visualViewport?.removeEventListener('scroll', update);
		};
	});
	$effect(() => {
		const content = ref;
		const resolved = target;
		if (!content || !openState.current) return;
		if (!resolved || targetMode !== 'element') {
			content.style.removeProperty('left');
			content.style.removeProperty('top');
			content.style.removeProperty('position');
			positioned = true;
			return;
		}
		positioned = false;
		const positioner = new FloatingPositioner();
		return positioner.start(resolved, content, {
			gutter: 12,
			onPosition: (position) => {
				positioned = true;
				resolvedPlacement = position.placement;
			},
			placement: current.placement ?? 'bottom',
			strategy: 'fixed'
		});
	});
	$effect(() => {
		const rootLayer = layer;
		if (!rootLayer || !openState.current) return;
		const dismissable = new DismissableLayer(rootLayer, {
			modal: () => modal,
			onDismiss: () => openState.setFromUser(false),
			onEscape: (event) => {
				if (!closeOnEscape) event.preventDefault();
			},
			onFocusOutside: (event) => event.preventDefault(),
			onPointerOutside: (event) => event.preventDefault()
		});
		const unregisterTarget = target ? dismissable.registerBranch(target) : () => {};
		return () => {
			unregisterTarget();
			dismissable.destroy();
		};
	});
	$effect(() => {
		const content = ref;
		if (!content || !openState.current) return;
		const focusScope = new FocusScope(content, {
			branches: () => (target ? [target] : []),
			restoreFocus: true,
			trap: modal
		});
		return () => focusScope.destroy();
	});

	function close(): void {
		openState.setFromUser(false);
	}

	function maskClick(): void {
		if (closeOnMaskClick) close();
	}

	function previous(): void {
		if (currentIndex > 0) stepState.setFromUser(currentIndex - 1);
	}

	function next(): void {
		if (currentIndex < normalized.length - 1) {
			stepState.setFromUser(currentIndex + 1);
			return;
		}
		onComplete?.();
		close();
	}
</script>

<span bind:this={anchor} hidden aria-hidden="true" data-zui-tour-anchor></span>
{#if presence.mounted && renderStep}
	<div
		bind:this={layer}
		class={layerClass}
		use:portal={{ target: portalTarget }}
		inert={!openState.current}
		data-slot="layer"
		data-state={openState.current ? 'open' : 'closed'}
	>
		{#if modal && targetMode === 'element'}
			<button
				type="button"
				class={maskClass}
				data-slot="mask"
				aria-hidden="true"
				tabindex="-1"
				style={`inset: 0 0 auto 0; height: ${box.top}px;`}
				onclick={maskClick}
			></button>
			<button
				type="button"
				class={maskClass}
				data-slot="mask"
				aria-hidden="true"
				tabindex="-1"
				style={`inset: ${box.bottom}px 0 0 0;`}
				onclick={maskClick}
			></button>
			<button
				type="button"
				class={maskClass}
				data-slot="mask"
				aria-hidden="true"
				tabindex="-1"
				style={`left: 0; top: ${box.top}px; width: ${box.left}px; height: ${box.height}px;`}
				onclick={maskClick}
			></button>
			<button
				type="button"
				class={maskClass}
				data-slot="mask"
				aria-hidden="true"
				tabindex="-1"
				style={`right: 0; top: ${box.top}px; width: ${Math.max(0, viewport.width - box.right)}px; height: ${box.height}px;`}
				onclick={maskClick}
			></button>
		{:else if modal && (targetMode === 'centered' || targetMode === 'waiting')}
			<button
				type="button"
				class={maskClass}
				data-slot="mask"
				aria-hidden="true"
				tabindex="-1"
				style="inset: 0;"
				onclick={maskClick}
			></button>
		{/if}
		{#if targetMode === 'element'}
			<div
				class={spotlightClass}
				data-slot="spotlight"
				style={`left: ${box.left}px; top: ${box.top}px; width: ${box.width}px; height: ${box.height}px;`}
			></div>
		{/if}
		<div
			{...rest}
			bind:this={ref}
			class={[contentClass, className]}
			style={initialStyle}
			use:applyIcssRootStyle={{ style, variables }}
			role="dialog"
			aria-modal={modal ? 'true' : undefined}
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			tabindex="-1"
			dir={zui.direction}
			data-slot="content"
			data-step={renderStep.id}
			data-placement={resolvedPlacement}
			data-missing-target={targetMode === 'waiting' || undefined}
			data-presence={presence.state}
			data-reduced-motion={reduced || undefined}
			data-state={openState.current ? 'open' : 'closed'}
			ontransitionend={(event) => {
				if (event.target === event.currentTarget) presence.finishExit();
			}}
		>
			<div class={headerClass} data-slot="header">
				<div class={progressClass}>{progressText}</div>
				<ZButton aria-label={resolvedCloseLabel} size="small" variant="ghost" onclick={close}>
					<X aria-hidden="true" size={16} />
				</ZButton>
			</div>
			<h2 id={titleId} class={titleClass}>
				{#if typeof renderStep.title === 'string'}
					{renderStep.title}
				{:else}
					{@render renderStep.title()}
				{/if}
			</h2>
			<div id={descriptionId} class={descriptionClass}>
				{#if typeof renderStep.description === 'string'}
					{renderStep.description}
				{:else}
					{@render renderStep.description()}
				{/if}
			</div>
			<div class={actionsClass} data-slot="actions">
				<ZButton size="small" variant="secondary" disabled={currentIndex === 0} onclick={previous}
					>{resolvedPreviousLabel}</ZButton
				>
				<ZButton size="small" onclick={next}>
					{currentIndex === normalized.length - 1 ? resolvedFinishLabel : resolvedNextLabel}
				</ZButton>
			</div>
		</div>
	</div>
{/if}
