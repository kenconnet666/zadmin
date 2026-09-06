<script lang="ts">
	import { ZAppShell, ZStack, ZText } from '@zadmin/zui';
	import AppShellRegion from './AppShellRegion.svelte';

	const navbarCollapsed = { base: true, medium: false } as const;
	const asideCollapsed = { base: true, large: false } as const;
</script>

{#snippet header()}
	<AppShellRegion fill><ZText weight="semibold">响应式工作台</ZText></AppShellRegion>
{/snippet}
{#snippet navbar()}
	<AppShellRegion fill><ZText>桌面导航</ZText></AppShellRegion>
{/snippet}
{#snippet aside()}
	<AppShellRegion fill><ZText>宽屏辅助区</ZText></AppShellRegion>
{/snippet}

<ZAppShell
	{aside}
	{header}
	{navbar}
	{asideCollapsed}
	{navbarCollapsed}
	mainAs="div"
	style="height: 18rem"
>
	<AppShellRegion fill
		><ZStack gap="small">
			<ZText>base时两侧区域被CSS折叠；medium恢复navbar，large恢复aside。</ZText>
			<ZText tone="muted">不测量视口，也不在hydration后改写首帧区域可见性。</ZText>
		</ZStack></AppShellRegion
	>
</ZAppShell>
