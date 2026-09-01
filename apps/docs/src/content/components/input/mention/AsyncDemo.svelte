<script lang="ts">
	import { ZButton, ZMention, ZStack, ZText, type MentionItem } from '@zadmin/zui';

	let items = $state<readonly MentionItem[]>([]);
	let loading = $state(false);
	let pendingQuery = $state('');
	let value = $state('Assign ');

	function search(query: string): void {
		pendingQuery = query;
		loading = true;
		items = [];
	}
	function resolve(): void {
		items = [
			{ description: 'Frontend owner', key: 1, label: `Alice ${pendingQuery}`, value: 'alice' },
			{ description: 'Release owner', key: '1', label: `Alan ${pendingQuery}`, value: 'alan' }
		];
		loading = false;
	}
</script>

{#snippet suggestion(item: MentionItem)}
	<ZStack gap="xsmall">
		<ZText weight="semibold">{item.label}</ZText>
		<ZText size="small" tone="muted">{item.description}</ZText>
	</ZStack>
{/snippet}

<ZStack gap="medium">
	<ZMention
		aria-label="异步成员"
		bind:value
		item={suggestion}
		{items}
		{loading}
		onSearchChange={search}
		placeholder="输入 @ 后由owner返回结果"
	/>
	<ZButton disabled={!loading} onclick={resolve} variant="secondary">返回异步结果</ZButton>
	<ZText tone="muted">
		query = {pendingQuery || 'empty'} · loading = {loading} · value = {value}
	</ZText>
</ZStack>
