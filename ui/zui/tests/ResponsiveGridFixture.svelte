<script module lang="ts">
	import { defaultTheme } from '../src/theme/default.js';
	import { extendTheme } from '../src/theme/define.js';
	const theme = extendTheme(defaultTheme, {
		breakpoint: { small: '18.75rem', medium: '31.25rem', large: '43.75rem' }
	});
</script>

<script lang="ts">
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZContainer from '../src/components/layout/ZContainer.svelte';
	import ZGrid from '../src/components/layout/ZGrid.svelte';
	import ZGridItem from '../src/components/layout/ZGridItem.svelte';
	import ZStack from '../src/components/layout/ZStack.svelte';
	let wide = $state(false);
</script>

<button type="button" data-testid="resize-grid" onclick={() => (wide = !wide)}>Resize layout</button
>
<ZProvider {theme}>
	<ZContainer
		queryName="layout-contract"
		size="full"
		gutter="none"
		style={`width: ${wide ? 640 : 320}px`}
		data-testid="query-container"
	>
		<ZGrid
			columns={{ base: 1, small: 4, medium: 8 }}
			gap={8}
			query={{ container: 'layout-contract' }}
			data-testid="responsive-grid"
		>
			<ZGridItem span={{ base: 6, medium: 3 }} data-testid="clamped-span">First</ZGridItem>
			<ZGridItem span={2} start={4} data-testid="clamped-start">Second</ZGridItem>
			<ZGridItem span="full" data-testid="full-span">Full row</ZGridItem>
		</ZGrid>
		<ZStack
			direction={{ base: 'column', small: 'row' }}
			gap={{ base: 8, medium: 20 }}
			rowGap={3}
			columnGap={{ small: 5 }}
			query={{ container: 'layout-contract' }}
			data-testid="responsive-stack"><span>One</span><span>Two</span></ZStack
		>
	</ZContainer>
</ZProvider>
