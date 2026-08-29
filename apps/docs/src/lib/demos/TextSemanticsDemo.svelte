<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const truncateRecipe = defineRecipe(
		{
			base: (s) => {
				s.display.block;
				s.maxWidth.rem(21);
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZStack, ZText, useZui } from '@zadmin/zui';
	const zui = useZui();
	const truncateClass = $derived(zui.recipe(truncateRecipe));
</script>

<ZStack gap="small">
	<ZText as="strong" size="large">Strong · large</ZText>
	<ZText tone="primary" weight="semibold">Primary semantic text</ZText>
	<ZText tone="muted" size="small">Muted supporting copy</ZText>
	<ZText tone="danger">Danger feedback text</ZText>
	<ZText class={truncateClass} truncate>
		这是一段用于验证truncate行为的较长文本，组件不会改变原生文本元素的语义。
	</ZText>
</ZStack>
