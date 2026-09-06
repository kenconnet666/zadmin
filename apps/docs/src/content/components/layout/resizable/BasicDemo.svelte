<script lang="ts">
	import {
		ZButton,
		ZCard,
		ZResizable,
		ZStack,
		ZText,
		type ZResizableResizeDetail,
		type ZResizableValue
	} from '@zadmin/zui';

	let width = $state<ZResizableValue['width']>('60%');
	let lifecycle = $state('等待调整');

	function report(detail: ZResizableResizeDetail): void {
		lifecycle = `${detail.source} ${detail.handle} · ${detail.width} × ${detail.height}`;
	}
</script>

<ZStack gap="small" style="max-width: 100%;">
	<ZResizable
		bind:width
		height="10rem"
		defaultWidth="60%"
		minWidth="12rem"
		maxWidth="100%"
		onResize={report}
		onResizeEnd={report}
		style="max-width: 100%;"
	>
		<ZCard variant="outlined" style="height:100%; min-width:0; overflow-wrap:anywhere;">
			<ZStack gap="small">
				<ZText as="p" weight="semibold">可调整工作区</ZText>
				<ZText as="p" tone="muted">拖动边缘，或聚焦手柄后使用方向键、Home 和 End 调整。</ZText>
			</ZStack>
		</ZCard>
	</ZResizable>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" onclick={() => (width = '60%')}>恢复60%</ZButton>
		<ZText tone="muted">{lifecycle} · width={width}</ZText>
	</ZStack>
</ZStack>
