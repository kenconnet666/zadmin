<script lang="ts">
	import ZAvatar from '../src/components/data-display/ZAvatar.svelte';
</script>

<ZAvatar alt="Server fallback" data-testid="avatar-ssr-fallback" fallbackText="SF" />
<ZAvatar alt="" data-testid="avatar-ssr-decorative" fallbackText="D" />
<ZAvatar
	alt="Server image"
	crossorigin="anonymous"
	data-testid="avatar-ssr-image"
	decoding="async"
	draggable={false}
	loading="lazy"
	referrerpolicy="no-referrer"
	sizes="48px"
	src="/avatar.png"
	srcset="/avatar.png 1x, /avatar@2x.png 2x"
/>
