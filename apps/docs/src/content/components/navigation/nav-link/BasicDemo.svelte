<script lang="ts">
	import { ZNavLink, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="small" style="max-width: 100%;">
	<ZText weight="semibold">工作区导航</ZText>
	<ZNavLink href="/workspace" label="工作台" />
	<ZNavLink href="/workspace/projects" label="项目" active />
	<ZNavLink href="/workspace/settings" label="设置" disabled />
	<ZText tone="muted">active只表达当前页；disabled链接仍显示但不产生导航。</ZText>
</ZStack>
