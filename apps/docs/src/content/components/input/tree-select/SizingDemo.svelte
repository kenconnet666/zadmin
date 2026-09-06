<script lang="ts">
	import { ZStack, ZField, ZTreeSelect } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const nodes = [
		{ key: 'design', label: '设计系统' },
		{ key: 'engineering', label: '工程实践' }
	];
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`tree-select ${size}`} {size}>
			<ZTreeSelect {nodes} defaultValue="design" />
		</ZField>
	{/each}
</ZStack>
