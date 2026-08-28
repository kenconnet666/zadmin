<script lang="ts">
	import { mergeMiniStyles } from '../../styles/index.ts';
	import type { MImageProps } from './types.ts';

	let {
		class: className,
		fadeShow = true,
		id,
		lazyLoad = false,
		mode = 'scaleToFill',
		onerror,
		onload,
		showMenuByLongpress = false,
		src,
		style,
		webp = false
	}: MImageProps = $props();
	const mergedStyle = $derived(mergeMiniStyles(style));

	function handleLoad(event: Event): void {
		onload?.(event as unknown as Parameters<NonNullable<MImageProps['onload']>>[0]);
	}

	function handleError(event: Event): void {
		onerror?.(event as unknown as Parameters<NonNullable<MImageProps['onerror']>>[0]);
	}
	const nativeAttributes = $derived({
		'fade-show': fadeShow,
		'lazy-load': lazyLoad,
		mode,
		onerror: handleError,
		onload: handleLoad,
		'show-menu-by-longpress': showMenuByLongpress,
		src,
		webp
	} as Record<string, unknown>);
</script>

<image {...nativeAttributes} {id} class={['m-image', className]} style={mergedStyle} />
