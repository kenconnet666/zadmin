<script module lang="ts">
	import { defineRecipe } from '../../../recipes/define.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { NavigationMenuEntry, NavigationMenuContext } from './context.js';
	const groupRecipe = defineRecipe(
		{
			base: (s) => {
				s.display.grid;
				s.gap._xsmall;
				s.minInlineSize.px(0);
			},
			variants: {}
		},
		import.meta
	);
	const labelRecipe = defineRecipe(
		{
			base: (s) => {
				s.color._textMuted;
				s.fontSize._small;
				s.fontWeight._semibold;
				s.paddingInline._small;
				s.paddingBlock._small;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts" generics="TKey extends SelectionKey">
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZSeparator from '../../gene/ZSeparator.svelte';
	import ZVisuallyHidden from '../../gene/ZVisuallyHidden.svelte';
	import ZPopover from '../popover/ZPopover.svelte';
	import NavigationList from './NavigationList.svelte';
	import NavigationRow from './NavigationRow.svelte';
	let {
		menu,
		entry,
		horizontal = false
	}: {
		menu: NavigationMenuContext<TKey>;
		entry: NavigationMenuEntry<TKey>;
		horizontal?: boolean;
	} = $props();
	const zui = useZui();
	const record = $derived(menu.record(entry.key));
	const groupClass = $derived(zui.recipe(groupRecipe));
	const labelClass = $derived(zui.recipe(labelRecipe));
</script>

{#if entry.kind === 'separator'}
	<ZSeparator decorative orientation={horizontal ? 'vertical' : 'horizontal'} />
{:else if entry.kind === 'group'}
	<div
		class={groupClass}
		role="group"
		aria-labelledby={menu.id(entry.key, 'group')}
		data-slot="group"
	>
		{#if menu.compact}<ZVisuallyHidden id={menu.id(entry.key, 'group')}
				>{entry.label}</ZVisuallyHidden
			>
		{:else}<div id={menu.id(entry.key, 'group')} class={labelClass} data-slot="group-label">
				{entry.label}
			</div>{/if}
		<NavigationList {menu} entries={entry.children} {horizontal} />
	</div>
{:else if record.branch && !menu.inline}
	<ZPopover
		open={menu.open(entry.key)}
		onOpenChange={(open) => menu.setExpanded(entry.key, open)}
		triggerId={menu.id(entry.key, 'disclosure')}
		placement={horizontal
			? 'bottom-start'
			: menu.direction === 'rtl'
				? 'left-start'
				: 'right-start'}
	>
		<NavigationRow {menu} {entry} floating />
	</ZPopover>
{:else}
	<NavigationRow {menu} {entry} />
{/if}
