<script lang="ts">
	import { ZIcon } from '@zadmin/zui';
	import type { ComponentDoc } from '../catalog/index.js';

	let {
		docs,
		currentId,
		query
	}: { docs: readonly ComponentDoc[]; currentId?: string; query: string } = $props();
	const filtered = $derived(
		docs.filter((doc) => `${doc.name} ${doc.summary}`.toLowerCase().includes(query.toLowerCase()))
	);
</script>

<aside class="app-sidebar">
	<nav aria-label="组件导航">
		<a class:active={!currentId} href="#/">概览</a>
		<p>基础组件</p>
		{#each filtered as doc (doc.id)}
			<a class:active={currentId === doc.id} href={`#/components/${doc.id}`}>
				<span>{doc.name}</span><ZIcon name="chevronDown" size={14} />
			</a>
		{/each}
		{#if filtered.length === 0}<span class="empty-search">没有匹配组件</span>{/if}
	</nav>
	<footer>
		<span>Svelte 5 · TypeScript</span>
		<span>Runtime CSS · class-only API</span>
	</footer>
</aside>
