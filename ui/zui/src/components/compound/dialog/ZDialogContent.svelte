<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

	export interface ZDialogContentProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'aria-describedby' | 'aria-labelledby' | 'children' | 'id' | 'role'
	> {
		readonly children?: Snippet;
		ref?: HTMLDivElement | null;
	}
	const contentRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderRadius._large;
			s.borderStyle.solid;
			s.borderWidth._hairline;
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
		events: [],
		keyboard: [
			{ description: '关闭最顶层Dialog。', key: 'Escape' },
			{ description: '在Dialog内循环焦点。', key: 'Tab / Shift+Tab' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'null',
				description: '挂载期间的真实dialog引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: '0.3.0',
		snippets: [
			{ description: 'Title、Description、业务内容与Close。', name: 'children', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/dialog/ZDialogContent.svelte',
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: 'modal Portal中统一管理top layer、focus trap、scroll、inert与Presence的Dialog内容。'
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
		children,
		class: className,
		ref = $bindable(null),
		style,
		...rest
	}: ZDialogContentProps = $props();
	const zui = useZui();
	const dialog = useZDialog();
	const initiallyOpen = untrack(() => dialog.open);
	const presence = createPresence(initiallyOpen);
	const mounted = $derived(presence.mounted);
	const presenceState = $derived(presence.state);
	const rootClass = $derived(zui.recipe(contentRecipe, { motion: zui.motion, open: dialog.open }));
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	$effect(() => presence.update(dialog.open, dialog.exitDuration));
	$effect(() => {
		const content = ref;
		if (!dialog.open || !content) return;
		const dismissable = new DismissableLayer(content, {
			modal: () => true,
			onDismiss: () => dialog.setOpen(false)
		});
		const focusScope = new FocusScope(content, { restoreFocus: true, trap: true });
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
	<div
		{...rest}
		bind:this={ref}
		class={[rootClass, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		use:portal={{ target: dialog.portalTarget }}
		id={dialog.contentId}
		role="dialog"
		tabindex={-1}
		inert={!dialog.open}
		aria-modal="true"
		aria-hidden={!dialog.open}
		aria-labelledby={dialog.titleId}
		aria-describedby={dialog.descriptionId}
		data-presence={presenceState}
		data-state={dialog.open ? 'open' : 'closed'}
		ontransitionend={(event) => {
			if (event.target === event.currentTarget) presence.finishExit();
		}}
	>
		{@render children?.()}
	</div>
{/if}
