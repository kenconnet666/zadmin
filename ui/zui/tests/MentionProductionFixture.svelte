<script lang="ts">
	import { ZButton, ZMention, type MentionItem } from '../src/entrypoints/index.js';

	let { mode = 'async' }: { mode?: 'async' | 'generation' | 'virtual' } = $props();
	const virtualItems: readonly MentionItem[] = Array.from({ length: 1000 }, (_, index) => ({
		key: index,
		label: `user-${String(index).padStart(4, '0')}`
	}));
	let asyncItems = $state<readonly MentionItem[]>([]);
	let loading = $state(false);
	let value = $state('');
	let searches = $state(0);
	let searchGeneration = 0;
	let pendingSearches = $state<readonly { generation: number; query: string }[]>([]);

	function queueSearch(query: string): void {
		const generation = (searchGeneration += 1);
		searches += 1;
		loading = true;
		asyncItems = [];
		pendingSearches = [...pendingSearches, { generation, query }];
	}

	function resolveSearch(generation: number): void {
		const request = pendingSearches.find((entry) => entry.generation === generation);
		pendingSearches = pendingSearches.filter((entry) => entry.generation !== generation);
		if (!request || request.generation !== searchGeneration) return;
		asyncItems = [
			{ key: 'latest', label: `Latest ${request.query}`, value: 'latest' },
			{ key: 'current', label: 'Current result', value: 'current' }
		];
		loading = false;
	}
</script>

{#if mode === 'virtual'}
	<ZMention
		aria-label="Virtual mention"
		bind:value
		items={virtualItems}
		maxSuggestions={1000}
		virtual
		virtualHeight={260}
		virtualItemSize={52}
	/>
{:else}
	<ZMention
		aria-label="Async mention"
		bind:value
		items={asyncItems}
		{loading}
		onSearchChange={mode === 'generation'
			? queueSearch
			: () => {
					searches += 1;
					loading = true;
					asyncItems = [];
				}}
	/>
	{#if mode === 'generation'}
		<ZButton data-testid="mention-resolve-old" onclick={() => resolveSearch(1)}>Resolve old</ZButton
		>
		<ZButton data-testid="mention-resolve-latest" onclick={() => resolveSearch(2)}
			>Resolve latest</ZButton
		>
	{:else}
		<ZButton
			data-testid="mention-resolve"
			disabled={!loading}
			onclick={() => {
				asyncItems = [
					{ key: 1, label: 'Numeric Alice', value: 'numeric' },
					{ key: '1', label: 'String Alice', value: 'string' }
				];
				loading = false;
			}}
		>
			Resolve
		</ZButton>
	{/if}
{/if}
<output data-testid="mention-production-output">{value}:{searches}</output>
