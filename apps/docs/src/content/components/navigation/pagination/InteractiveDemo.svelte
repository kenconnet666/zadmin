<script lang="ts">
	import { ZPagination, ZText } from '@zadmin/zui';

	let page = $state(6);
	let changes = $state(0);
</script>

<ZPagination
	bind:page
	data-testid="pagination"
	defaultPage={6}
	onPageChange={() => (changes += 1)}
	totalPages={42}
/>
<ZText tone="muted">page = {page} · 用户变更次数 = {changes}</ZText>
