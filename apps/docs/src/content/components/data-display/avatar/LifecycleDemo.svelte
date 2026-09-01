<script lang="ts">
	import { ZAvatar, ZButton, ZStack, ZText } from '@zadmin/zui';

	const validSource = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
	const brokenSource = 'data:image/png;base64,broken';
	let src = $state(validSource);
	let loads = $state(0);
	let errors = $state(0);
	let imageRef = $state<HTMLImageElement | null>(null);
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="medium" wrap>
		<ZAvatar
			alt="动态图片尝试"
			bind:imageRef
			fallbackText="动"
			onImageError={() => (errors += 1)}
			onImageLoad={() => (loads += 1)}
			size="large"
			{src}
		/>
		<ZButton onclick={() => (src = validSource)}>加载有效图片</ZButton>
		<ZButton onclick={() => (src = brokenSource)} variant="secondary">切换失败图片</ZButton>
		<ZButton onclick={() => (src = '')} variant="ghost">移除图片源</ZButton>
	</ZStack>
	<ZText tone="muted">
		state = {src ? '有图片源' : '无图片源'} · img = {imageRef ? 'mounted' : 'none'} · load =
		{loads} · error = {errors}
	</ZText>
</ZStack>
