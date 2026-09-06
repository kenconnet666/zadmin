<script lang="ts">
	import { ZAppShell, ZProvider, ZText } from '@zadmin/zui';
	import AppShellRegion from './AppShellRegion.svelte';

	const navbarCollapsed = { base: true, small: false } as const;
	const asideCollapsed = { base: true, medium: false } as const;
</script>

{#snippet header()}
	<AppShellRegion fill><ZText>مساحة العمل</ZText></AppShellRegion>
{/snippet}
{#snippet navbar()}
	<AppShellRegion fill><ZText>التنقل</ZText></AppShellRegion>
{/snippet}
{#snippet aside()}
	<AppShellRegion fill><ZText>التفاصيل</ZText></AppShellRegion>
{/snippet}

<ZProvider direction="rtl" locale="ar-EG">
	<ZAppShell
		{aside}
		{header}
		{navbar}
		{asideCollapsed}
		mainAs="div"
		{navbarCollapsed}
		style="height: 16rem"
	>
		<AppShellRegion fill
			><ZText>يبقى ترتيب DOM ثابتاً بينما تعالج شبكة CSS الاتجاه المنطقي.</ZText></AppShellRegion
		>
	</ZAppShell>
</ZProvider>
