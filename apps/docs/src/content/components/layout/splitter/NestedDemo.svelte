<script lang="ts">
	import { ZProvider, ZSplitter, ZStack, ZText } from '@zadmin/zui';

	const outerPanels = [
		{ key: 'top', label: '上方工作区', min: '7rem', max: '13rem' },
		{ key: 'bottom', label: '下方分区', min: '8rem' }
	] as const;
	const innerPanels = [
		{ key: 'rtl-list', label: 'قائمة', min: '8rem' },
		{ key: 'rtl-detail', label: 'تفاصيل', min: '10rem' }
	] as const;
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZStack gap="small" style="max-width: 100%;">
		<ZText weight="semibold">RTL垂直Splitter与嵌套水平分区</ZText>
		<ZSplitter
			orientation="vertical"
			panels={outerPanels}
			defaultSizes={[40, 60]}
			style="width: 100%; max-width: 100%; height: 20rem;"
		>
			{#snippet panel(panel)}
				{#if panel.key === 'bottom'}
					<ZSplitter
						panels={innerPanels}
						defaultSizes={[40, 60]}
						style="width: 100%; max-width: 100%; height: 100%; min-height: 8rem;"
					>
						{#snippet panel(inner)}
							<div style="padding: 0.75rem; min-width: 0; overflow-wrap: anywhere;">
								<ZText weight="semibold">{inner.label}</ZText>
								<ZText tone="muted">محتوى حقيقي داخل لوحة قابلة للتغيير.</ZText>
							</div>
						{/snippet}
					</ZSplitter>
				{:else}
					<div style="padding: 0.75rem; min-width: 0; overflow-wrap: anywhere;">
						<ZText>لوحة علوية حقيقية مع اتجاه RTL.</ZText>
					</div>
				{/if}
			{/snippet}
		</ZSplitter>
	</ZStack>
</ZProvider>
