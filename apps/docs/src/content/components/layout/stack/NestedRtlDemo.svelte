<script lang="ts">
	import { ZProvider, ZStack, ZTag, ZText } from '@zadmin/zui';
</script>

<ZProvider direction="rtl">
	<ZStack gap="large">
		<ZStack align="center" direction="row" gap="medium" justify="between">
			<ZText weight="semibold">حالة النشر / 发布状态</ZText>
			<ZTag tone="success">جاهز / 就绪</ZTag>
		</ZStack>
		<ZStack align="start" gap="small">
			<ZText>第一条DOM内容</ZText>
			<ZText tone="muted">第二条DOM内容；RTL只改变逻辑起点，不改阅读顺序。</ZText>
		</ZStack>
	</ZStack>
</ZProvider>
