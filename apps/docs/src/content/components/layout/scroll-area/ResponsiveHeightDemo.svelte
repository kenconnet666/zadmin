<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const contentRecipe = defineRecipe(
		{
			base: (s) => {
				s.display.grid;
				s.gap._small;
				s.padding._medium;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZScrollArea, ZText, useZui } from '@zadmin/zui';

	const zui = useZui();
	const contentClass = $derived(zui.recipe(contentRecipe));
</script>

<ZScrollArea
	aria-label="响应式消息"
	minHeight={{ base: '5rem', medium: '7rem' }}
	maxHeight={{ base: '9rem', medium: '14rem' }}
	query="viewport"
>
	<div class={contentClass}>
		<ZText>内容较少时区域保持自然高度范围。</ZText>
		{#each Array.from({ length: 10 }, (_, index) => index + 1) as item (item)}
			<ZText tone="muted">消息记录 {item}：超过maxHeight后出现原生滚动。</ZText>
		{/each}
	</div>
</ZScrollArea>
