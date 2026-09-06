<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const itemRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.borderRadius._medium;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.paddingBlock._small;
				s.paddingInline._medium;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZButton,
		ZOverflowList,
		ZPopover,
		ZPopoverContent,
		ZPopoverTrigger,
		ZStack,
		ZText,
		useZui
	} from '@zadmin/zui';

	const items = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月'];
	let open = $state(false);
	const zui = useZui();
	const itemClass = $derived(zui.recipe(itemRecipe));
</script>

<ZStack gap="small">
	<ZText weight="semibold">两行预算与最多七项</ZText>
	<ZOverflowList
		{items}
		itemKey={(item) => item}
		maxRows={2}
		maxVisibleItems={7}
		gap="small"
		rowGap="small"
		suspended={open}
	>
		{#snippet item(item)}
			<div class={itemClass}><ZButton variant="outline">{item}</ZButton></div>
		{/snippet}
		{#snippet overflow(state)}
			<ZPopover bind:open placement="bottom-start">
				<ZPopoverTrigger variant="outline">显示 {state.overflowItems.length} 项</ZPopoverTrigger>
				<ZPopoverContent>
					<ZStack gap="small">
						{#each state.overflowItems as item (item)}<ZButton variant="ghost">{item}</ZButton
							>{/each}
					</ZStack>
				</ZPopoverContent>
			</ZPopover>
		{/snippet}
	</ZOverflowList>
</ZStack>
