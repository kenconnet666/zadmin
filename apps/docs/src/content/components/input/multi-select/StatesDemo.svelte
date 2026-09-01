<script lang="ts">
	import { ZMultiSelect, ZMultiSelectContent, ZMultiSelectTrigger, ZStack } from '@zadmin/zui';

	const options = [
		{ label: '开发', value: 'dev' },
		{ label: '预发', value: 'staging' },
		{ label: '生产', value: 'production' }
	] as const;
</script>

<ZStack gap="medium">
	<ZMultiSelect {options} placeholder="至少选择一个环境">
		<ZMultiSelectTrigger aria-label="空的环境多选" />
		<ZMultiSelectContent />
	</ZMultiSelect>
	<ZMultiSelect disabled defaultValue={['dev', 'production']} {options}>
		<ZMultiSelectTrigger aria-label="禁用的环境多选" />
		<ZMultiSelectContent />
	</ZMultiSelect>
	<ZMultiSelect readonly defaultValue={['staging']} {options}>
		<ZMultiSelectTrigger aria-label="只读的环境多选" />
		<ZMultiSelectContent />
	</ZMultiSelect>
</ZStack>
