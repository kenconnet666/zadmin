<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const wideRecipe = defineRecipe(
		{
			base: (s) => {
				s.display.grid;
				s.gap._medium;
				s.gridAutoFlow.column;
				s.gridAutoColumns.rem(12);
				s.width.maxContent;
				s.padding._medium;
			},
			variants: {
				matrix: {
					false: (s) => s.gridTemplateRows.none,
					true: (s) => s.gridTemplateRows.raw('repeat(4, minmax(3rem, auto))')
				}
			},
			defaultVariants: { matrix: false }
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZScrollArea, ZText, useZui } from '@zadmin/zui';

	const zui = useZui();
	const wideClass = $derived(zui.recipe(wideRecipe));
	const matrixClass = $derived(zui.recipe(wideRecipe, { matrix: true }));
</script>

<div>
	<ZText weight="semibold">axis=x</ZText>
	<ZScrollArea aria-label="横向时间线" axis="x" height="8rem" scrollbarStyle="native">
		<div class={wideClass}>
			{#each ['一月', '二月', '三月', '四月', '五月', '六月'] as month (month)}
				<ZText>{month} · 横向内容</ZText>
			{/each}
		</div>
	</ZScrollArea>

	<ZText weight="semibold">axis=both</ZText>
	<ZScrollArea
		aria-label="二维数据画布"
		axis="both"
		height="10rem"
		scrollbarGutter="stable both-edges"
	>
		<div class={matrixClass}>
			{#each Array.from({ length: 24 }, (_, index) => index + 1) as cell (cell)}
				<ZText>单元格 {cell}</ZText>
			{/each}
		</div>
	</ZScrollArea>
</div>
