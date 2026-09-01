<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const widthRecipe = defineRecipe(
		{
			base: (s) => {
				s.display.block;
				s.maxWidth.rem(22);
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZStack, ZText, useZui } from '@zadmin/zui';
	const zui = useZui();
	const widthClass = $derived(zui.recipe(widthRecipe));
</script>

<ZStack gap="medium">
	<ZText class={widthClass} truncate title="完整单行部署描述">
		单行truncate要求调用方提供可收缩宽度，并保留原生title作为完整文本入口。
	</ZText>
	<ZText as="p" class={widthClass} lineClamp={3}>
		多行lineClamp适合卡片摘要。它保留真实段落语义，只限制视觉呈现行数，不向辅助技术伪造被裁剪的文本，也不自动添加交互式展开控件。
	</ZText>
</ZStack>
