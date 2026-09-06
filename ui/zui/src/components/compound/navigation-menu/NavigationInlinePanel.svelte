<script module lang="ts">
	import type { Snippet } from 'svelte';
	import { defineSlotRecipe } from '../../../recipes/slots.js';
	const recipe = defineSlotRecipe(
		{
			slots: ['root', 'inner'] as const,
			base: {
				root: (s) => {
					s.display.grid;
					s.gridTemplateRows.raw('0fr');
					s.opacity(0);
					s.transitionProperty.raw('grid-template-rows, opacity');
					s.transitionDuration._fast;
					s.transitionTimingFunction._standard;
				},
				inner: (s) => {
					s.minBlockSize.px(0);
					s.minInlineSize.px(0);
					s.overflow.hidden;
					s.paddingInlineStart._large;
				}
			},
			variants: {
				open: {
					true: {
						root: (s) => {
							s.gridTemplateRows.raw('1fr');
							s.opacity._opaque;
						}
					},
					false: {}
				},
				reduced: { true: { root: (s) => s.transitionDuration.ms(0) }, false: {} }
			}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { ReducedMotionState } from '../../../runtime/foundation/motion.svelte.js';
	import {
		createPresence,
		durationMilliseconds
	} from '../../../runtime/foundation/presence.svelte.js';
	import { PresenceEntryMotion } from '../../../runtime/foundation/presence-entry-motion.svelte.js';
	let {
		children,
		open,
		id,
		beforeClose,
		ref = $bindable(null)
	}: {
		children?: Snippet;
		open: boolean;
		id: string;
		beforeClose: (node: HTMLElement | null) => void;
		ref?: HTMLDivElement | null;
	} = $props();
	const zui = useZui();
	const initial = untrack(() => open);
	const presence = createPresence(initial);
	const entryMotion = new PresenceEntryMotion(initial);
	const reduced = new ReducedMotionState(() => zui.motion);
	const classes = $derived(
		zui.slots(recipe, { open: open && entryMotion.entered, reduced: reduced.current })
	);
	$effect(() => reduced.connect(ref?.ownerDocument.defaultView));
	$effect.pre(() => {
		if (!open) beforeClose(ref);
	});
	$effect(() => entryMotion.update(open, reduced.current, ref));
	$effect(() => {
		presence.update(
			open,
			reduced.current ? 0 : durationMilliseconds(zui.theme.duration.fast),
			ref?.ownerDocument.defaultView
		);
		if (!open && reduced.current) presence.finishExit();
	});
	onDestroy(() => {
		presence.destroy();
		entryMotion.destroy();
	});
</script>

{#if presence.mounted}
	<div
		{id}
		bind:this={ref}
		class={classes.root}
		inert={!open}
		data-state={open ? 'open' : 'closed'}
		data-slot="panel"
		ontransitionend={(event) => {
			if (event.target === event.currentTarget) presence.finishExit();
		}}
	>
		<div class={classes.inner}>{@render children?.()}</div>
	</div>
{/if}
