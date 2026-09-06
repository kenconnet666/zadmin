<script module lang="ts">
	import { defineRecipe, extendTheme } from '@zadmin/zui';
	const itemRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.borderRadius._medium;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.padding._medium;
				s.overflowWrap.anywhere;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZContainer, ZGrid, ZGridItem, ZProvider, ZText, useZui } from '@zadmin/zui';

	const zui = useZui();
	const gridTheme = $derived(
		extendTheme(zui.theme, { breakpoint: { small: '20rem', medium: '32rem', large: '48rem' } })
	);
	const itemClass = $derived(zui.recipe(itemRecipe));
</script>

<ZProvider theme={gridTheme}>
	<ZContainer
		gutter="medium"
		maxWidth="100%"
		queryName="grid-demo"
		style="resize: horizontal; overflow: auto; min-inline-size: 16rem;"
	>
		<ZGrid
			query={{ container: 'grid-demo' }}
			columns={{ base: 1, small: 2, medium: 4, large: 6 }}
			gap="small"
		>
			<ZGridItem class={itemClass} span={{ base: 'full', small: 1, medium: 2, large: 2 }}
				><ZText>容器查询</ZText></ZGridItem
			>
			<ZGridItem class={itemClass} span={{ base: 'full', small: 1, medium: 2, large: 1 }}
				><ZText>inline-size</ZText></ZGridItem
			>
			<ZGridItem class={itemClass} span={{ base: 'full', small: 2, medium: 2, large: 3 }}
				><ZText>small / medium / large</ZText></ZGridItem
			>
		</ZGrid>
	</ZContainer>
</ZProvider>
