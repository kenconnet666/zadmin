<script lang="ts">
	import UserRound from '@lucide/svelte/icons/user-round';
	import { ZAvatar, ZStack, ZText } from '@zadmin/zui';
</script>

{#snippet decorativeFallback()}
	<UserRound aria-hidden="true" size={20} />
{/snippet}

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="large" wrap>
		<ZAvatar alt="" fallbackText="装" />
		<ZAvatar alt="" fallback={decorativeFallback} shape="rounded" />
		<ZAvatar alt="辅助技术可读的账户头像" fallbackText="账" />
	</ZStack>
	<ZText tone="muted">
		alt为空时图片和fallback均保持装饰性；具名Avatar在图片与fallback之间共享同一个名称。
	</ZText>
</ZStack>
