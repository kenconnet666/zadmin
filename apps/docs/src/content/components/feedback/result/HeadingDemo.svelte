<script lang="ts">
	import { ZResult, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZResult data-result-context="page" headingLevel={1} title="账户迁移已经完成" tone="success">
		页面级Result可以使用真实h1，但视觉字号继续由内部ZHeading统一管理。
	</ZResult>
	<ZResult
		data-result-context="panel"
		headingLevel={5}
		title="这是一个用于验证窄容器、连续英文标识 release-candidate-with-an-intentionally-long-name 与中文长标题自动换行的面板结果"
		tone="warning"
	>
		正文和操作区都允许在窄容器内换行，不产生文档横向滚动。
	</ZResult>
</ZStack>
