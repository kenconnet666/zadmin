<script lang="ts">
	import type { Component } from 'svelte';

	const modules = import.meta.glob(
		'../../../apps/docs/src/content/components/{data-display,feedback,gene,input,layout}/**/*.svelte',
		{ eager: true, import: 'default' }
	) as Readonly<Record<string, Component>>;
	const examples = Object.entries(modules)
		.filter(
			([path]) =>
				!path.endsWith('/FormDemo.svelte') ||
				(!path.includes('/data-display/') && !path.includes('/feedback/'))
		)
		.map(([path, component]) => ({ component, path }))
		.sort((left, right) => left.path.localeCompare(right.path));
</script>

{#each examples as example (example.path)}
	{@const Example = example.component}
	<section data-docs-example={example.path}><Example /></section>
{/each}
