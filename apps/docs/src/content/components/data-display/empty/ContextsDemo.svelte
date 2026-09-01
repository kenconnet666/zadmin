<script lang="ts">
	import SearchX from '@lucide/svelte/icons/search-x';
	import { ZEmpty, ZStack } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZEmpty headingLevel={4} title="尚未创建项目">
		{#snippet description()}创建第一个项目后，这里会显示最近活动。{/snippet}
	</ZEmpty>
	<ZEmpty headingLevel={4} title="筛选后没有数据">
		{#snippet icon()}<SearchX aria-hidden="true" size={40} strokeWidth={1.75} />{/snippet}
		{#snippet description()}集合存在数据，但当前关键词没有匹配项。{/snippet}
	</ZEmpty>
	<ZEmpty headingLevel={4} icon={null} title="全部任务已完成">
		{#snippet description()}这是集合已经清空的说明，不需要恢复操作。{/snippet}
	</ZEmpty>
</ZStack>
