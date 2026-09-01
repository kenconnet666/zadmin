<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';
	const mediaRecipe = defineRecipe(
		{
			base: (s) => {
				s.height.percent(100);
				s.objectFit.cover;
				s.width.percent(100);
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZAspectRatio, ZStack, useZui } from '@zadmin/zui';
	const zui = useZui();
	const mediaClass = $derived(zui.recipe(mediaRecipe));
</script>

<ZStack direction="row" gap="large" wrap>
	<ZAspectRatio ratio="1 / 1"
		><img alt="ZUI品牌" class={mediaClass} src="/favicon.svg" /></ZAspectRatio
	>
	<ZAspectRatio ratio="16 / 9"
		><video aria-label="无源视频占位" class={mediaClass} controls></video></ZAspectRatio
	>
</ZStack>
