<script lang="ts">
	import { ZAppShell, ZButton, ZCard, ZGroup, ZStack, ZText } from '@zadmin/zui';
	import AppShellRegion from './AppShellRegion.svelte';

	const activity = [
		'发布完成',
		'访问权限已更新',
		'数据同步成功',
		'待处理审批已分派',
		'预算草稿等待复核',
		'成员权限变更已记录',
		'新环境部署已完成',
		'审计导出已就绪'
	];
	const navbarCollapsed = { base: true, medium: false } as const;
	const asideCollapsed = { base: true, large: false } as const;
</script>

{#snippet header()}
	<AppShellRegion fill>
		<ZGroup justify="between">
			<ZText weight="semibold">ZAdmin Workspace</ZText>
			<ZButton size="small">新建项目</ZButton>
		</ZGroup>
	</AppShellRegion>
{/snippet}
{#snippet navbar()}
	<AppShellRegion fill>
		<ZStack gap="small"
			><ZText weight="semibold">工作区</ZText><ZText>概览</ZText><ZText>项目</ZText><ZText
				>成员</ZText
			></ZStack
		>
	</AppShellRegion>
{/snippet}
{#snippet aside()}
	<AppShellRegion fill
		><ZStack gap="small"
			><ZText weight="semibold">活动</ZText><ZText tone="muted">4 条未读更新</ZText></ZStack
		></AppShellRegion
	>
{/snippet}
{#snippet footer()}
	<AppShellRegion fill><ZText size="small" tone="muted">所有更改已同步</ZText></AppShellRegion>
{/snippet}

<ZAppShell
	{aside}
	{footer}
	{header}
	{navbar}
	{asideCollapsed}
	asideLabel="桌面活动"
	asideWidth="15rem"
	headerHeight="3.5rem"
	mainAs="div"
	{navbarCollapsed}
	navbarLabel="桌面工作区主导航"
	navbarWidth="12rem"
	style="height: 28rem"
>
	<AppShellRegion fill>
		<ZStack gap="medium">
			<h2>项目概览</h2>
			{#each activity as item (item)}
				<ZCard bodyPadding="small" variant="outlined"><ZText>{item}</ZText></ZCard>
			{/each}
		</ZStack>
	</AppShellRegion>
</ZAppShell>
