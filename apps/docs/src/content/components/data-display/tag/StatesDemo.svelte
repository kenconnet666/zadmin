<script lang="ts">
	import { ZStack, ZTag } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="medium" wrap>
	<ZTag tone="accent">预览</ZTag>
	<ZTag tone="success">稳定</ZTag>
	<ZTag tone="warning">即将弃用</ZTag>
	<ZTag tone="danger">已阻断</ZTag>
	<ZTag disabled removable removeLabel="不可移除的锁定标签">锁定</ZTag>
</ZStack>
