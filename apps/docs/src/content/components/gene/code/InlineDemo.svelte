<script lang="ts">
	import { ZStack, ZText } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	const sampleJson = '{\n  "status": "ready",\n  "checks": 128\n}';
	const longToken = '0123456789abcdef'.repeat(12);
</script>

<ZStack gap="medium">
	<ZText
		>使用 <ZCode code="pnpm --filter @zadmin/zui build" inline size="medium" lang="bash" wrap /> 构建组件包。</ZText
	>
	<ZCode ariaLabel="可换行JSON" code={sampleJson} lang="json" wrap />
	<ZText>长哈希或标识符也可使用 wrap 在容器内换行，选择和复制仍保留完整原文。</ZText>
	<ZCode ariaLabel="可换行长标识符" code={longToken} wrap />
</ZStack>
