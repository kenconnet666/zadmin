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
				s.paddingBlock._medium;
				s.paddingInline._medium;
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
</script>

<ZGrid columns={12} gap="small">
	<ZGridItem class={itemClass} span={4} start={1} rowSpan={2}
		><ZText weight="semibold">span=4 / start=1 / rowSpan=2</ZText></ZGridItem
	>
	<ZGridItem class={itemClass} span={8} start={5}><ZText>span=8 / start=5</ZText></ZGridItem>
	<ZGridItem class={itemClass} span={3} start={1}><ZText>span=3 / start=1</ZText></ZGridItem>
	<ZGridItem class={itemClass} span={5} start={4}><ZText>span=5 / start=4</ZText></ZGridItem>
	<ZGridItem class={itemClass} span="full"><ZText>span=full：占满当前可用列</ZText></ZGridItem>
</ZGrid>
