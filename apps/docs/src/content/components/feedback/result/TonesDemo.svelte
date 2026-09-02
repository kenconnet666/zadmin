<script lang="ts">
	import { ZResult, ZStack } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZResult headingLevel={4} title="等待审批" tone="info">审批完成后会自动继续发布。</ZResult>
	<ZResult headingLevel={4} title="生产门禁已通过" tone="success">所有生产门禁均已通过。</ZResult>
	<ZResult headingLevel={4} title="需要复核" tone="warning">配置差异需要人工确认。</ZResult>
	<ZResult headingLevel={4} title="无法继续" tone="danger">请修复阻断项后重新运行门禁。</ZResult>
</ZStack>
