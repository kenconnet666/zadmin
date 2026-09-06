<script lang="ts">
	import { ZStack, ZField, ZTagsInput } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`tags-input ${size}`} {size}>
			<ZTagsInput defaultValue={['Svelte', 'TypeScript']} maxVisibleTags={1} editable />
		</ZField>
	{/each}
</ZStack>
