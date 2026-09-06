<script lang="ts">
	import { ZField, ZFieldset, ZInput, ZStack } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large">
	{#each sizes as size (size)}
		<ZFieldset legend={`Fieldset ${size}`} {size}>
			<ZField label="独立medium控件">
				<ZInput aria-label={`${size}组中的独立medium控件`} size="medium" value="组尺寸不覆盖我" />
			</ZField>
		</ZFieldset>
	{/each}
</ZStack>
