<script lang="ts">
	import { ZStack, ZField, ZPinInput } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`pin-input ${size}`} {size}>
			<ZPinInput length={4} defaultValue="1234" />
		</ZField>
	{/each}
</ZStack>
