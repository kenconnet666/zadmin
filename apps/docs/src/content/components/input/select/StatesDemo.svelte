<script lang="ts">
	import { ZSelect, ZSelectContent, ZSelectItem, ZSelectTrigger, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZSelect placeholder="选择发布区域" placement="bottom-end">
		<ZSelectTrigger aria-label="发布区域">尚未选择区域</ZSelectTrigger>
		<ZSelectContent>
			<ZSelectItem textValue="华东" value="cn-east">华东</ZSelectItem>
			<ZSelectItem textValue="华北" value="cn-north">华北</ZSelectItem>
			<ZSelectItem
				onSelect={(event) => event.preventDefault()}
				textValue="维护中"
				value="maintenance"
				>维护中（阻止选择）
			</ZSelectItem>
		</ZSelectContent>
	</ZSelect>
	<ZSelect disabled defaultValue="cn-east">
		<ZSelectTrigger aria-label="禁用的发布区域">华东</ZSelectTrigger>
	</ZSelect>
	<ZSelect readonly defaultValue="cn-north">
		<ZSelectTrigger aria-label="只读的发布区域" />
	</ZSelect>
</ZStack>
