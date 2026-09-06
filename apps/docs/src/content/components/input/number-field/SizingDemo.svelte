<script lang="ts">
	import { ZStack, ZField, ZNumberField } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`number-field ${size}`} {size}>
			<ZNumberField defaultValue={42} />
		</ZField>
	{/each}
</ZStack>
