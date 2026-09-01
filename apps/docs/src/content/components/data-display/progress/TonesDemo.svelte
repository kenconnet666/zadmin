<script lang="ts">
	import { ZProgress, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZProgress label="主要任务" tone="primary" value={28} />
	<ZProgress label="成功任务" tone="success" value={100} />
	<ZProgress label="警告任务" tone="warning" value={72} />
	<ZProgress label="失败任务" tone="danger" value={46} />
	<ZStack align="center" direction="row" gap="large" wrap>
		<ZProgress label="圆形成功任务" tone="success" value={100} view="circle" />
		<ZProgress label="圆形失败任务" tone="danger" value={46} view="circle" />
	</ZStack>
</ZStack>
