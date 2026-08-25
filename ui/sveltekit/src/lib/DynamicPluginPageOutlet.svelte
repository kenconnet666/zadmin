<script lang="ts">
	import type { ClientPageStore } from './client-runtime.ts';
	import type { ClientPluginPage } from './pages.ts';

	let { pages, pathname }: { pages: ClientPageStore; pathname: string } = $props();
	let current = $state<ClientPluginPage>();
	let target = $state<HTMLDivElement>();
	let loadError = $state<unknown>();

	$effect(() => {
		const update = () => {
			current = pages.match(pathname);
		};
		update();
		return pages.subscribe(update);
	});

	$effect(() => {
		const page = current;
		const element = target;
		loadError = undefined;
		if (!page || !element) return;
		let cancelled = false;
		let dispose: (() => void | Promise<void>) | undefined;
		Promise.resolve(page.mount(element)).then(
			(value) => {
				if (cancelled) void value();
				else dispose = value;
			},
			(error) => {
				if (!cancelled) loadError = error;
			}
		);
		return () => {
			cancelled = true;
			void dispose?.();
		};
	});
</script>

{#if !current}
	<h1>Plugin page not found</h1>
{:else if loadError}
	<h1>Plugin page failed to load</h1>
{:else}
	<div bind:this={target}></div>
{/if}
