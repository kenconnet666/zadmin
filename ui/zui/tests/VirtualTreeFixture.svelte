<script lang="ts">
	import { ZTree, type SelectionKey, type TreeNode } from '../src/entrypoints/index.js';
	const nodes: readonly TreeNode[] = Array.from({ length: 5000 }, (_, index) => ({
		key: `node-${index}`,
		label: `Node ${index + 1}`
	}));
	let selectedKeys = $state<readonly SelectionKey[]>(['node-0']);
</script>

<ZTree
	aria-label="Large tree"
	{nodes}
	virtualized
	height={180}
	itemSize={36}
	bind:selectedKeys
	data-testid="virtual-tree"
/>
<output data-testid="virtual-tree-output">{selectedKeys.join(',')}</output>
