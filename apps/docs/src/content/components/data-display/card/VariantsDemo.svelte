<script lang="ts">
	import { ZButton, ZCard, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZCard variant="elevated">
		{#snippet header()}<strong>Elevated surface</strong>{/snippet}
		<ZText>阴影Card适合从页面背景上抬起的独立内容。</ZText>
	</ZCard>
	<ZCard variant="outlined">
		{#snippet header()}<strong>Outlined surface</strong>{/snippet}
		<ZText tone="muted">边框Card适合同层级密集布局。</ZText>
		{#snippet actions()}
			<ZButton size="small">确认</ZButton>
			<ZButton size="small" variant="ghost">取消</ZButton>
		{/snippet}
	</ZCard>
</ZStack>
