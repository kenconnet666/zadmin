<script lang="ts">
	import { ZSpinner, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack align="center" direction="row" gap="large" wrap>
	<ZSpinner label="主要任务正在运行" tone="primary" />
	<ZSpinner label="次要后台任务正在运行" tone="muted" />
	<ZText as="div" tone="danger">
		<ZStack align="center" direction="row" gap="small">
			<ZSpinner label="危险操作正在提交" tone="inherit" />
			inherit跟随组合边界
		</ZStack>
	</ZText>
</ZStack>
