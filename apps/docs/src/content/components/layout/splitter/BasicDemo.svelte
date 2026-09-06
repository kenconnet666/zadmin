<script lang="ts">
	import {
		ZButton,
		ZSplitter,
		ZStack,
		ZText,
		type ZSplitterResizeDetail,
		type ZSplitterSize
	} from '@zadmin/zui';

	const panels = [
		{ key: 'navigation', label: '导航', min: '18%', max: '45%' },
		{ key: 'content', label: '内容', min: '30%' },
		{ key: 'inspector', label: '检查器', min: '18%', max: '45%' }
	] as const;
	let sizes = $state<readonly ZSplitterSize[]>([25, 50, 25]);
	let lifecycle = $state('等待调整');

	function describe(detail: ZSplitterResizeDetail): void {
		lifecycle = `${detail.source} · handle ${detail.handleIndex} · ${detail.percentages.map((value) => `${Math.round(value)}%`).join(' / ')}`;
	}
</script>

<ZStack gap="small" style="max-width: 100%;">
	<ZSplitter
		bind:sizes
		{panels}
		defaultSizes={[25, 50, 25]}
		style="width: 100%; max-width: 100%; height: 18rem;"
		onResizeStart={(detail) => describe(detail)}
		onResize={(detail) => describe(detail)}
		onResizeEnd={(detail) => describe(detail)}
	>
		{#snippet panel(panel)}
			<div style="padding: 0.75rem; min-width: 0; overflow-wrap: anywhere;">
				<ZText weight="semibold">{panel.label}</ZText>
				<ZText tone="muted">真实面板内容：{panel.key}，可通过pointer或separator键盘调整。</ZText>
			</div>
		{/snippet}
	</ZSplitter>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" onclick={() => (lifecycle = '等待调整')}
			>清除事件</ZButton
		>
		<ZText tone="muted">{lifecycle} · sizes={sizes.join(' / ')}</ZText>
	</ZStack>
</ZStack>
