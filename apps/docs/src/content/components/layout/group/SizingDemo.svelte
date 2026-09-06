<script lang="ts">
	import { ZButton, ZGroup, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large" style="max-width: 32rem">
	<ZStack gap="small">
		<ZText weight="semibold">grow：以内容宽度为basis后共同填满</ZText>
		<ZGroup itemSizing="grow">
			<ZButton variant="outline">较长的第一项</ZButton>
			<ZButton variant="outline">第二项</ZButton>
		</ZGroup>
	</ZStack>
	<ZStack gap="small">
		<ZText weight="semibold">equal：零basis平均分配一行</ZText>
		<ZGroup itemSizing="equal">
			<ZButton variant="outline">第一项</ZButton>
			<ZButton variant="outline">第二项</ZButton>
		</ZGroup>
	</ZStack>
</ZStack>
