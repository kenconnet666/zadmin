<script lang="ts">
	import type { Snippet } from 'svelte';

	import type { DesktopPlatform } from '../runtime/driver.js';
	import { provideDesktopPlatform } from './context.js';

	interface Props {
		children?: Snippet;
		platform: DesktopPlatform;
	}

	let { children, platform }: Props = $props();
	provideDesktopPlatform(() => platform);
</script>

{@render children?.()}
