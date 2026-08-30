<script lang="ts">
	import { ZStack, ZToast } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZToast dismissible={false} title="草稿已保存" tone="info" description="可以安全关闭当前页面。" />
	<ZToast dismissible={false} title="扫描发现风险" tone="warning" description="2个依赖需要升级。" />
	<ZToast
		dismissible={false}
		title="发布被阻断"
		tone="danger"
		description="健康检查连续失败。"
		priority="assertive"
	/>
</ZStack>
