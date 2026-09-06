<script lang="ts">
	import { ZCombobox, ZComboboxContent, ZComboboxInput, ZField, ZStack } from '@zadmin/zui';

	const sizes = ['small', 'medium', 'large'] as const;
	const options = [
		{ label: '设计系统', value: 'design' },
		{ label: '工程实践', value: 'engineering' }
	];
</script>

<ZStack gap="large">
	{#each sizes as size (size)}
		<ZField label={`Field ${size}`} {size}>
			<ZCombobox {options}>
				<ZComboboxInput placeholder="继承 Field 尺寸" />
				<ZComboboxContent />
			</ZCombobox>
		</ZField>
	{/each}
	<ZField label="large Field，small Combobox" size="large">
		<ZCombobox {options} size="small">
			<ZComboboxInput placeholder="根组件显式覆盖" />
			<ZComboboxContent />
		</ZCombobox>
	</ZField>
</ZStack>
