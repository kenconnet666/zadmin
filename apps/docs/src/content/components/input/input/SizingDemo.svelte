<script lang="ts">
	import { ZStack, ZField, ZInput } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`input ${size}`} {size}>
			<ZInput defaultValue="主题尺寸与文字" />
		</ZField>
	{/each}
</ZStack>
