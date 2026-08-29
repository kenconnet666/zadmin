<script lang="ts">
	import { onDestroy } from 'svelte';

	import { createDesktopResourceScope } from '../../platform/scope.js';
	import { provideDesktopPlatform } from './context.js';
	import type { DesktopProviderProps } from './types.js';

	let { children, platform }: DesktopProviderProps = $props();
	const scope = createDesktopResourceScope();
	const scopedPlatform = $derived(platform.forScope(scope));
	provideDesktopPlatform(() => scopedPlatform);
	onDestroy(() => void scope.dispose());
</script>

{@render children?.()}
