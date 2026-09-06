<script module lang="ts">
	import { defineRecipe } from '../../../recipes/define.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { NavigationMenuEntry, NavigationMenuContext } from './context.js';
	const recipe = defineRecipe(
		{
			base: (s) => {
				s.display.flex;
				s.flexDirection.column;
				s.gap._xsmall;
				s.listStyleType.none;
				s.margin.px(0);
				s.padding.px(0);
				s.minInlineSize.px(0);
				s._selector('&[data-axis="horizontal"]', (s) => {
					s.flexDirection.row;
					s.flexWrap.wrap;
					s.alignItems.start;
				});
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts" generics="TKey extends SelectionKey">
	import { useZui } from '../../../runtime/foundation/context.js';
	import NavigationNode from './NavigationNode.svelte';
	let {
		menu,
		entries,
		horizontal = false
	}: {
		menu: NavigationMenuContext<TKey>;
		entries: readonly NavigationMenuEntry<TKey>[];
		horizontal?: boolean;
	} = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(recipe));
</script>

<ul
	class={rootClass}
	role="list"
	dir={menu.direction}
	data-axis={horizontal ? 'horizontal' : 'vertical'}
	data-slot="list"
>
	{#each entries as entry (entry.key)}
		<li data-slot="item" data-key={String(entry.key)} data-key-type={typeof entry.key}>
			<NavigationNode {menu} {entry} {horizontal} />
		</li>
	{/each}
</ul>
