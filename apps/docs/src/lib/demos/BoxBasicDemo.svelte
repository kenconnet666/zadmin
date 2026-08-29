<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const boxRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.borderRadius._large;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.color._text;
				s.padding._large;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZBox, useZui } from '@zadmin/zui';
	const zui = useZui();
	const boxClass = $derived(zui.recipe(boxRecipe));
</script>

<ZBox class={boxClass} data-demo-root="box">
	ZBox保持真实div根元素，并转发class、style、ref与原生HTML属性。
</ZBox>
