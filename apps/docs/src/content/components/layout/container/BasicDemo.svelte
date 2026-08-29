<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const contentRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.borderRadius._large;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.padding._large;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZContainer, useZui } from '@zadmin/zui';

	const zui = useZui();
	const contentClass = $derived(zui.recipe(contentRecipe));
</script>

<ZContainer class={contentClass} gutter="large" size="small">
	内容保持居中、有限宽度，并使用逻辑内联留白适配LTR与RTL。
</ZContainer>
