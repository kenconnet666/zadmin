<script lang="ts">
	import { ZButton, ZResult, ZStack, ZText } from '@zadmin/zui';
</script>

<ZResult contentAlign="start" headingLevel={3} title="提交失败" tone="danger">
	{#snippet content()}
		<ZStack gap="small">
			<ZText>以下字段仍需修正，已通过的内容会保留：</ZText>
			<ZText tone="danger">· 生产域名尚未通过所有权验证</ZText>
			<ZText tone="danger">· 回滚联系人缺少值班电话</ZText>
			<ZText tone="muted">
				这是操作处理结果与详细修复上下文，不是集合无数据，也不会自行创建live region。
			</ZText>
		</ZStack>
	{/snippet}
	{#snippet actions()}
		<ZButton>返回修正</ZButton>
		<ZButton variant="secondary">下载错误报告</ZButton>
	{/snippet}
</ZResult>
