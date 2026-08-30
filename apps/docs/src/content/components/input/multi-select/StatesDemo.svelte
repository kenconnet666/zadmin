<script lang="ts">
	import {
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectItem,
		ZMultiSelectTrigger,
		ZStack
	} from '@zadmin/zui';
	const values = ['开发', '预发', '生产'] as const;
</script>

<ZStack gap="medium">
	<ZMultiSelect placeholder="至少选择一个环境">
		<ZMultiSelectTrigger aria-label="空的环境多选" />
		<ZMultiSelectContent
			>{#each values as value (value)}<ZMultiSelectItem {value}>{value}</ZMultiSelectItem
				>{/each}</ZMultiSelectContent
		>
	</ZMultiSelect>
	<ZMultiSelect disabled defaultValues={['开发', '生产']}>
		<ZMultiSelectTrigger aria-label="禁用的环境多选" />
		<ZMultiSelectContent
			>{#each values as value (value)}<ZMultiSelectItem {value}>{value}</ZMultiSelectItem
				>{/each}</ZMultiSelectContent
		>
	</ZMultiSelect>
</ZStack>
