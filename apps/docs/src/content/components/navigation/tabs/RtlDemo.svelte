<script lang="ts">
	import { ZProvider, ZTabs, ZTabsList, ZTabsPanel, ZTabsTrigger, ZText } from '@zadmin/zui';
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZTabs activationMode="manual" defaultValue="summary">
		<ZTabsList aria-label="علامات تبويب يدوية">
			<ZTabsTrigger value="summary">الملخص</ZTabsTrigger>
			<ZTabsTrigger value="security">الأمان</ZTabsTrigger>
			<ZTabsTrigger value="audit">التدقيق</ZTabsTrigger>
		</ZTabsList>
		<ZTabsPanel value="summary"><ZText>ArrowRight按RTL逻辑移动到前一个视觉Tab。</ZText></ZTabsPanel>
		<ZTabsPanel value="security">安全设置</ZTabsPanel>
		<ZTabsPanel value="audit">审计设置</ZTabsPanel>
	</ZTabs>
</ZProvider>
