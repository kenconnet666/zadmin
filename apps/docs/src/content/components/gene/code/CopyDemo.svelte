<script lang="ts">
	import { ZStack, ZText } from '@zadmin/zui';
	import { ZCode, type ZCodeCopyDetail } from '@zadmin/zui/code';

	let result = $state<'copied' | 'failed' | 'idle'>('idle');
</script>

<ZStack gap="small">
	<ZCode
		ariaLabel="可复制部署命令"
		code="pnpm --filter @zadmin/docs dev"
		copyable
		lang="bash"
		onCopy={(detail: ZCodeCopyDetail) => (result = detail.status)}
	/>
	<ZText tone="muted">调用方只接收copied/failed安全状态：{result}</ZText>
</ZStack>
