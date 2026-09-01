<script lang="ts">
	import { ZButton, ZCascader, ZStack, ZText, type SelectionKey, type TreeNode } from '@zadmin/zui';

	const nodes: readonly TreeNode[] = [
		{ key: 'typed', label: 'Typed keys' },
		{ key: 1, label: '数字 1', parentKey: 'typed' },
		{ key: '1', label: '字符串 "1"', parentKey: 'typed' }
	];
	let open = $state(false);
	let value = $state<readonly SelectionKey[]>(['typed', 1]);
</script>

<ZStack gap="medium">
	<ZCascader bind:open bind:value {nodes} placeholder="选择typed路径" />
	<ZStack direction="row" gap="small" wrap>
		<ZButton onclick={() => (value = ['typed', 1])} variant="secondary">外部设为number 1</ZButton>
		<ZButton onclick={() => (value = ['typed', '1'])} variant="secondary">外部设为string 1</ZButton>
		<ZButton onclick={() => (value = [])} variant="secondary">外部清空</ZButton>
		<ZButton onclick={() => (open = true)} variant="secondary">外部打开</ZButton>
	</ZStack>
	<ZText tone="muted">
		path = {value.join('/')} · leaf typeof = {value.length ? typeof value.at(-1) : 'empty'} · open = {open}
	</ZText>
</ZStack>
