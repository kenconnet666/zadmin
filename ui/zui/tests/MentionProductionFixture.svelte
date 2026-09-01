<script lang="ts">
	import { ZButton, ZMention, type MentionItem } from '../src/entrypoints/index.js';

	let { mode = 'async' }: { mode?: 'async' | 'virtual' } = $props();
	const virtualItems: readonly MentionItem[] = Array.from({ length: 1000 }, (_, index) => ({
		key: index,
		label: `user-${String(index).padStart(4, '0')}`
	}));
	let asyncItems = $state<readonly MentionItem[]>([]);
	let loading = $state(false);
	let value = $state('');
	let searches = $state(0);
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
		onSearchChange={() => {
			searches += 1;
			loading = true;
			asyncItems = [];
		}}
	/>
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
<output data-testid="mention-production-output">{value}:{searches}</output>
