<script lang="ts">
	import { ZTree, type TreeNode } from '../src/entrypoints/index.js';
	const nodes: readonly TreeNode[] = [
		{ key: 'app', label: 'Application' },
		{ key: 'web', label: 'Web', parentKey: 'app' },
		{ key: 'admin', label: 'Admin', parentKey: 'web' },
		{ key: 'docs', label: 'Docs', parentKey: 'web' },
		{ key: 'worker', label: 'Worker', parentKey: 'app' },
		{ disabled: true, key: 'legacy', label: 'Legacy', parentKey: 'app' }
	];
	let expandedKeys = $state<readonly (string | number)[]>(['app']);
	let selectedKeys = $state<readonly (string | number)[]>(['web']);
	let changes = $state(0);
</script>

<form data-testid="tree-form">
	<ZTree
		aria-label="Fixture tree"
		bind:expandedKeys
		bind:selectedKeys
		defaultExpandedKeys={['app']}
		defaultSelectedKeys={['web']}
		name="node"
		{nodes}
		onSelectionChange={() => (changes += 1)}
	/>
	<button type="reset">Reset</button>
	<output data-testid="tree-output"
		>{expandedKeys.join(',')}:{selectedKeys.join(',')}:{changes}</output
	>
</form>
