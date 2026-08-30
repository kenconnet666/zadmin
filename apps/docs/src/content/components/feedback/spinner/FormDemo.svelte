<script lang="ts">
	import { ZSpinner, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" align="center">
	<ZSpinner size="small" label="正在同步" />
	<ZSpinner label="正在部署" />
	<ZSpinner size="large" label="正在生成制品" />
	<ZText tone="muted">Provider与系统reduced-motion会停止旋转。</ZText>
</ZStack>
