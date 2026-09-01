<script lang="ts">
	import { ZAvatar, ZStack, ZText } from '@zadmin/zui';

	let imageRef = $state<HTMLImageElement | null>(null);
</script>

<ZStack gap="medium">
	<ZAvatar
		alt="ZUI响应式品牌头像"
		bind:imageRef
		crossorigin="anonymous"
		decoding="async"
		draggable={false}
		loading="lazy"
		referrerpolicy="no-referrer"
		shape="rounded"
		size="large"
		sizes="48px"
		src="/favicon.svg"
		srcset="/favicon.svg 32w, /favicon.svg 64w"
	/>
	<ZText tone="muted">
		img = {imageRef?.tagName ?? '等待挂载'} · loading = {imageRef?.loading ?? '—'} · decoding =
		{imageRef?.decoding ?? '—'}
	</ZText>
</ZStack>
