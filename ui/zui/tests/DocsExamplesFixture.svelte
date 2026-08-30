<script lang="ts">
	import type { Component } from 'svelte';

	const modules = import.meta.glob('../../../apps/docs/src/content/components/**/*.svelte', {
		eager: true,
		import: 'default'
	}) as Readonly<Record<string, Component>>;
	const examples = Object.entries(modules)
		.map(([path, component]) => ({ component, path }))
		.sort((left, right) => left.path.localeCompare(right.path));
</script>

{#each examples as example (example.path)}
	{@const Example = example.component}
	<section data-docs-example={example.path}><Example /></section>
{/each}
