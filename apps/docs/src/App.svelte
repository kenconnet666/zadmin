<script lang="ts">
	import { onMount } from 'svelte';
	import { ZProvider } from '@zadmin/zui';
	import { componentDocs, componentDocsById } from './lib/catalog/index.js';
	import ComponentPage from './lib/docs/ComponentPage.svelte';
	import HomePage from './lib/docs/HomePage.svelte';
	import AppHeader from './lib/shell/AppHeader.svelte';
	import AppSidebar from './lib/shell/AppSidebar.svelte';

	function readComponentId(): string | undefined {
		const match = /^#\/components\/([^/?#]+)$/u.exec(globalThis.location?.hash ?? '');
		return match?.[1];
	}

	let currentId = $state<string | undefined>(readComponentId());
	let query = $state('');
	const currentDoc = $derived(currentId ? componentDocsById.get(currentId) : undefined);
	const invalidRoute = $derived(currentId !== undefined && currentDoc === undefined);

	onMount(() => {
		const syncRoute = () => {
			currentId = readComponentId();
			window.scrollTo({ top: 0 });
		};
		window.addEventListener('hashchange', syncRoute);
		return () => window.removeEventListener('hashchange', syncRoute);
	});

	$effect(() => {
		document.title = currentDoc ? `${currentDoc.name} · ZUI Components` : 'ZUI Components';
	});
</script>

<ZProvider>
	<div class="app-shell">
		<AppHeader bind:query />
		<AppSidebar docs={componentDocs} {currentId} {query} />
		<main>
			{#if currentDoc}
				<ComponentPage doc={currentDoc} />
			{:else if invalidRoute}
				<section class="not-found">
					<p class="eyebrow">404</p>
					<h1>没有这个组件。</h1>
					<p>当前展示站只列出已经实现并通过验收的ZUI基础组件。</p>
					<a class="primary-action" href="#/">返回组件概览</a>
				</section>
			{:else}
				<HomePage docs={componentDocs} />
			{/if}
		</main>
	</div>
</ZProvider>
