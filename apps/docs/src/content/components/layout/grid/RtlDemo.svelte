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
				s.overflowWrap.anywhere;
				s.padding._medium;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZGrid, ZGridItem, ZProvider, ZText, useZui } from '@zadmin/zui';

	const zui = useZui();
	const itemClass = $derived(zui.recipe(itemRecipe));
</script>

<ZProvider direction="rtl">
	<ZGrid columns={12} gap="small">
		<ZGridItem class={itemClass} span={4} start={1}>
			<ZText weight="semibold">逻辑起始列 1</ZText>
			<ZText tone="muted">RTL只改变视觉方向，不改变这个DOM项的阅读顺序。</ZText>
		</ZGridItem>
		<ZGridItem class={itemClass} span={8} start={5}>
			<ZText>
				long-content-demo-with-a-logical-grid-placement-and-a-deliberately-long-token-that-must-wrap-inside-the-grid-item
			</ZText>
		</ZGridItem>
		<ZGridItem class={itemClass} span="full">
			<ZText>中文与 English mixed content 仍然按真实可用宽度换行，不通过截断或横向隐藏处理。</ZText>
		</ZGridItem>
	</ZGrid>
</ZProvider>
