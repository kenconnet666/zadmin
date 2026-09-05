<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export interface ZDialogOverlayProps extends HTMLAttributes<HTMLDivElement> {
		ref?: HTMLDivElement | null;
	}

	const overlayRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._overlay;
			s.inset.px(0);
			s.opacity._opaque;
			s.position.fixed;
			s.transitionDuration._normal;
			s.transitionProperty.raw('opacity');
			s.zIndex._overlay;
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
	registerRecipeHmr(import.meta, overlayRecipe);

	export const zuiMetadata = {
		category: 'overlay',
		id: 'dialog-overlay',
		importStatement: "import { ZDialogOverlay } from '@zadmin/zui';",
		name: 'ZDialogOverlay',
		bindings: [
			{ description: '挂载期间的真实overlay引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZDialog', 'Portal', 'Presence'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '挂载期间的真实overlay引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/compound/dialog/ZDialogOverlay.svelte',
		states: [
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: '解析后的减少动画状态。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'stable',
		summary: 'Portal挂载并与Dialog Presence同步的modal遮罩。'
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
	import { stylePresenceEasing } from '../../../runtime/foundation/style-presence.js';
	import { portal } from '../../../runtime/layer/portal.js';
	import { useZDialog } from './context.svelte.js';

	let {
		class: className,
		ontransitionend,
		ref = $bindable(null),
		style,
		...rest
	}: ZDialogOverlayProps = $props();
	const zui = useZui();
	const dialog = useZDialog();
	const initiallyOpen = untrack(() => dialog.open);
	const presence = createPresence(initiallyOpen);
	const mounted = $derived(presence.mounted);
	const presenceState = $derived(presence.state);
	const rootClass = $derived(
		zui.recipe(overlayRecipe, {
			motion: dialog.reducedMotion ? 'reduced' : 'full',
			open: dialog.open
		})
	);
	const presenceEasingClass = $derived(zui.icss(stylePresenceEasing));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	$effect(() =>
		presence.update(
			dialog.open,
			dialog.exitDuration,
			dialog.ownerWindow ?? ref?.ownerDocument.defaultView
		)
	);
	$effect(() => {
		dialog.setOverlay(ref);
		return () => {
			if (dialog.overlay === ref) dialog.setOverlay(null);
		};
	});
	function handleTransitionEnd(event: TransitionEvent & { currentTarget: HTMLDivElement }): void {
		if (event.target === event.currentTarget) presence.finishExit();
		ontransitionend?.(event);
	}
	onDestroy(() => presence.destroy());
</script>

{#if mounted}
	<div
		{...rest}
		bind:this={ref}
		class={[rootClass, presenceEasingClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		use:portal={{ target: dialog.portalTarget }}
		aria-hidden="true"
		data-presence={presenceState}
		data-reduced-motion={dialog.reducedMotion || undefined}
		data-state={dialog.open ? 'open' : 'closed'}
		ontransitionend={handleTransitionEnd}
	></div>
{/if}
