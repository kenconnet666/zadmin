<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type { FloatingPlacement } from '../../runtime/layer/floating.js';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	export interface TourStep {
		readonly description: string;
		readonly id: string;
		readonly placement?: FloatingPlacement;
		readonly target: string | (() => HTMLElement | null);
		readonly title: string;
	}
	export interface ZTourProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
		readonly closeLabel?: string;
		readonly closeOnEscape?: boolean;
		readonly closeOnMaskClick?: boolean;
		readonly defaultOpen?: boolean;
		readonly defaultStep?: number;
		readonly finishLabel?: string;
		readonly modal?: boolean;
		readonly nextLabel?: string;
		readonly onComplete?: () => void;
		readonly onOpenChange?: (open: boolean) => void;
		readonly onStepChange?: (step: number) => void;
		readonly onTargetMissing?: (step: TourStep) => void;
		open?: boolean;
		readonly previousLabel?: string;
		ref?: HTMLDivElement | null;
		step?: number;
		readonly steps: readonly TourStep[];
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
			'reduced motion'
		],
		events: [
			{ description: '打开状态变化。', name: 'onOpenChange', type: '(open: boolean) => void' },
			{ description: '步骤变化。', name: 'onStepChange', type: '(step: number) => void' },
			{ description: '最后一步完成。', name: 'onComplete', type: '() => void' },
			{
				description: '目标不存在并自动关闭。',
				name: 'onTargetMissing',
				type: '(step: TourStep) => void'
			}
		],
		keyboard: [
			{ description: '关闭最顶层Tour。', key: 'Escape' },
			{ description: '在modal card内循环。', key: 'Tab / Shift+Tab' },
			{ description: '激活上一步、下一步、完成和关闭。', key: 'Enter / Space' }
		],
		parts: [
			{ description: '四片遮罩。', name: 'mask' },
			{ description: '目标高亮边界。', name: 'spotlight' },
			{ description: '定位dialog。', name: 'content' },
			{ description: '步骤操作。', name: 'actions' }
		],
		props: [
			{
				default: '必填',
				description: '稳定id、目标、标题、说明和位置。',
				name: 'steps',
				required: true,
				type: 'readonly TourStep[]'
			},
			{ default: 'false', description: '打开状态。', name: 'open', type: 'boolean' },
			{ default: '0', description: '零起始当前步骤。', name: 'step', type: 'number' },
			{ default: 'true', description: '焦点trap和modal layer。', name: 'modal', type: 'boolean' },
			{ default: 'true', description: '点击遮罩关闭。', name: 'closeOnMaskClick', type: 'boolean' }
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/overlay/ZTour.svelte',
		states: [
			{ description: '当前步骤id。', name: 'data-step', values: ['TourStep.id'] },
			{ description: 'modal模式。', name: 'aria-modal', values: ['true', 'false'] }
		],
		status: 'experimental',
		summary: '复用ZUI layer/focus/floating基础设施并以四片遮罩高亮真实目标的Tour。'
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
			s.padding.px(0);
			s.position.fixed;
		},
		variants: {
			interactive: { false: () => undefined, true: (s) => s.cursor.pointer },
			modal: { false: (s) => s.pointerEvents.none, true: (s) => s.pointerEvents.auto }
		},
		defaultVariants: { interactive: true, modal: true }
	});
	const spotlightRecipe = defineRecipe({
		base: (s) => {
			s.borderColor._focus;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._medium;
			s.boxShadow._medium;
			s.pointerEvents.none;
			s.position.fixed;
		},
		variants: {},
		defaultVariants: {}
	});
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._large;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxShadow._medium;
			s.maxWidth._popconfirm;
			s.padding._large;
			s.pointerEvents.auto;
			s.position.fixed;
			s.zIndex._modal;
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
	registerRecipeHmr(import.meta, titleRecipe);
	registerRecipeHmr(import.meta, descriptionRecipe);
	registerRecipeHmr(import.meta, actionsRecipe);
</script>

<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- The Set validates stable step ids. */
	import X from '@lucide/svelte/icons/x';
	import { onMount, untrack } from 'svelte';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ReducedMotionState } from '../../runtime/foundation/motion.svelte.js';
	import { DismissableLayer } from '../../runtime/layer/dismissable-layer.js';
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
	let {
		class: className,
		closeLabel = 'Close tour',
		closeOnEscape = true,
		closeOnMaskClick = true,
		defaultOpen = false,
		defaultStep = 0,
		finishLabel = 'Finish',
		modal = true,
		nextLabel = 'Next',
		onComplete,
		onOpenChange,
		onStepChange,
		onTargetMissing,
		open = $bindable(),
		previousLabel = 'Previous',
		ref = $bindable(null),
		step = $bindable(),
		steps,
		style,
		...rest
	}: ZTourProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const titleId = $derived(createZuiId(zui.idPrefix, uid, 'tour-title'));
	const descriptionId = $derived(createZuiId(zui.idPrefix, uid, 'tour-description'));
	const reducedMotion = new ReducedMotionState(() => zui.motion);
	let mounted = $state(false);
	let layer = $state<HTMLDivElement | null>(null);
	let target = $state<HTMLElement | null>(null);
	let rect = $state<Rect>({ bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0 });
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
	const gap = 8;
	const layerClass = $derived(zui.recipe(layerRecipe));
	const maskClass = $derived(zui.recipe(maskRecipe, { interactive: closeOnMaskClick, modal }));
	const spotlightClass = $derived(zui.recipe(spotlightRecipe));
	const contentClass = $derived(zui.recipe(contentRecipe));
	const titleClass = $derived(zui.recipe(titleRecipe));
	const descriptionClass = $derived(zui.recipe(descriptionRecipe));
	const actionsClass = $derived(zui.recipe(actionsRecipe));
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const portalTarget = $derived(
		zui.portalContainer ?? (typeof document === 'undefined' ? null : document)
	);
	onMount(() => {
		mounted = true;
		const disconnect = reducedMotion.connect();
		return () => {
			mounted = false;
			disconnect();
		};
	});
	$effect(() => {
		if (!mounted || !openState.current) {
			target = null;
			return;
		}
		const resolved =
			typeof current.target === 'string'
				? document.querySelector<HTMLElement>(current.target)
				: current.target();
		if (!resolved) {
			const missing = current;
			queueMicrotask(() => {
				if (!openState.current || current.id !== missing.id) return;
				onTargetMissing?.(missing);
				openState.setFromUser(false);
			});
			return;
		}
		target = resolved;
		resolved.scrollIntoView({
			behavior: reduced ? 'auto' : 'smooth',
			block: 'center',
			inline: 'nearest'
		});
		const update = () => {
			if (!resolved.isConnected) {
				target = null;
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
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(resolved);
		window.addEventListener('resize', update);
		window.addEventListener('scroll', update, true);
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', update);
			window.removeEventListener('scroll', update, true);
		};
	});
	$effect(() => {
		if (!target || !ref || !openState.current) return;
		const positioner = new FloatingPositioner();
		return positioner.start(target, ref, {
			gutter: 12,
			placement: current.placement ?? 'bottom',
			strategy: 'fixed'
		});
	});
	$effect(() => {
		if (!layer || !target || !openState.current) return;
		const dismissable = new DismissableLayer(layer, {
			modal: () => modal,
			onDismiss: () => openState.setFromUser(false),
			onEscape: (event) => {
				if (!closeOnEscape) event.preventDefault();
			},
			onFocusOutside: (event) => {
				if (modal) event.preventDefault();
			},
			onPointerOutside: (event) => event.preventDefault()
		});
		const unregisterTarget = dismissable.registerBranch(target);
		return () => {
			unregisterTarget();
			dismissable.destroy();
		};
	});
	$effect(() => {
		if (!ref || !openState.current) return;
		const focusScope = new FocusScope(ref, { restoreFocus: true, trap: modal });
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

{#if mounted && openState.current && target}<div
		bind:this={layer}
		class={layerClass}
		use:portal={{ target: portalTarget }}
		data-slot="layer"
	>
		<button
			type="button"
			class={maskClass}
			data-slot="mask"
			aria-hidden="true"
			tabindex="-1"
			style={`inset: 0 0 auto 0; height: ${Math.max(0, rect.top - gap)}px;`}
			onclick={maskClick}
		></button>
		<button
			type="button"
			class={maskClass}
			data-slot="mask"
			aria-hidden="true"
			tabindex="-1"
			style={`inset: ${Math.min(innerHeight, rect.bottom + gap)}px 0 0 0;`}
			onclick={maskClick}
		></button>
		<button
			type="button"
			class={maskClass}
			data-slot="mask"
			aria-hidden="true"
			tabindex="-1"
			style={`left: 0; top: ${Math.max(0, rect.top - gap)}px; width: ${Math.max(0, rect.left - gap)}px; height: ${rect.height + gap * 2}px;`}
			onclick={maskClick}
		></button>
		<button
			type="button"
			class={maskClass}
			data-slot="mask"
			aria-hidden="true"
			tabindex="-1"
			style={`right: 0; top: ${Math.max(0, rect.top - gap)}px; width: ${Math.max(0, innerWidth - rect.right - gap)}px; height: ${rect.height + gap * 2}px;`}
			onclick={maskClick}
		></button>
		<div
			class={spotlightClass}
			data-slot="spotlight"
			style={`left: ${Math.max(0, rect.left - gap)}px; top: ${Math.max(0, rect.top - gap)}px; width: ${rect.width + gap * 2}px; height: ${rect.height + gap * 2}px;`}
		></div>
		<div
			{...rest}
			bind:this={ref}
			class={[contentClass, className]}
			style={initialStyle}
			use:applyIcssRootStyle={{ style, variables }}
			role="dialog"
			aria-modal={modal}
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			tabindex="-1"
			data-slot="content"
			data-step={current.id}
		>
			<ZButton aria-label={closeLabel} size="small" variant="ghost" onclick={close}
				><X aria-hidden="true" size={16} /></ZButton
			>
			<div>{currentIndex + 1} / {normalized.length}</div>
			<h2 id={titleId} class={titleClass}>{current.title}</h2>
			<p id={descriptionId} class={descriptionClass}>{current.description}</p>
			<div class={actionsClass} data-slot="actions">
				<ZButton size="small" variant="secondary" disabled={currentIndex === 0} onclick={previous}
					>{previousLabel}</ZButton
				><ZButton size="small" onclick={next}
					>{currentIndex === normalized.length - 1 ? finishLabel : nextLabel}</ZButton
				>
			</div>
		</div>
	</div>{/if}
