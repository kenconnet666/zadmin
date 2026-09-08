<script module lang="ts">
	import type { Component } from 'svelte';

	export interface DocsSsrExample {
		readonly component: Component;
		readonly path: string;
	}

	const modules = import.meta.glob('../../../apps/docs/src/content/components/**/*.svelte', {
		eager: true,
		import: 'default'
	}) as Readonly<Record<string, Component>>;

	export const docsSsrExamples: readonly DocsSsrExample[] = Object.freeze(
		Object.entries(modules)
			.map(([path, component]) => Object.freeze({ component, path }))
			.sort((left, right) => left.path.localeCompare(right.path))
	);
</script>

<script lang="ts">
	let { examplePath }: { examplePath?: string } = $props();
	const examples = $derived(
		examplePath === undefined
			? docsSsrExamples
			: docsSsrExamples.filter((example) => example.path === examplePath)
	);
</script>

{#each examples as example (example.path)}
	{@const Example = example.component}
	<section data-docs-example={example.path}><Example /></section>
{/each}
