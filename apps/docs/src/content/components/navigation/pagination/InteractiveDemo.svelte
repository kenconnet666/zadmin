<script lang="ts">
	import { ZButton, ZPagination, ZStack, ZText } from '@zadmin/zui';

	let page = $state(6);
	let changes = $state(0);
	let totalPages = $state(42);
</script>

<ZStack gap="medium">
	<ZPagination
		bind:page
		data-testid="pagination"
		defaultPage={6}
		onPageChange={() => (changes += 1)}
		{totalPages}
	/>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="secondary" onclick={() => (page = 40)}>外部跳到第40页</ZButton>
		<ZButton size="small" variant="secondary" onclick={() => (totalPages = 12)}>
			收缩为12页
		</ZButton>
		<ZButton size="small" variant="ghost" onclick={() => (totalPages = 42)}>恢复42页</ZButton>
	</ZStack>
	<ZText tone="muted">page = {page} / {totalPages} · 用户变更次数 = {changes}</ZText>
</ZStack>
