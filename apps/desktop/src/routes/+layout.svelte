<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ZProvider } from '@zadmin/zui';
	import { createWebviewDesktopPlatform } from '@zadmin/webview/platform';
	import { DesktopProvider } from '@zadmin/webview/svelte';

	let { children }: { children?: Snippet } = $props();
	const desktop = createWebviewDesktopPlatform({
		opener: {
			allowedOrigins: ['https://github.com', 'https://learn.microsoft.com']
		}
	});
</script>

<ZProvider>
	<DesktopProvider platform={desktop}>
		{@render children?.()}
	</DesktopProvider>
</ZProvider>
