<script lang="ts">
	import SearchX from '@lucide/svelte/icons/search-x';
	import { ZEmpty } from '@zadmin/zui';
</script>

<ZEmpty headingLevel={3} title="没有匹配结果">
	{#snippet icon()}<SearchX aria-hidden="true" size={32} />{/snippet}
	请缩短关键词或清除筛选条件。
</ZEmpty>
