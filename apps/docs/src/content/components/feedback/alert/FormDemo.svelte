<script lang="ts">
	import { ZAlert, ZButton, ZStack, ZText } from '@zadmin/zui';
	let visible = $state(true);
</script>

<ZStack gap="medium">
	{#if visible}
		<ZAlert
			title="配置已保存"
			tone="success"
			dismissible
			dismissLabel="关闭配置保存提示"
			onDismiss={() => (visible = false)}
		>
			生产配置已写入，下一次部署会使用新版本。
			{#snippet action()}<ZButton variant="secondary" size="small">查看变更</ZButton>{/snippet}
		</ZAlert>
	{/if}
	<ZText tone="muted">visible = {visible}</ZText>
</ZStack>
