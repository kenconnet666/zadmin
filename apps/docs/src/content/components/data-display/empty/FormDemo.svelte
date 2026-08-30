<script lang="ts">
	import { ZButton, ZEmpty } from '@zadmin/zui';
</script>

<ZEmpty title="没有发布记录" headingLevel={4}>
	{#snippet icon()}<span aria-hidden="true">◇</span>{/snippet}
	当前筛选条件下没有可显示的发布记录。
	{#snippet actions()}<ZButton>创建首次发布</ZButton><ZButton variant="secondary">清除筛选</ZButton
		>{/snippet}
</ZEmpty>
