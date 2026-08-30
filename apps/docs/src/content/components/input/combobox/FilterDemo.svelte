<script lang="ts">
	import { ZCombobox, ZComboboxContent, ZComboboxInput, ZComboboxItem, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZCombobox
		filter={(text, query) => text.toLocaleLowerCase().startsWith(query.toLocaleLowerCase())}
	>
		<ZComboboxInput aria-label="按前缀搜索区域" placeholder="例如 cn" />
		<ZComboboxContent ariaLabel="区域建议">
			<ZComboboxItem textValue="cn-east-1" value="cn-east-1">cn-east-1</ZComboboxItem>
			<ZComboboxItem textValue="cn-north-1" value="cn-north-1">cn-north-1</ZComboboxItem>
			<ZComboboxItem textValue="us-west-1" value="us-west-1">us-west-1</ZComboboxItem>
		</ZComboboxContent>
	</ZCombobox>
	<ZCombobox disabled defaultInputValue="cn-east-1"
		><ZComboboxInput aria-label="禁用的区域搜索" /></ZCombobox
	>
</ZStack>
