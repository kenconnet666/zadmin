<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ZProvider } from '@zadmin/zui';
	import { createTauriDesktopPlatform } from '@zadmin/tauri';
	import { DesktopProvider } from '@zadmin/tauri/svelte';

	let { children }: { children?: Snippet } = $props();
	const desktop = createTauriDesktopPlatform({
		opener: {
			allowedOrigins: ['https://github.com', 'https://v2.tauri.app']
		}
	});
</script>

<ZProvider>
	<DesktopProvider platform={desktop}>
		{@render children?.()}
	</DesktopProvider>
</ZProvider>
