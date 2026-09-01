<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import { ZField, ZProvider, ZStack, ZSwitch, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZStack align="center" direction="row" gap="medium" wrap>
		<ZSwitch aria-label="小尺寸" defaultChecked size="small" />
		<ZSwitch aria-label="中尺寸" defaultChecked size="medium" />
		<ZSwitch aria-label="大尺寸" defaultChecked size="large" />
		<ZSwitch aria-label="加载中" defaultChecked loading />
		<ZSwitch aria-label="只读" defaultChecked readonly />
		<ZSwitch aria-label="禁用" defaultChecked disabled />
	</ZStack>

	<ZProvider density="compact">
		<ZStack align="center" direction="row" gap="medium">
			<ZSwitch aria-label="继承紧凑密度" defaultChecked />
			<ZText tone="muted">未传size时继承Provider density</ZText>
		</ZStack>
	</ZProvider>

	<ZField
		description="Field统一提供label、description、required与invalid关联。"
		error="生产环境必须启用审计日志"
		label="审计日志"
		required
	>
		<ZSwitch />
	</ZField>

	<ZStack align="center" direction="row" gap="medium">
		<ZSwitch defaultChecked id="switch-state-indicator">
			{#snippet indicator(checked)}
				{#if checked}
					<Check size={12} strokeWidth={3} />
				{:else}
					<X size={12} strokeWidth={3} />
				{/if}
			{/snippet}
		</ZSwitch>
		<ZText as="label" for="switch-state-indicator">单一indicator Snippet按状态组合Lucide图标</ZText>
	</ZStack>
</ZStack>
