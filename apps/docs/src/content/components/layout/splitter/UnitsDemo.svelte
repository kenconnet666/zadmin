<script lang="ts">
	import { ZSplitter, ZStack, ZText } from '@zadmin/zui';

	const panels = [
		{ key: 'tree', label: '树', min: '8rem', max: '18rem' },
		{ key: 'editor', label: '编辑区', min: '30%', max: '70%' },
		{ key: 'preview', label: '预览', min: '10rem', resizable: true }
	] as const;
	const sizes = ['12rem', '50%', '10rem'] as const;
</script>

<ZStack gap="small" style="max-width: 100%;">
	<ZText weight="semibold">px/rem/% 与 min/max</ZText>
	<ZSplitter {panels} defaultSizes={sizes} style="width: 100%; max-width: 100%; height: 17rem;">
		{#snippet panel(panel)}
			<div style="padding: 0.75rem; min-width: 0; overflow-wrap: anywhere;">
				<ZText weight="semibold">{panel.label}</ZText>
				<ZText tone="muted">min/max和声明单位由panel配置拥有。</ZText>
			</div>
		{/snippet}
	</ZSplitter>
</ZStack>
