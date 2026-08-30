<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';
	const previewRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.display.grid;
				s.placeItems.center;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZAspectRatio, ZStack, useZui } from '@zadmin/zui';
	const zui = useZui();
	const previewClass = $derived(zui.recipe(previewRecipe));
</script>

<ZStack direction="row" gap="large" wrap>
	<ZAspectRatio class={previewClass} ratio={1}>1:1</ZAspectRatio>
	<ZAspectRatio class={previewClass} ratio="4 / 3">4:3</ZAspectRatio>
	<ZAspectRatio class={previewClass} ratio={1.618}>黄金比例</ZAspectRatio>
</ZStack>
