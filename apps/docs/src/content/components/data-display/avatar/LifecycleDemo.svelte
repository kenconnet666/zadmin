<script lang="ts">
	import { ZAvatar, ZButton, ZStack, ZText, type AvatarShape, type AvatarSize } from '@zadmin/zui';

	const validSource = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
	const brokenSource = 'data:image/png;base64,broken';
	let src = $state(validSource);
	let loads = $state(0);
	let errors = $state(0);
	let imageRef = $state<HTMLImageElement | null>(null);
	let shape = $state<AvatarShape>('circle');
	let size = $state<AvatarSize>('large');
	const shapes: readonly AvatarShape[] = ['circle', 'rounded', 'square'];
	const sizes: readonly AvatarSize[] = ['large', 'medium', 'small'];

	function cycle<T>(values: readonly T[], current: T): T {
		return values[(values.indexOf(current) + 1) % values.length]!;
	}
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="medium" wrap>
		<ZAvatar
			alt="动态图片尝试"
			bind:imageRef
			fallbackText="动"
			{shape}
			{size}
			onImageError={() => (errors += 1)}
			onImageLoad={() => (loads += 1)}
			{src}
		/>
		<ZButton onclick={() => (src = validSource)}>加载有效图片</ZButton>
		<ZButton onclick={() => (src = brokenSource)} variant="secondary">切换失败图片</ZButton>
		<ZButton onclick={() => (src = '')} variant="ghost">移除图片源</ZButton>
		<ZButton onclick={() => (shape = cycle(shapes, shape))} variant="secondary">
			shape（{shape}）
		</ZButton>
		<ZButton onclick={() => (size = cycle(sizes, size))} variant="secondary">
			size（{size}）
		</ZButton>
	</ZStack>
	<ZText tone="muted">
		state = {src ? '有图片源' : '无图片源'} · img = {imageRef ? 'mounted' : 'none'} · load =
		{loads} · error = {errors} · {shape} / {size}
	</ZText>
</ZStack>
