<script lang="ts">
	import { ZTreeSelect, type TreeNode } from '../src/entrypoints/index.js';
	const nodes: readonly TreeNode[] = [
		{ key: 'root', label: 'Root' },
		{ key: 'alpha', label: 'Alpha', parentKey: 'root' },
		{ key: 'beta', label: 'Beta', parentKey: 'root' }
	];
	let { defaultOpen = false }: { defaultOpen?: boolean } = $props();
	let value = $state<string | number>('alpha');
</script>

<form data-testid="tree-select-form">
	<ZTreeSelect
		aria-label="Choose node"
		bind:value
		{defaultOpen}
		defaultExpandedKeys={['root']}
		defaultValue="alpha"
		name="node"
		{nodes}
	/>
	<button type="reset">Reset</button>
</form>
<output data-testid="tree-select-output">{value}</output>
