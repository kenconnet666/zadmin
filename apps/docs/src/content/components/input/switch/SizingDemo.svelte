<script lang="ts">
	import { ZStack, ZField, ZSwitch } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`switch ${size}`} {size}>
			<ZSwitch defaultChecked />
		</ZField>
	{/each}
</ZStack>
