<script lang="ts">
	import { ZPagination, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZStack gap="small">
		<ZText>少量页不产生省略号</ZText>
		<ZPagination defaultPage={1} totalPages={5} />
	</ZStack>
	<ZStack gap="small">
		<ZText>扩大边界和相邻页窗口</ZText>
		<ZPagination boundaryCount={2} defaultPage={50} siblingCount={2} totalPages={100} />
	</ZStack>
	<ZStack gap="small">
		<ZText>禁用分页</ZText>
		<ZPagination defaultPage={3} disabled totalPages={10} />
	</ZStack>
</ZStack>
