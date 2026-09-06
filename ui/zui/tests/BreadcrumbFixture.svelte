<script lang="ts">
	import ZBreadcrumb from '../src/components/navigation/ZBreadcrumb.svelte';

	const items = [
		{ href: '/workspace', key: 'workspace', label: '工作台' },
		{ href: '/workspace/projects', key: 'projects', label: '项目' },
		{ current: true, key: 'details', label: '交付详情' }
	] as const;

	const longItems = [
		{
			href: '/workspace',
			key: 'long-parent',
			label: '这个具有很长连续内容的路径层级必须在窄容器里自然换行，而不能撑破导航区域'
		},
		{ current: true, key: 'long-current', label: '当前页' }
	] as const;
</script>

<div data-testid="breadcrumb-boundary">
	<ZBreadcrumb aria-label="Fixture breadcrumb" {items} />
</div>
<div data-testid="breadcrumb-long-boundary" style="max-width: 16rem">
	<ZBreadcrumb aria-label="Long breadcrumb" items={longItems} />
</div>
<div dir="rtl" data-testid="breadcrumb-rtl-boundary">
	<ZBreadcrumb aria-label="RTL breadcrumb" {items} />
</div>
