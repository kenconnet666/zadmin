<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const surfaceRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._canvas;
				s.borderColor._border;
				s.borderRadius._large;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.maxWidth.rem(32);
				s.padding._large;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZBox, ZButton, ZHeading, ZStack, ZText, useZui } from '@zadmin/zui';

	const zui = useZui();
	const surfaceClass = $derived(zui.recipe(surfaceRecipe));
</script>

<ZBox class={surfaceClass} data-surface="release-summary">
	<ZStack gap="medium">
		<ZHeading level={4}>发布摘要</ZHeading>
		<ZText tone="muted">ZBox只提供真实div边界；标题、布局、文字和操作继续由各自组件拥有。</ZText>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small">查看发布</ZButton>
			<ZButton size="small" variant="secondary">复制版本</ZButton>
		</ZStack>
	</ZStack>
</ZBox>
