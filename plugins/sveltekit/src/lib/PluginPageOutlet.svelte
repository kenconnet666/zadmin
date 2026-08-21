<script lang="ts">
	import type { Component } from 'svelte';
	import { matchPluginPage, type PluginPageDefinition } from './pages.ts';

	let { pages, pathname }: { pages: readonly PluginPageDefinition[]; pathname: string } = $props();
	let page = $derived(matchPluginPage(pages, pathname));
	let component = $state<Component>();
	let loadError = $state<unknown>();

	$effect(() => {
		const current = page;
		component = undefined;
		loadError = undefined;
		if (!current) return;

		let cancelled = false;
		current.load().then(
			(module) => {
				if (!cancelled) component = module.default;
			},
			(error) => {
				if (!cancelled) loadError = error;
			}
		);

		return () => {
			cancelled = true;
		};
	});
</script>

{#if !page}
	<h1>Plugin page not found</h1>
{:else if loadError}
	<h1>Plugin page failed to load</h1>
{:else if component}
	{@const Page = component}
	<Page />
{:else}
	<p>Loading plugin…</p>
{/if}
