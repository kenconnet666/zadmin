<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const contentRecipe = defineRecipe(
		{
			base: (s) => {
				s.display.flex;
				s.gap._large;
				s.padding._medium;
				s.inlineSize.raw('max-content');
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZProvider, ZScrollArea, ZText, type ScrollAreaPosition, useZui } from '@zadmin/zui';

	let position = $state<ScrollAreaPosition>({ left: 0, top: 0 });
	const zui = useZui();
	const contentClass = $derived(zui.recipe(contentRecipe));
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZScrollArea
		aria-label="مساحة تمرير أفقية"
		axis="x"
		height="7rem"
		onScrollPositionChange={(next) => (position = next)}
	>
		<div class={contentClass}>
			<ZText>بداية المسار / بداية</ZText>
			<ZText>workspace-production-release-with-a-long-logical-identifier</ZText>
			<ZText>نهاية المسار / نهاية</ZText>
		</div>
	</ZScrollArea>
	<ZText tone="muted">DOM scrollLeft: {position.left}</ZText>
</ZProvider>
