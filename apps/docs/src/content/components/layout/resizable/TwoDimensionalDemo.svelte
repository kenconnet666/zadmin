<script lang="ts">
	import { ZCard, ZProvider, ZResizable, ZStack, ZText, type ZResizableValue } from '@zadmin/zui';

	let width = $state<ZResizableValue['width']>('55%');
	let height = $state<ZResizableValue['height']>('12rem');
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZStack gap="small" style="max-width: 100%;">
		<ZText weight="semibold">二维handle与RTL</ZText>
		<ZResizable
			bind:width
			bind:height
			axis="both"
			handles={['inline-end', 'block-end', 'block-end-inline-end']}
			defaultWidth="55%"
			defaultHeight="12rem"
			minWidth="12rem"
			minHeight="8rem"
			maxWidth="100%"
			maxHeight="20rem"
			handleLabel={(handle) => `调整 ${handle}`}
			style="max-width: 100%;"
		>
			<ZCard variant="outlined" style="height:100%; min-width:0; overflow-wrap:anywhere;">
				<ZText>块结束与行内结束的交角可同时调整两轴；RTL中该角位于左下方。</ZText>
			</ZCard>
			{#snippet handle(context)}
				<span aria-hidden="true" data-resizing={context.resizing || undefined}>◆</span>
			{/snippet}
		</ZResizable>
		<ZText tone="muted">width={width} · height={height}</ZText>
	</ZStack>
</ZProvider>
