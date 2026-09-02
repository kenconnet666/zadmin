<script lang="ts">
	import { ZBox, ZProvider, ZStack, ZTag, ZText } from '@zadmin/zui';
</script>

<ZProvider contrast="high" direction="rtl">
	<ZBox style="max-width: 20rem;">
		<ZStack gap="medium">
			<ZTag tone="warning">production-release-candidate-with-an-extremely-long-identifier</ZTag>
			<ZTag tone="danger">حالة النشر الحرجة تحتاج إلى مراجعة طويلة</ZTag>
			<ZText tone="muted">长CJK/标识符安全换行；RTL使用逻辑间距，状态仍有边框。</ZText>
		</ZStack>
	</ZBox>
</ZProvider>
