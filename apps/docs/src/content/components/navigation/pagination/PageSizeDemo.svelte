<script lang="ts">
	import { ZPagination, ZStack, ZText } from '@zadmin/zui';

	let page = $state(6);
	let pageSize = $state(10);
	let pageChanges = $state(0);
	let sizeChanges = $state(0);
	const totalItems = 96;
</script>

<ZStack gap="medium">
	<ZPagination
		bind:page
		bind:pageSize
		aria-label="订单结果分页"
		onPageChange={() => (pageChanges += 1)}
		onPageSizeChange={() => (sizeChanges += 1)}
		pageSizeOptions={[10, 20, 50]}
		{totalItems}
	/>
	<ZText aria-live="polite" tone="muted">
		共{totalItems}条 · page = {page} · pageSize = {pageSize} · 页码回调{pageChanges}次 · 页尺寸回调{sizeChanges}次
	</ZText>
	<ZText tone="muted">
		切换到50条/页时，当前第6页会夹紧到第2页；两个用户来源分别触发一次回调。
	</ZText>
</ZStack>
