<script lang="ts">
	import { ZText, ZTree, type SelectionKey, type TreeNode } from '@zadmin/zui';
	const nodes: readonly TreeNode[] = Array.from({ length: 5000 }, (_, index) => ({
		key: `node-${index}`,
		label: `节点 ${index + 1}`
	}));
	let selectedKeys = $state<readonly SelectionKey[]>([]);
</script>

<ZText tone="muted">selected = {selectedKeys.join(',') || 'none'}</ZText>
<ZTree
	aria-label="五千节点树"
	{nodes}
	virtualized
	height={252}
	itemSize={36}
	bind:selectedKeys
	data-testid="docs-virtual-tree"
/>
