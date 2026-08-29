<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const previewRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._primary;
				s.borderRadius._large;
				s.color._canvas;
				s.display.grid;
				s.maxWidth.rem(32);
				s.placeItems.center;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZAspectRatio, useZui } from '@zadmin/zui';

	const zui = useZui();
	const previewClass = $derived(zui.recipe(previewRecipe));
</script>

<ZAspectRatio class={previewClass} ratio="16 / 9">16:9 原生比例区域</ZAspectRatio>
