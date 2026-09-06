<script lang="ts">
	import { ZStack, ZForm, ZFormField, ZInput } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZForm {size}
			><ZFormField label={`Form ${size}`} name="title"
				><ZInput defaultValue="表单级尺寸" /></ZFormField
			></ZForm
		>
	{/each}
</ZStack>
