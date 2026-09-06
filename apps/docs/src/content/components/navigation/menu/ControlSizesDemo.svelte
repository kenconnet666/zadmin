<script lang="ts">
	import { controlSizes, ZStack, ZText, ZMenu, ZMenuItem, ZMenuCheckboxItem } from '@zadmin/zui';
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small"
			><ZText size="small">{size}</ZText><ZMenu {size} aria-label={size + ' 菜单'}
				><ZMenuItem value="open">打开项目</ZMenuItem><ZMenuCheckboxItem
					value="notify"
					defaultChecked>接收通知</ZMenuCheckboxItem
				><ZMenuItem value="locked" disabled>不可用操作</ZMenuItem></ZMenu
			></ZStack
		>
	{/each}
</ZStack>
