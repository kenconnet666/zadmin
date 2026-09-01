<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import { ZAvatar, ZBadge, ZButton, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack align="center" direction="row" gap="xlarge" wrap>
	<ZStack align="center" gap="small">
		<ZBadge dot label="用户在线" overlap="circular" tone="success">
			<ZAvatar alt="Lin" fallbackText="L" size="large" />
		</ZBadge>
		<ZText size="small">具名在线状态</ZText>
	</ZStack>
	<ZStack align="center" gap="small">
		<ZBadge count={1} dot label="有新通知" tone="danger">
			<ZButton aria-label="通知中心有新通知" shape="square" variant="secondary">
				<Bell aria-hidden="true" size={18} />
			</ZButton>
		</ZBadge>
		<ZText size="small">有计数的Dot</ZText>
	</ZStack>
	<ZStack align="center" gap="small">
		<ZBadge count={0} dot label="没有新通知">
			<ZButton aria-label="通知中心没有新通知" shape="square" variant="secondary">
				<Bell aria-hidden="true" size={18} />
			</ZButton>
		</ZBadge>
		<ZText size="small">0时隐藏</ZText>
	</ZStack>
</ZStack>
