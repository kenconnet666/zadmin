<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';
	const recipe = defineRecipe(
		{
			layer: 'utilities',
			base: (s) => {
				s.maxInlineSize.percent(100);
				s.minInlineSize.px(0);
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useZui, ZCopyButton, ZStack } from '@zadmin/zui';
	let { children, source, title }: { children?: Snippet; source: string; title: string } = $props();
	const zui = useZui();
	const rootClass = $derived(zui.recipe(recipe));
</script>

<ZStack
	class={rootClass}
	align="center"
	direction="row"
	gap="small"
	wrap
	data-testid="doc-source-actions"
>
	<ZCopyButton
		value={source}
		label="复制源码"
		copyingLabel="复制源码"
		copiedLabel="已复制"
		errorLabel="复制失败"
		successMessage={'已复制' + title + '源码。'}
		errorMessage="复制失败，请重试。"
		data-testid="copy-demo-source"
		size="medium"
		variant="ghost"
	/>
	{@render children?.()}
</ZStack>
