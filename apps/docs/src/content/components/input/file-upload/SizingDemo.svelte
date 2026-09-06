<script lang="ts">
	import { ZStack, ZField, ZFileUpload } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`file-upload ${size}`} {size}>
			<ZFileUpload />
		</ZField>
	{/each}
</ZStack>
