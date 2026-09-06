<script lang="ts">
	import { ZStack, ZField, ZSlider } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`slider ${size}`} {size}>
			<ZSlider defaultValue={40} />
		</ZField>
	{/each}
</ZStack>
