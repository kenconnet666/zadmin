<script lang="ts">
	import { ZStack, ZText } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	const sampleJson = '{\n  "status": "ready",\n  "checks": 128\n}';
</script>

<ZStack gap="medium">
	<ZText
		>使用 <ZCode code="pnpm --filter @zadmin/zui build" inline size="medium" lang="bash" wrap /> 构建组件包。</ZText
	>
	<ZCode ariaLabel="可换行JSON" code={sampleJson} lang="json" wrap />
</ZStack>
