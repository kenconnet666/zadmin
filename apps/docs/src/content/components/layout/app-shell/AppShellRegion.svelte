<script module lang="ts">
	import type { Snippet } from 'svelte';
	import { defineRecipe } from '@zadmin/zui';

	const regionRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.boxSizing.borderBox;
				s.color._text;
				s.minBlockSize.px(0);
				s.minInlineSize.px(0);
				s.padding._medium;
			},
			variants: {
				fill: {
					false: () => undefined,
					true: (s) => {
						s.minBlockSize.percent(100);
					}
				}
			},
			defaultVariants: { fill: false }
		},
		import.meta
	);
</script>

<script lang="ts">
	import { useZui } from '@zadmin/zui';

	let { children, fill = false }: { readonly children?: Snippet; readonly fill?: boolean } =
		$props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(regionRecipe, { fill }));
</script>

<div class={rootClass}>{@render children?.()}</div>
