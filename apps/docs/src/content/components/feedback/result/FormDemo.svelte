<script lang="ts">
	import { ZButton, ZResult } from '@zadmin/zui';
</script>

<ZResult title="发布完成" tone="success" headingLevel={4}>
	{#snippet content()}版本v2.4.0已部署到cn-east-1。{/snippet}
	{#snippet actions()}<ZButton>查看发布详情</ZButton><ZButton variant="secondary">返回列表</ZButton
		>{/snippet}
</ZResult>
