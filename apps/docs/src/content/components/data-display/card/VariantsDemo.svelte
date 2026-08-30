<script lang="ts">
	import { ZButton, ZCard, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZCard><ZText>只有正文的最小Card。</ZText></ZCard>
	<ZCard>
		{#snippet header()}<strong>需要确认</strong>{/snippet}
		<ZText tone="muted">删除前保留明确的上下文与操作。</ZText>
		{#snippet footer()}<ZStack direction="row" gap="small"
				><ZButton size="small">确认</ZButton><ZButton size="small" variant="ghost">取消</ZButton
				></ZStack
			>{/snippet}
	</ZCard>
</ZStack>
