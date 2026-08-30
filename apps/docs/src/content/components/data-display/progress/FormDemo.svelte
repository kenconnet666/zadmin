<script lang="ts">
	import { ZButton, ZProgress, ZStack, ZText } from '@zadmin/zui';
	let value = $state(68);
</script>

<ZStack gap="large">
	<ZProgress label="部署进度" {value} />
	<ZStack direction="row" gap="large" align="center">
		<ZProgress label="制品完成度" {value} view="circle" />
		<ZProgress label="正在分析依赖" view="circle" />
		<ZStack gap="small">
			<ZButton size="small" onclick={() => (value = Math.min(100, value + 8))}>增加8%</ZButton>
			<ZText tone="muted">value = {value}%</ZText>
		</ZStack>
	</ZStack>
</ZStack>
