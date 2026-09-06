<script lang="ts">
	import { ZStack, ZField, ZTimeField } from '@zadmin/zui';
	import { Time } from '@internationalized/date';
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`time-field ${size}`} {size}>
			<ZTimeField defaultValue={new Time(9, 30)} />
		</ZField>
	{/each}
</ZStack>
