<script lang="ts">
	import ZProvider from '../src/components/gene/ZProvider.svelte';
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

	const collapseItems = [
		{ href: '#breadcrumb-home', key: 'home', label: '首页' },
		{ href: '#breadcrumb-organization', key: 'organization', label: '组织' },
		{ href: '#breadcrumb-projects', key: 'projects', label: '项目' },
		{ current: true, key: 'release', label: '当前发布' },
		{ href: '#breadcrumb-history', key: 'history', label: '历史记录' },
		{ href: '#breadcrumb-latest', key: 'latest', label: '最新构建' }
	] as const;

	const responsiveItems = [
		{ href: '#responsive-home', key: 'responsive-home', label: 'Workspace' },
		{ href: '#responsive-team', key: 'responsive-team', label: 'Production team' },
		{ href: '#responsive-project', key: 'responsive-project', label: 'Release project' },
		{ href: '#responsive-run', key: 'responsive-run', label: 'Deployment run' },
		{ current: true, key: 'responsive-current', label: 'Current details' }
	] as const;
</script>

<div data-testid="breadcrumb-boundary">
	<ZBreadcrumb aria-label="Fixture breadcrumb" {items} />
</div>
<div data-testid="breadcrumb-long-boundary" style="max-width: 16rem">
	<ZBreadcrumb aria-label="Long breadcrumb" items={longItems} />
</div>
<div data-testid="breadcrumb-rtl-boundary">
	<ZBreadcrumb aria-label="RTL breadcrumb" dir="rtl" {items} />
</div>

<div data-testid="breadcrumb-collapse-owner" style="width: min(100%, 40rem)">
	<ZBreadcrumb
		aria-label="Collapsed breadcrumb"
		collapse={{ keepFirst: true, maxItems: 3, maxRows: 1 }}
		items={collapseItems}
	/>
</div>

<div data-testid="breadcrumb-no-first-owner" style="width: min(100%, 40rem)">
	<ZBreadcrumb
		aria-label="Collapsed breadcrumb without first"
		collapse={{ keepFirst: false, maxItems: 2, maxRows: 1 }}
		items={collapseItems}
	/>
</div>

<div data-testid="breadcrumb-responsive-owner" style="width: min(100%, 720px)">
	<ZBreadcrumb aria-label="Responsive breadcrumb" collapse items={responsiveItems} />
</div>

<ZProvider direction="rtl">
	<div data-testid="breadcrumb-collapse-rtl-owner" style="width: min(100%, 18rem)">
		<ZBreadcrumb
			aria-label="Collapsed RTL breadcrumb"
			collapse={{ keepFirst: true, maxItems: 3, maxRows: 1 }}
			items={collapseItems}
		/>
	</div>
	<div data-testid="breadcrumb-ltr-override-owner">
		<ZBreadcrumb aria-label="LTR override breadcrumb" dir="ltr" {items} />
	</div>
</ZProvider>
