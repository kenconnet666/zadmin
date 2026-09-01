<script lang="ts">
	import { ZButton, ZCascader, ZStack, ZText, type SelectionKey, type TreeNode } from '@zadmin/zui';

	const nodes: readonly TreeNode[] = [
		{ key: 'services', label: '服务目录' },
		...Array.from({ length: 1000 }, (_, index) => ({
			key: `service-${index}`,
			label: `服务 ${String(index).padStart(4, '0')}`,
			parentKey: 'services'
		}))
	];
	let open = $state(false);
	let value = $state<readonly SelectionKey[]>([]);
</script>

<ZStack gap="medium">
	<ZCascader bind:open bind:value {nodes} virtual virtualHeight={256} virtualItemSize={36} />
	<ZButton onclick={() => (open = true)} variant="secondary">打开千项Cascader</ZButton>
	<ZText tone="muted">virtual path = {value.join('/') || 'empty'}</ZText>
</ZStack>
