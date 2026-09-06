<script lang="ts">
	import { ZStack, ZField, ZColorPicker } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`color-picker ${size}`} {size}>
			<ZColorPicker defaultValue="#2563eb" />
		</ZField>
	{/each}
</ZStack>
