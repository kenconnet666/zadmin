<script lang="ts">
	import { ZButton, ZStack, ZText, ZTreeSelect, type TreeNode } from '@zadmin/zui';

	const nodes: readonly TreeNode<string>[] = [
		{ key: 'platform', label: '平台' },
		{ key: 'api', label: 'API服务', parentKey: 'platform' },
		{ key: 'docs', label: '文档站', parentKey: 'platform' }
	];
	let expandedKeys = $state<readonly string[]>(['platform']);
	let open = $state(false);
	let value = $state<string | null>('api');
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="secondary" onclick={() => (open = true)}>外部打开</ZButton>
		<ZButton size="small" variant="secondary" onclick={() => (value = 'docs')}>选择文档站</ZButton>
		<ZButton size="small" variant="ghost" onclick={() => (value = null)}>外部清空</ZButton>
	</ZStack>
	<ZTreeSelect aria-label="受控节点选择" bind:expandedKeys bind:open bind:value clearable {nodes} />
	<ZText tone="muted"
		>value = {value ?? 'null'} · open = {open} · expanded = {expandedKeys.join(',')}</ZText
	>
</ZStack>
