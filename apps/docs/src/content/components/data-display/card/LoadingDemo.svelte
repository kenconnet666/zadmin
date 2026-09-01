<script lang="ts">
	import { ZButton, ZCard, ZStack, ZText } from '@zadmin/zui';

	let loading = $state(true);
</script>

<ZStack gap="medium">
	<ZButton onclick={() => (loading = !loading)} variant="secondary">
		{loading ? '显示正文' : '重新加载'}
	</ZButton>
	<ZCard {loading} aria-label="发布概览" variant="outlined">
		{#snippet header()}<strong>发布概览</strong>{/snippet}
		<ZText>正文由调用方拥有；loading只临时替换body，header和Card尺寸边界保持稳定。</ZText>
		{#snippet footer()}<ZText tone="muted">数据源：生产集群</ZText>{/snippet}
	</ZCard>
	<output>aria-busy: {loading ? 'true' : 'false'}</output>
</ZStack>
