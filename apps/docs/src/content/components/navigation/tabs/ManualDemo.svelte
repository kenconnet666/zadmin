<script lang="ts">
	import { ZTabs, ZTabsList, ZTabsPanel, ZTabsTrigger, ZText } from '@zadmin/zui';
</script>

<ZTabs activationMode="manual" defaultValue="summary" loop={false} orientation="vertical">
	<ZTabsList aria-label="手动激活的垂直设置页">
		<ZTabsTrigger value="summary">摘要</ZTabsTrigger>
		<ZTabsTrigger value="security">安全</ZTabsTrigger>
		<ZTabsTrigger value="audit">审计</ZTabsTrigger>
	</ZTabsList>
	<ZTabsPanel value="summary"><ZText>方向键只移动焦点，Enter或Space才激活。</ZText></ZTabsPanel>
	<ZTabsPanel value="security"><ZText>安全配置。</ZText></ZTabsPanel>
	<ZTabsPanel value="audit"><ZText>审计配置。</ZText></ZTabsPanel>
</ZTabs>
