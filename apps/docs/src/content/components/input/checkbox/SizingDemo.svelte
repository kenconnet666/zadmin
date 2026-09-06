<script lang="ts">
	import { ZStack, ZField, ZCheckbox } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`checkbox ${size}`} {size}>
			<ZCheckbox defaultChecked />
		</ZField>
	{/each}
</ZStack>
