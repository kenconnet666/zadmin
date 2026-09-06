<script lang="ts">
	import ZAppShell from '../src/components/layout/ZAppShell.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import { zhCNLocalePack } from '../src/runtime/foundation/locale.js';

	const mobileNavbar = { base: true, medium: false } as const;
	const mobileAside = { base: true, large: false } as const;
	const paragraphs = Array.from(
		{ length: 16 },
		(_, index) => `Scrollable document line ${index + 1}`
	);
</script>

{#snippet header()}
	<div>Application header</div>
{/snippet}
{#snippet navbar()}
	<div>Navigation content</div>
{/snippet}
{#snippet aside()}
	<div>Inspector content</div>
{/snippet}
{#snippet footer()}
	<div>Application footer</div>
{/snippet}

<ZAppShell
	{aside}
	{footer}
	{header}
	{navbar}
	asideWidth={120}
	data-testid="app-shell-default"
	headerHeight={48}
	mainPadding="small"
	navbarWidth={100}
	style="height: 360px"
>
	{#each paragraphs as paragraph (paragraph)}
		<p>{paragraph}</p>
	{/each}
</ZAppShell>

<ZAppShell
	{aside}
	{footer}
	{header}
	{navbar}
	asideCollapsed={mobileAside}
	data-testid="app-shell-alternative"
	layout="alternative"
	mainAs="div"
	navbarCollapsed={mobileNavbar}
	scroll="root"
	style="height: 260px"
>
	{#each paragraphs as paragraph (paragraph)}
		<p>Alternative {paragraph}</p>
	{/each}
</ZAppShell>

<ZProvider direction="rtl">
	<ZAppShell
		{aside}
		{header}
		{navbar}
		data-testid="app-shell-rtl"
		headerHeight={40}
		navbarWidth={96}
		style="height: 220px"
	>
		<div>RTL main content</div>
	</ZAppShell>
</ZProvider>

<ZAppShell
	{aside}
	{footer}
	{header}
	{navbar}
	data-testid="app-shell-theme-defaults"
	style="height: 260px"
>
	<div>Theme-sized regions</div>
</ZAppShell>

<ZProvider locale="zh-CN" localePack={zhCNLocalePack}>
	<ZAppShell {navbar} data-testid="app-shell-localized" mainAs="div" style="height: 120px">
		<div>Localized navigation</div>
	</ZAppShell>
</ZProvider>
