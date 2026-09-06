<script lang="ts">
	import {
		ZStack,
		ZField,
		ZMultiSelect,
		ZMultiSelectTrigger,
		ZMultiSelectContent
	} from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const options = [
		{ label: '设计系统', value: 'design' },
		{ label: '工程实践', value: 'engineering' }
	];
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`multi-select ${size}`} {size}>
			<ZMultiSelect {options} defaultValue={['design', 'engineering']}>
				<ZMultiSelectTrigger />
				<ZMultiSelectContent />
			</ZMultiSelect>
		</ZField>
	{/each}
</ZStack>
