<script lang="ts">
	import { ZStack, ZField, ZTextarea } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`textarea ${size}`} {size}>
			<ZTextarea defaultValue="多行输入按字号与行高自然布局。" rows={2} />
		</ZField>
	{/each}
</ZStack>
