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
				s.minHeight.rem(4);
				s.padding._medium;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZGrid, ZGridItem, ZText, useZui } from '@zadmin/zui';

	const zui = useZui();
	const itemClass = $derived(zui.recipe(itemRecipe));
	const items = ['导航', '主内容', '侧栏', '活动', '审计', '设置'];
</script>

<ZGrid columns={{ base: 1, small: 2, medium: 4, large: 6 }} gap="small">
	{#each items as item, index (item)}
		<ZGridItem
			class={itemClass}
			span={{
				base: 'full',
				small: index === 1 ? 2 : 1,
				medium: index === 1 ? 2 : 1,
				large: index === 1 ? 3 : 1
			}}
		>
			<ZText>{item}</ZText>
		</ZGridItem>
	{/each}
</ZGrid>
