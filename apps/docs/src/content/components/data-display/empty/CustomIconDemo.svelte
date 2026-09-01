<script lang="ts">
	import PackageOpen from '@lucide/svelte/icons/package-open';
	import { ZButton, ZEmpty } from '@zadmin/zui';
</script>

<ZEmpty data-empty-kind="artifact" headingLevel={3} title="还没有发布制品">
	{#snippet icon()}<PackageOpen aria-hidden="true" size={44} strokeWidth={1.75} />{/snippet}
	{#snippet description()}
		完成一次构建后，制品、校验摘要与下载入口会出现在这个集合中。
	{/snippet}
	{#snippet actions()}<ZButton>创建构建</ZButton>{/snippet}
</ZEmpty>
