<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import Mail from '@lucide/svelte/icons/mail';
	import { ZBadge, ZButton, ZStack } from '@zadmin/zui';
</script>

<ZStack align="center" direction="row" gap="xlarge" wrap>
	<ZBadge count={4} tone="danger">
		<ZButton aria-label="收件箱有4条未读消息" shape="square" variant="secondary">
			<Mail aria-hidden="true" size={18} />
		</ZButton>
	</ZBadge>
	<ZBadge count={18} max={9} size="small" tone="accent">
		<ZButton aria-label="通知中心有18条更新" shape="square" variant="secondary">
			<Bell aria-hidden="true" size={18} />
		</ZButton>
	</ZBadge>
</ZStack>
