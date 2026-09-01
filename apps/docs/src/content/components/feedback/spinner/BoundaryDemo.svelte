<script lang="ts">
	import { ZButton, ZSpinner, ZStack, ZText } from '@zadmin/zui';

	let loading = $state(true);
</script>

<ZStack gap="medium">
	<ZStack aria-busy={loading} gap="small">
		<ZText weight="semibold">部署摘要</ZText>
		{#if loading}
			<ZStack align="center" direction="row" gap="small">
				<ZSpinner label="正在加载部署摘要" />
				<ZText>正在加载部署摘要…</ZText>
			</ZStack>
		{:else}
			<ZText>版本 v2.4.0 已准备就绪。</ZText>
		{/if}
	</ZStack>
	<ZButton size="small" variant="secondary" onclick={() => (loading = !loading)}>
		{loading ? '完成加载' : '重新加载'}
	</ZButton>
	<ZText tone="muted">容器拥有aria-busy与内容切换；Spinner不创建overlay或阻止交互。</ZText>
</ZStack>
