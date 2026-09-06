<script lang="ts">
	import { ZBreadcrumb, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{ href: '/workspace', key: 'workspace', label: '工作台' },
		{ href: '/workspace/projects', key: 'projects', label: '项目' },
		{ current: true, key: 'details', label: '交付详情' }
	] as const;
</script>

<ZStack gap="small">
	<ZText tone="muted">路由层级由页面 owner 提供；组件只呈现语义和链接。</ZText>
	<ZBreadcrumb aria-label="当前位置" {items} />
</ZStack>
