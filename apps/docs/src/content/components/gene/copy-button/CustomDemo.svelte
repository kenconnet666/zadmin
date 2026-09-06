<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import { ZCopyButton, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="small" wrap>
	<ZCopyButton value="Custom children text" successMessage="自定义文本复制成功">
		{#snippet children(snapshot)}
			{snapshot.status === 'copied'
				? '已复制自定义文本'
				: snapshot.status === 'failed'
					? '重试复制'
					: '复制自定义文本'}
		{/snippet}
	</ZCopyButton>
	<ZCopyButton value="Icon only text" iconOnly aria-label="复制图标示例">
		{#snippet icon(snapshot)}
			<Copy aria-hidden="true" data-copy-status={snapshot.status} />
		{/snippet}
	</ZCopyButton>
	<ZText tone="muted">iconOnly仍由label/aria-label提供完整可访问名称。</ZText>
</ZStack>
