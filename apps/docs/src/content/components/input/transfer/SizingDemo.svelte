<script lang="ts">
	import { ZStack, ZField, ZTransfer } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const items = [
		{ key: 'design', label: '设计系统', description: '组件与主题' },
		{ key: 'engineering', label: '工程实践', description: '架构与验证' }
	];
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`transfer ${size}`} {size}>
			<ZTransfer {items} defaultValue={['design']} />
		</ZField>
	{/each}
</ZStack>
