<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export interface ZTooltipContentProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'children' | 'id' | 'role'
	> {
		readonly children?: Snippet;
		ref?: HTMLDivElement | null;
	}

	const tooltipContentRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._text;
			s.borderRadius._small;
			s.boxShadow._small;
			s.color._canvas;
			s.fontSize._small;
			s.fontWeight._medium;
			s.opacity._opaque;
			s.paddingBlock._small;
			s.paddingInline._medium;
			s.pointerEvents.none;
			s.position.absolute;
			s.transitionDuration._fast;
			s.transitionProperty.raw('opacity, transform');
			s.transitionTimingFunction.ease;
			s.zIndex._dropdown;
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
					s.transform.raw('scale(0.98)');
				},
				true: (s) => s.transform.raw('scale(1)')
			}
		},
		defaultVariants: { motion: 'auto', open: false }
	});

	registerRecipeHmr(import.meta, tooltipContentRecipe);

	export const zuiMetadata = {
		category: 'overlay',
		id: 'tooltip-content',
		importStatement: "import { ZTooltipContent } from '@zadmin/zui';",
		name: 'ZTooltipContent',
		bindings: [
			{ description: '挂载期间的真实tooltip引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZTooltip', 'Portal', 'Floating', 'LayerStack', 'Presence'],
		events: [],
		keyboard: [{ description: '关闭顶层Tooltip。', key: 'Escape' }],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '挂载期间的真实tooltip引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.3.0',
		snippets: [{ description: '纯文本或非交互说明内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/tooltip/ZTooltipContent.svelte',
		states: [
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: 'Presence生命周期。', name: 'data-presence', values: ['entered', 'exiting'] }
		],
		status: 'experimental',
		summary: '非交互、Portal定位并由顶层Layer拥有Escape的Tooltip内容。'
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
	import { portal } from '../../../runtime/layer/portal.js';
	import { useZTooltip } from './context.svelte.js';

	let {
		children,
		class: className,
		ref = $bindable(null),
		style,
		...rest
	}: ZTooltipContentProps = $props();
	const zui = useZui();
	const tooltip = useZTooltip();
	const initiallyOpen = untrack(() => tooltip.open);
	const presence = createPresence(initiallyOpen);
	const mounted = $derived(presence.mounted);
	const presenceState = $derived(presence.state);
	const rootClass = $derived(
		zui.recipe(tooltipContentRecipe, { motion: zui.motion, open: tooltip.open })
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	const interactiveSelector = [
		'a[href]',
		'button',
		'input:not([type="hidden"])',
		'select',
		'textarea',
		'[contenteditable="true"]',
		'[tabindex]:not([tabindex="-1"])'
	].join(',');

	$effect(() => presence.update(tooltip.open, tooltip.exitDuration));
	$effect(() => {
		const content = ref;
		const trigger = tooltip.trigger;
		if (!tooltip.open || !content || !trigger) return;
		if (content.querySelector(interactiveSelector)) {
			throw new TypeError(
				'ZTooltipContent cannot contain interactive or focusable content; use ZPopover.'
			);
		}
		const positioner = new FloatingPositioner();
		const stopPositioning = positioner.start(trigger, content, {
			gutter: tooltip.gutter,
			placement: tooltip.placement
		});
		const dismissable = new DismissableLayer(content, {
			onDismiss: (reason) => tooltip.close(reason === 'escape')
		});
		const removeTriggerBranch = dismissable.registerBranch(trigger);
		return () => {
			removeTriggerBranch();
			dismissable.destroy();
			stopPositioning();
		};
	});
	onDestroy(() => presence.destroy());
</script>

{#if mounted}
	<div
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		use:portal={{ target: tooltip.portalTarget }}
		id={tooltip.contentId}
		role="tooltip"
		aria-hidden={!tooltip.open}
		data-presence={presenceState}
		data-state={tooltip.open ? 'open' : 'closed'}
		ontransitionend={(event) => {
			if (event.target === event.currentTarget) presence.finishExit();
		}}
	>
		{@render children?.()}
	</div>
{/if}
