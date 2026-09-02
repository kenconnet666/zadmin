<script lang="ts">
	import { ZButton } from '../src/entrypoints/index.js';
	import ZAvatar from '../src/components/data-display/ZAvatar.svelte';

	const firstSource = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
	const secondSource = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
	let src = $state(firstSource);
	let imageRef = $state<HTMLImageElement | null>(null);
	let loads = $state(0);
	let errors = $state(0);
	const responsiveSrcset = $derived(src ? `${src} 32w, ${src} 64w` : undefined);
</script>

<ZAvatar alt="Named fallback" data-testid="avatar-named" fallbackText="NF" />
<ZAvatar alt="" data-testid="avatar-decorative" fallbackText="D" />
<ZAvatar
	alt="Responsive image"
	bind:imageRef
	crossorigin="anonymous"
	data-testid="avatar-responsive"
	decoding="async"
	draggable={false}
	fallbackText="RI"
	loading="lazy"
	onImageError={() => (errors += 1)}
	onImageLoad={() => (loads += 1)}
	referrerpolicy="no-referrer"
	shape="rounded"
	size="large"
	sizes="48px"
	{src}
	srcset={responsiveSrcset}
/>
<ZButton data-testid="avatar-use-first" onclick={() => (src = firstSource)}>Use first</ZButton>
<ZButton data-testid="avatar-use-second" onclick={() => (src = secondSource)}>Use second</ZButton>
<ZButton data-testid="avatar-clear" onclick={() => (src = '')}>Clear</ZButton>
<output data-testid="avatar-production-output">
	{imageRef ? 'image' : 'none'}:{loads}:{errors}:{src === firstSource
		? 'first'
		: src === secondSource
			? 'second'
			: 'empty'}
</output>
