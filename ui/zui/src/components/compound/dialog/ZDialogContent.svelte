<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { DismissableLayerEvent } from '../../../runtime/layer/dismissable-layer.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export type DialogEscapeEvent = DismissableLayerEvent<KeyboardEvent>;
	export type DialogFocusOutsideEvent = DismissableLayerEvent<FocusEvent>;
	export type DialogPointerOutsideEvent = DismissableLayerEvent<PointerEvent>;

	export interface ZDialogContentProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'aria-describedby' | 'aria-label' | 'aria-labelledby' | 'children' | 'id' | 'role'
	> {
		readonly appearance?: 'dialog' | 'unstyled';
		readonly ariaDescribedBy?: string | null;
		readonly ariaLabel?: string;
		readonly ariaLabelledBy?: string | null;
		readonly children?: Snippet;
		readonly dismissOnEscape?: boolean;
		readonly dismissOnPointerOutside?: boolean;
		readonly initialFocus?: () => HTMLElement | null;
		readonly onEscape?: (event: DialogEscapeEvent) => void;
		readonly onFocusOutside?: (event: DialogFocusOutsideEvent) => void;
		readonly onPointerOutside?: (event: DialogPointerOutsideEvent) => void;
		ref?: HTMLDivElement | null;
		readonly restoreFocus?: boolean;
		readonly restoreTarget?: () => HTMLElement | null;
		readonly role?: 'alertdialog' | 'dialog';
	}

	const contentRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._large;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxSizing.borderBox;
			s.boxShadow._medium;
			s.color._text;
			s.left.percent(50);
			s.maxHeight.vh(90);
			s.maxWidth._dialogMedium;
			s.overflow.auto;
			s.padding._xlarge;
			s.position.fixed;
			s.top.percent(50);
			s.transform.raw('translate(-50%, -50%) scale(1)');
			s.transitionDuration._normal;
			s.transitionProperty.raw('opacity, transform');
			s.transitionTimingFunction.ease;
			s.width.percent(90);
			s.zIndex._modal;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(2);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			open: {
				false: (s) => {
					s.opacity(0);
					s.transform.raw('translate(-50%, -50%) scale(0.98)');
				},
				true: () => undefined
			}
		},
		defaultVariants: { motion: 'auto', open: false }
	});
	registerRecipeHmr(import.meta, contentRecipe);
	export const zuiMetadata = {
		category: 'overlay',
		id: 'dialog-content',
		importStatement: "import { ZDialogContent } from '@zadmin/zui';",
		name: 'ZDialogContent',
		bindings: [
			{ description: '挂载期间的真实dialog引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'ZDialog',
			'Portal',
			'DismissableLayer',
			'FocusScope',
			'scroll lock',
			'inert others',
			'Presence'
		],
		events: [
			{
				description: 'Escape dismiss前的可取消事件。',
				name: 'onEscape',
				type: '(event: DialogEscapeEvent) => void'
			},
			{
				description: '焦点尝试离开modal时的可取消事件。',
				name: 'onFocusOutside',
				type: '(event: DialogFocusOutsideEvent) => void'
			},
			{
				description: 'pointer落在Content外部前的可取消事件。',
				name: 'onPointerOutside',
				type: '(event: DialogPointerOutsideEvent) => void'
			}
		],
		keyboard: [
			{ description: '关闭最顶层Dialog。', key: 'Escape' },
			{ description: '在Dialog内循环焦点。', key: 'Tab / Shift+Tab' }
		],
		parts: [],
		props: [
			{
				default: "'dialog'",
				description: '使用默认居中Dialog视觉，或由复合封装提供完整视觉。',
				name: 'appearance',
				type: "'dialog' | 'unstyled'"
			},
			{
				default: 'true',
				description: 'Escape是否关闭Dialog。',
				name: 'dismissOnEscape',
				type: 'boolean'
			},
			{
				default: 'true',
				description: 'pointer落在Content外部时是否关闭Dialog。',
				name: 'dismissOnPointerOutside',
				type: 'boolean'
			},
			{
				default: "'dialog'",
				description: 'modal的ARIA角色；AlertDialog使用alertdialog。',
				name: 'role',
				type: "'dialog' | 'alertdialog'"
			},
			{
				default: '首个tabbable元素',
				description: '显式初始焦点目标。',
				name: 'initialFocus',
				type: '() => HTMLElement | null'
			},
			{
				default: 'true',
				description: '关闭时是否恢复焦点。',
				name: 'restoreFocus',
				type: 'boolean'
			},
			{
				default: 'Trigger',
				description: '覆盖关闭后的焦点目标。',
				name: 'restoreTarget',
				type: '() => HTMLElement | null'
			},
			{
				default: '已挂载Title id',
				description: '显式名称来源；null移除aria-labelledby。',
				name: 'ariaLabelledBy',
				type: 'string | null'
			},
			{
				default: '已挂载Description id',
				description: '显式说明来源；null移除aria-describedby。',
				name: 'ariaDescribedBy',
				type: 'string | null'
			},
			{
				default: 'undefined',
				description: '无Title时提供直接可访问名称。',
				name: 'ariaLabel',
				type: 'string'
			},
			{
				bindable: true,
				default: 'null',
				description: '挂载期间的真实dialog引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: 'Title、Description、业务内容与Close。', name: 'children', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/dialog/ZDialogContent.svelte',
		states: [
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '解析后的减少动画状态。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'stable',
		summary:
			'modal Portal中统一管理top layer、真实ARIA引用、可取消outside事件、焦点策略、scroll、inert与Presence的Dialog内容。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { createPresence } from '../../../runtime/foundation/presence.svelte.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../../runtime/foundation/root-style.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../../runtime/foundation/compiler-bridge.js';
	import { DismissableLayer } from '../../../runtime/layer/dismissable-layer.js';
	import { FocusScope } from '../../../runtime/layer/focus-scope.js';
	import { inertOthers } from '../../../runtime/layer/inert-others.js';
	import { portal } from '../../../runtime/layer/portal.js';
	import { lockScroll } from '../../../runtime/layer/scroll-lock.js';
	import { useZDialog } from './context.svelte.js';

	let {
		appearance = 'dialog',
		ariaDescribedBy,
		ariaLabel,
		ariaLabelledBy,
		children,
		class: className,
		dismissOnEscape = true,
		dismissOnPointerOutside = true,
		initialFocus,
		onEscape,
		onFocusOutside,
		onPointerOutside,
		ref = $bindable(null),
		restoreFocus = true,
		restoreTarget,
		role = 'dialog',
		style,
		...rest
	}: ZDialogContentProps = $props();
	const zui = useZui();
	const dialog = useZDialog();
	const initiallyOpen = untrack(() => dialog.open);
	const presence = createPresence(initiallyOpen);
	const mounted = $derived(presence.mounted);
	const presenceState = $derived(presence.state);
	let presenceOwnerWindow = $state<Window | null>(null);
	const rootClass = $derived(
		appearance === 'dialog'
			? zui.recipe(contentRecipe, {
					motion: dialog.reducedMotion ? 'reduced' : 'full',
					open: dialog.open
				})
			: undefined
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	const explicitLabel = $derived(ariaLabel?.trim() || undefined);
	const explicitLabelledBy = $derived(ariaLabelledBy?.trim() || undefined);
	const resolvedLabelledBy = $derived(
		ariaLabelledBy === null
			? undefined
			: (explicitLabelledBy ?? (explicitLabel ? undefined : dialog.titleId))
	);
	const resolvedDescribedBy = $derived(
		ariaDescribedBy === null ? undefined : ariaDescribedBy?.trim() || dialog.descriptionId
	);
	$effect(() => {
		const ownerWindow = dialog.ownerWindow ?? ref?.ownerDocument.defaultView;
		if (ownerWindow) presenceOwnerWindow = ownerWindow;
	});
	$effect(() => presence.update(dialog.open, dialog.exitDuration, presenceOwnerWindow));
	$effect(() => {
		const namedByTitle = ariaLabelledBy === undefined && !explicitLabel && dialog.hasTitle;
		if (dialog.open && ref && !explicitLabelledBy && !explicitLabel && !namedByTitle) {
			throw new TypeError('ZDialogContent requires ZDialogTitle, ariaLabel, or ariaLabelledBy.');
		}
	});
	$effect(() => {
		const content = ref;
		if (!dialog.open || !content) return;
		const dismissable = new DismissableLayer(content, {
			modal: () => true,
			onDismiss: () => dialog.setOpen(false),
			onEscape: (event) => {
				onEscape?.(event);
				if (!dismissOnEscape) event.preventDefault();
			},
			onFocusOutside: (event) => {
				onFocusOutside?.(event);
				event.preventDefault();
			},
			onPointerOutside: (event) => {
				onPointerOutside?.(event);
				if (!dismissOnPointerOutside) event.preventDefault();
			}
		});
		const focusScope = new FocusScope(content, {
			initialFocus,
			restoreFocus,
			restoreTarget: restoreTarget ?? (() => dialog.trigger),
			trap: true
		});
		const releaseScroll = lockScroll(content.ownerDocument);
		const restoreOthers = inertOthers(content, dialog.overlay ? [dialog.overlay] : []);
		return () => {
			restoreOthers();
			releaseScroll();
			focusScope.destroy();
			dismissable.destroy();
		};
	});
	onDestroy(() => presence.destroy());
</script>

{#if mounted}
	<!-- The modal container is the intentional focus fallback when it has no tabbable descendants. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		use:portal={{ target: dialog.portalTarget }}
		id={dialog.contentId}
		{role}
		tabindex={-1}
		inert={!dialog.open}
		aria-modal="true"
		aria-label={resolvedLabelledBy ? undefined : explicitLabel}
		aria-labelledby={resolvedLabelledBy}
		aria-describedby={resolvedDescribedBy}
		data-presence={presenceState}
		data-reduced-motion={dialog.reducedMotion || undefined}
		data-state={dialog.open ? 'open' : 'closed'}
		ontransitionend={(event) => {
			if (event.target === event.currentTarget) presence.finishExit();
		}}
	>
		{@render children?.()}
	</div>
{/if}
