<script lang="ts">
	import { ZCascader, type TreeNode } from '../src/entrypoints/index.js';
	const nodes: readonly TreeNode[] = [
		{ key: 'root', label: 'Root' },
		{ key: 'alpha', label: 'Alpha', parentKey: 'root' },
		{ key: 'leaf', label: 'Leaf', parentKey: 'alpha' },
		{ key: 'worker', label: 'Worker', parentKey: 'root' }
	];
	let { defaultOpen = false }: { defaultOpen?: boolean } = $props();
	let value = $state<readonly (string | number)[]>(['root', 'alpha', 'leaf']);
</script>

<form data-testid="cascader-form">
	<ZCascader
		bind:value
		{defaultOpen}
		defaultValue={['root', 'alpha', 'leaf']}
		name="path"
		{nodes}
	/>
	<button type="reset">Reset</button>
</form>
<output data-testid="cascader-output">{value.join('/')}</output>
