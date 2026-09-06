<script lang="ts">
	import { ZStack, ZField, ZMention } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const items = [{ key: 'alice', label: 'Alice', value: 'alice' }];
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`mention ${size}`} {size}>
			<ZMention {items} defaultValue="你好 @alice " rows={2} />
		</ZField>
	{/each}
</ZStack>
