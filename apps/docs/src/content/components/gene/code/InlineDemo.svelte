<script lang="ts">
	import { ZStack, ZText } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
</script>

<ZStack gap="medium">
	<ZText
		>使用 <ZCode code="pnpm --filter @zadmin/zui build" inline lang="bash" /> 构建组件包。</ZText
	>
	<ZCode
		ariaLabel="可换行JSON"
		code={'{\n  "status": "ready",\n  "checks": 128\n}'}
		lang="json"
		wrap
	/>
</ZStack>
