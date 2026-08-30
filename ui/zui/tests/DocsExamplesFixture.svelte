<script lang="ts">
	import type { Component } from 'svelte';

	const modules = import.meta.glob(
		'../../../apps/docs/src/content/components/{data-display,feedback,gene,input,layout,navigation,overlay}/**/*.svelte',
		{ eager: true, import: 'default' }
	) as Readonly<Record<string, Component>>;
	const examples = Object.entries(modules)
		.filter(
			([path]) =>
				!path.includes('/gene/code/') &&
				(!path.endsWith('/FormDemo.svelte') ||
					(!path.includes('/data-display/') && !path.includes('/feedback/')) ||
					path.endsWith('/data-display/progress/FormDemo.svelte')) &&
				((!path.includes('/navigation/') && !path.includes('/overlay/')) ||
					path.includes('/navigation/tree/') ||
					(!path.endsWith('/FormDemo.svelte') &&
						!path.endsWith('/InteractiveDemo.svelte') &&
						!path.endsWith('/LargeDemo.svelte')))
		)
		.map(([path, component]) => ({ component, path }))
		.sort((left, right) => left.path.localeCompare(right.path));
</script>

{#each examples as example (example.path)}
	{@const Example = example.component}
	<section data-docs-example={example.path}><Example /></section>
{/each}
