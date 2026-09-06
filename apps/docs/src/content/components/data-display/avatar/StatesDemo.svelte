<script lang="ts">
	import { ZAvatar, ZStack, ZText } from '@zadmin/zui';
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="large" wrap>
		{#each sizes as size (size)}<ZAvatar alt={`${size}头像`} fallbackText="林" {size} />{/each}
	</ZStack>
	<ZStack direction="row" gap="medium">
		<ZAvatar alt="圆角头像" fallbackText="圆" shape="rounded" />
		<ZAvatar alt="方形头像" fallbackText="方" shape="square" />
	</ZStack>
	<ZText tone="muted">五档头像消费专用24/32/40/48/64px主题尺寸，与图标和控件高度分离。</ZText>
</ZStack>
