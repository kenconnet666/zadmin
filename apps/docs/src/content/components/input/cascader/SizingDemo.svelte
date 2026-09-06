<script lang="ts">
	import { ZStack, ZField, ZCascader } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const nodes = [
		{ key: 'docs', label: '文档' },
		{ key: 'design', label: '设计系统', parentKey: 'docs' }
	];
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`cascader ${size}`} {size}>
			<ZCascader {nodes} defaultValue={['docs', 'design']} />
		</ZField>
	{/each}
</ZStack>
