<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';

	import { defineSlotRecipe, registerSlotRecipeHmr } from '../../../recipes/slots.js';

	export interface ZAccordionContentProps extends Omit<
		HTMLAttributes<HTMLDivElement>,
		'aria-hidden' | 'aria-labelledby' | 'children' | 'id' | 'role'
	> {
		readonly children?: Snippet;
		ref?: HTMLDivElement | null;
		readonly region?: boolean;
	}

	const accordionContentRecipe = defineSlotRecipe({
		slots: ['root', 'inner'] as const,
		base: {
			inner: (s) => {
				s.minHeight.px(0);
				s.overflow.hidden;
				s.paddingBottom._large;
			},
			root: (s) => {
				s.display.grid;
				s.transitionDuration._normal;
				s.transitionProperty.raw('grid-template-rows, opacity');
				s.transitionTimingFunction.ease;
			}
		},
		variants: {
			motion: {
				auto: {},
				full: {},
				reduced: { root: (s) => s.transitionDuration.ms(0) }
			},
			open: {
				false: {
					root: (s) => {
						s.gridTemplateRows.raw('0fr');
						s.opacity(0);
					}
				},
				true: {
					root: (s) => {
						s.gridTemplateRows.raw('1fr');
						s.opacity._opaque;
					}
				}
			}
		},
		defaultVariants: { motion: 'auto', open: false }
	});

	registerSlotRecipeHmr(import.meta, accordionContentRecipe);

	export const zuiMetadata = {
		category: 'navigation',
		id: 'accordion-content',
		importStatement: "import { ZAccordionContent } from '@zadmin/zui';",
		name: 'ZAccordionContent',
		bindings: [
			{ description: '挂载期间的真实region引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: ['ZAccordion', 'ZAccordionItem', 'Presence'],
		events: [],
		keyboard: [],
		parts: [{ description: '包裹内容并参与grid折叠。', name: 'inner' }],
		props: [
			{
				default: 'true',
				description: '设置role=region；大量同时展开的轻量面板可关闭以避免landmark泛滥。',
				name: 'region',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '挂载期间的真实region引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [{ description: '展开区域内容。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/accordion/ZAccordionContent.svelte',
		states: [
			{ description: '展开或退出动画状态。', name: 'data-state', values: ['open', 'closed'] },
			{ description: 'Presence生命周期。', name: 'data-presence', values: ['entered', 'exiting'] },
			{
				description: 'Accordion根已解析为减少动画。',
				name: 'data-reduced-motion',
				values: ['true']
			}
		],
		status: 'experimental',
		summary: '在退出动画期间保留DOM并在结束后清理的Accordion region。'
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
	import { useZAccordion, useZAccordionItem } from './context.svelte.js';

	let {
		children,
		class: className,
		ref = $bindable(null),
		region = true,
		style,
		...rest
	}: ZAccordionContentProps = $props();
	const zui = useZui();
	const accordion = useZAccordion();
	const item = useZAccordionItem(accordion.owner);
	const open = $derived(accordion.isOpen(item.value));
	const initiallyOpen = untrack(() => open);
	const presence = createPresence(initiallyOpen);
	const mounted = $derived(presence.mounted);
	const presenceState = $derived(presence.state);
	const classes = $derived(
		zui.slots(accordionContentRecipe, {
			motion: accordion.reducedMotion ? 'reduced' : 'full',
			open
		})
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	$effect.pre(() => {
		const element = ref;
		if (!open && element?.contains(element.ownerDocument.activeElement)) {
			accordion.restoreFocus(item.value);
		}
	});
	$effect(() => {
		presence.update(open, accordion.exitDuration, ref?.ownerDocument.defaultView);
		if (!open && accordion.reducedMotion) presence.finishExit();
	});
	onDestroy(() => presence.destroy());
</script>

{#if mounted}
	<div
		{...rest}
		bind:this={ref}
		class={[classes.root, className]}
		style={initialStyle}
		use:applyIcssRootStyle={{ style, variables: icssVariables }}
		id={accordion.contentId(item.value)}
		role={region ? 'region' : undefined}
		inert={!open}
		aria-labelledby={accordion.triggerId(item.value)}
		data-presence={presenceState}
		data-state={open ? 'open' : 'closed'}
		data-reduced-motion={accordion.reducedMotion || undefined}
		ontransitionend={(event) => {
			if (event.target === event.currentTarget) presence.finishExit();
		}}
	>
		<div class={classes.inner} data-slot="inner">{@render children?.()}</div>
	</div>
{/if}
