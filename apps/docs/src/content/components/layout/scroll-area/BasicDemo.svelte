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
	const entries = Array.from({ length: 12 }, (_, index) => `审计事件 ${index + 1}`);
</script>

<ZScrollArea aria-label="审计事件" height="12rem" scrollbarGutter="stable">
	<div class={contentClass}>
		{#each entries as entry (entry)}
			<ZText>{entry}</ZText>
		{/each}
	</div>
</ZScrollArea>
