<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const tileRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.borderRadius._medium;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.minWidth.px(0);
				s.padding._small;
				s.overflowWrap.anywhere;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZButton,
		ZContainer,
		ZGrid,
		ZGridItem,
		ZProvider,
		ZStack,
		ZText,
		extendTheme,
		useZui
	} from '@zadmin/zui';

	let width = $state(320);
	const zui = useZui();
	const axisTheme = $derived(
		extendTheme(zui.theme, {
			breakpoint: { small: '18.75rem', medium: '31.25rem', large: '40rem' }
		})
	);
	const tileClass = $derived(zui.recipe(tileRecipe));
</script>

<ZProvider theme={axisTheme}>
	<ZStack gap="medium">
		<ZText weight="semibold">命名容器轴向间距覆盖</ZText>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" variant="outline" onclick={() => (width = 320)}>窄 320px</ZButton>
			<ZButton size="small" variant="outline" onclick={() => (width = 640)}>宽 640px</ZButton>
			<ZText tone="muted">500px后共享gap从8变20；rowGap=3、columnGap=5优先。</ZText>
		</ZStack>
		<ZContainer
			gutter="none"
			queryName="grid-axis-demo"
			style={`width: ${width}px; max-width: 100%; resize: horizontal; overflow: auto;`}
		>
			<ZStack
				direction="row"
				wrap
				gap={{ base: 8, medium: 20 }}
				rowGap={3}
				columnGap={{ small: 5 }}
				query={{ container: 'grid-axis-demo' }}
			>
				{#each ['Stack A', 'Stack B', 'Stack C', 'Stack D'] as label (label)}
					<div class={tileClass}><ZText>{label}</ZText></div>
				{/each}
			</ZStack>
			<ZText tone="muted">ZStack：共享gap控制行列，rowGap/columnGap在对应轴覆盖。</ZText>
			<ZGrid
				columns={{ base: 2, medium: 4 }}
				gap={{ base: 8, medium: 20 }}
				rowGap={3}
				columnGap={{ small: 5 }}
				query={{ container: 'grid-axis-demo' }}
			>
				{#each ['Grid A', 'Grid B', 'Grid C', 'Grid D'] as label (label)}
					<ZGridItem class={tileClass}><ZText>{label}</ZText></ZGridItem>
				{/each}
			</ZGrid>
			<ZText tone="muted">ZGrid：同一命名容器断点和轴覆盖，四项跨窄宽度重新排布。</ZText>
		</ZContainer>
	</ZStack>
</ZProvider>
