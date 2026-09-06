<script lang="ts">
	import { ZStack, ZField, ZInputGroup, ZInput } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`input-group ${size}`} {size}>
			<ZInputGroup>
				{#snippet prefix()}https://{/snippet}
				<ZInput defaultValue="example.com" />
			</ZInputGroup>
		</ZField>
	{/each}
</ZStack>
