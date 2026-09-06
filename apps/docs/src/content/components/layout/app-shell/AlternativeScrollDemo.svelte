<script lang="ts">
	import { ZAppShell, ZStack, ZText } from '@zadmin/zui';
	import AppShellRegion from './AppShellRegion.svelte';

	const notes = Array.from({ length: 12 }, (_, index) => `Root scroll note ${index + 1}`);
	const navbarCollapsed = { base: true, medium: false } as const;
	const asideCollapsed = { base: true, large: false } as const;
</script>

{#snippet header()}
	<AppShellRegion fill><ZText weight="semibold">Alternative header</ZText></AppShellRegion>
{/snippet}
{#snippet navbar()}
	<AppShellRegion fill><ZText>导航</ZText></AppShellRegion>
{/snippet}
{#snippet aside()}
	<AppShellRegion fill><ZText>检查器</ZText></AppShellRegion>
{/snippet}
{#snippet footer()}
	<AppShellRegion fill><ZText size="small">Alternative footer</ZText></AppShellRegion>
{/snippet}

<ZAppShell
	{aside}
	{footer}
	{header}
	{navbar}
	{asideCollapsed}
	asideLabel="根滚动示例检查器"
	layout="alternative"
	mainAs="div"
	{navbarCollapsed}
	navbarLabel="根滚动示例主导航"
	scroll="root"
	style="height: 20rem"
>
	<AppShellRegion fill
		><ZStack gap="medium">
			{#each notes as note (note)}
				<ZText>{note}</ZText>
			{/each}
		</ZStack></AppShellRegion
	>
</ZAppShell>
