<script lang="ts">
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { ZAlert, ZButton, ZLink, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZAlert live="off" title="安全策略已生效" tone="success">
		{#snippet icon()}<ShieldCheck aria-hidden="true" size={20} />{/snippet}
		长内容会在section内换行；action保留真实链接与按钮语义，不把整条Alert变成可点击区域。
		{#snippet action()}
			<ZLink href="#/guides/accessibility">查看策略</ZLink>
			<ZButton size="small" variant="secondary">复制摘要</ZButton>
		{/snippet}
	</ZAlert>
	<ZAlert icon={null} live="off" title="无图标的低噪声说明" tone="info">
		调用方可以显式移除decorative图标，标题和正文语义保持不变。
	</ZAlert>
</ZStack>
