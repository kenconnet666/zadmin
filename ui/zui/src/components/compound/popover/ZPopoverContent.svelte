<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export interface ZPopoverContentProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'aria-labelledby' | 'children' | 'id' | 'role'
	> {
		readonly ariaDescribedBy?: string;
		readonly ariaLabelledBy?: string | null;
		readonly children?: Snippet;
		readonly manageFocus?: boolean;
		ref?: HTMLDivElement | null;
		readonly role?: 'dialog' | 'listbox' | 'presentation';
	}

	const popoverContentRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._medium;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxShadow._medium;
			s.color._text;
			s.opacity._opaque;
			s.padding._large;
			s.position.absolute;
			s.transform.raw('translateY(0) scale(1)');
			s.transitionDuration._fast;
			s.transitionProperty.raw('opacity, transform');
			s.transitionTimingFunction.ease;
			s.zIndex._dropdown;
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
					s.transform.raw('translateY(-4px) scale(0.98)');
				},
				true: () => undefined
			}
		},
		defaultVariants: { motion: 'auto', open: false }
	});

	registerRecipeHmr(import.meta, popoverContentRecipe);

	export const zuiMetadata = {
		category: 'overlay',
		id: 'popover-content',
		importStatement: "import { ZPopoverContent } from '@zadmin/zui';",
		name: 'ZPopoverContent',
		bindings: [
			{ description: '挂载期间的真实dialog引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZPopover', 'Portal', 'Floating', 'DismissableLayer', 'FocusScope', 'Presence'],
		events: [],
		keyboard: [{ description: '关闭顶层Popover。', key: 'Escape' }],
		parts: [],
		props: [
			{
				default: 'true',
				description:
					'是否在打开时移动并在关闭时恢复焦点；Combobox等active-descendant封装关闭此项。',
				name: 'manageFocus',
				type: 'boolean'
			},
			{
				default: "'dialog'",
				description: 'Popover shell角色；Menu等复合封装使用presentation。',
				name: 'role',
				type: "'dialog' | 'listbox' | 'presentation'"
			},
			{
				default: 'Trigger id',
				description: '覆盖dialog可访问名称来源，供复合封装使用。',
				name: 'ariaLabelledBy',
				type: 'string'
			},
			{
				default: 'undefined',
				description: 'dialog可访问说明元素id，供复合封装使用。',
				name: 'ariaDescribedBy',
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
		since: '0.3.0',
		snippets: [{ description: 'Popover内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/popover/ZPopoverContent.svelte',
		states: [
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: 'Presence生命周期。', name: 'data-presence', values: ['entered', 'exiting'] }
		],
		status: 'experimental',
		summary: 'Portal定位并统一管理outside dismiss、focus与退出Presence的Popover dialog。'
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
	import { FloatingPositioner } from '../../../runtime/layer/floating.js';
	import { FocusScope } from '../../../runtime/layer/focus-scope.js';
	import { inertOthers } from '../../../runtime/layer/inert-others.js';
	import { portal } from '../../../runtime/layer/portal.js';
	import { lockScroll } from '../../../runtime/layer/scroll-lock.js';
	import { useZPopover } from './context.svelte.js';

	let {
		ariaDescribedBy,
		ariaLabelledBy,
		children,
		class: className,
		manageFocus = true,
		ref = $bindable(null),
		role = 'dialog',
		style,
		...rest
	}: ZPopoverContentProps = $props();
	const zui = useZui();
	const popover = useZPopover();
	const initiallyOpen = untrack(() => popover.open);
	const presence = createPresence(initiallyOpen);
	const mounted = $derived(presence.mounted);
	const presenceState = $derived(presence.state);
	const rootClass = $derived(
		zui.recipe(popoverContentRecipe, { motion: zui.motion, open: popover.open })
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	$effect(() => presence.update(popover.open, popover.exitDuration));
	$effect(() => {
		const content = ref;
		const trigger = popover.trigger;
		if (!popover.open || !content || !trigger) return;
		const positioner = new FloatingPositioner();
		const stopPositioning = positioner.start(trigger, content, {
			gutter: popover.gutter,
			matchWidth: popover.matchWidth,
			placement: popover.placement
		});
		const dismissable = new DismissableLayer(content, {
			modal: () => popover.modal,
			onDismiss: () => popover.setOpen(false)
		});
		const removeTriggerBranch = dismissable.registerBranch(trigger);
		const focusScope = manageFocus
			? new FocusScope(content, { restoreFocus: true, trap: popover.modal })
			: undefined;
		const releaseScroll = popover.modal ? lockScroll(content.ownerDocument) : undefined;
		const restoreOthers = popover.modal ? inertOthers(content) : undefined;
		return () => {
			restoreOthers?.();
			releaseScroll?.();
			focusScope?.destroy();
			removeTriggerBranch();
			dismissable.destroy();
			stopPositioning();
		};
	});
	onDestroy(() => presence.destroy());
</script>

{#if mounted}
	<!-- The shell is the intentional focus fallback when no descendant is tabbable. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		use:portal={{ target: popover.portalTarget }}
		id={popover.contentId}
		{role}
		tabindex={-1}
		inert={!popover.open}
		aria-hidden={!popover.open}
		aria-labelledby={ariaLabelledBy === null ? undefined : (ariaLabelledBy ?? popover.triggerId)}
		aria-describedby={ariaDescribedBy}
		data-presence={presenceState}
		data-state={popover.open ? 'open' : 'closed'}
		ontransitionend={(event) => {
			if (event.target === event.currentTarget) presence.finishExit();
		}}
	>
		{@render children?.()}
	</div>
{/if}
