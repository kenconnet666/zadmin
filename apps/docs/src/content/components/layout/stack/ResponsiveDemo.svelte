<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const itemRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.borderRadius._medium;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.paddingBlock._medium;
				s.paddingInline._large;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZStack, ZText, useZui } from '@zadmin/zui';

	const zui = useZui();
	const itemClass = $derived(zui.recipe(itemRecipe));
</script>

<ZStack gap="medium">
	<ZText tone="muted">小屏纵向排列，中屏起切换为横向并允许换行；布局由CSS断点完成。</ZText>
	<ZStack
		align={{ base: 'stretch', medium: 'center' }}
		direction={{ base: 'column', medium: 'row' }}
		gap={{ base: 'small', small: 'medium', large: 'large' }}
		wrap={{ base: false, medium: true }}
	>
		{#each ['基础信息', '权限范围', '通知设置', '审计记录'] as item (item)}
			<div class={itemClass}>
				<ZText>{item}</ZText>
			</div>
		{/each}
	</ZStack>
</ZStack>
