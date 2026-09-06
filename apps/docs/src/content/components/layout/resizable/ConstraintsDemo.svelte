<script lang="ts">
	import { ZCard, ZResizable, ZStack, ZText, type ZResizableValue } from '@zadmin/zui';

	let width = $state<ZResizableValue['width']>('55%');
</script>

<ZStack gap="small" style="width:100%; max-width: 40rem;">
	<ZText weight="semibold">rem/百分比与约束</ZText>
	<ZResizable
		bind:width
		axis="inline"
		defaultWidth="55%"
		minWidth="14rem"
		maxWidth="100%"
		height="12rem"
		style="max-width: 100%;"
	>
		<ZCard variant="outlined" style="height:100%; min-width:0; overflow-wrap:anywhere;">
			<ZText>最小14rem、最大40rem；声明单位保留在width输出中。</ZText>
		</ZCard>
	</ZResizable>
	<ZText tone="muted">当前 width={width}</ZText>
</ZStack>
