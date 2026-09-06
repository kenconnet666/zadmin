<script lang="ts">
	import { ZNavLink, ZStack, ZText } from '@zadmin/zui';

	let projectsOpen = $state(false);
	let reportsOpen = $state(false);
</script>

<ZStack gap="small" style="max-width: 100%;">
	<ZText weight="semibold">主链接与子级面板</ZText>
	<ZNavLink
		href="/workspace/projects"
		label="项目"
		expanded={projectsOpen}
		contentId="nav-link-projects-panel"
		onExpandedChange={(next) => (projectsOpen = next)}
	/>
	{#if projectsOpen}
		<div id="nav-link-projects-panel" role="region" aria-label="项目子级">
			<ZNavLink href="/workspace/projects/active" label="进行中项目" />
			<ZNavLink href="/workspace/projects/archive" label="归档项目" />
		</div>
	{/if}
	<ZNavLink
		label="报表"
		expanded={reportsOpen}
		contentId="nav-link-reports-panel"
		onExpandedChange={(next) => (reportsOpen = next)}
	/>
	{#if reportsOpen}
		<div id="nav-link-reports-panel" role="region" aria-label="报表子级">
			<ZNavLink href="/reports/daily" label="日报" />
			<ZNavLink href="/reports/monthly" label="月报" />
		</div>
	{/if}
	<ZText tone="muted">有href时anchor与disclosure并列；无href时主元素本身是展开button。</ZText>
</ZStack>
