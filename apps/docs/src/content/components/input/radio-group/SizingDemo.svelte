<script lang="ts">
	import { ZStack, ZField, ZRadioGroup } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const options = [
		{ label: '自动', value: 'auto' },
		{ label: '手动', value: 'manual' }
	];
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`radio-group ${size}`} {size}>
			<ZRadioGroup {options} defaultValue="auto" orientation="horizontal" />
		</ZField>
	{/each}
</ZStack>
