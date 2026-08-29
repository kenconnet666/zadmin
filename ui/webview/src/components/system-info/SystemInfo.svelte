<script lang="ts">
	import { onMount } from 'svelte';
	import { ZStack, ZText } from '@zadmin/zui';

	import { useDesktopPlatform } from '../provider/context.js';
	import type { DesktopSystemInfo, SystemInfoProps } from './types.js';

	let { onerror, onload, title = 'System information' }: SystemInfoProps = $props();
	const desktop = useDesktopPlatform();
	let info = $state<DesktopSystemInfo>();
	let loading = $state(true);

	onMount(() => {
		let active = true;
		void Promise.all([
			desktop.app.snapshot(),
			desktop.os.snapshot(),
			desktop.window.snapshot()
		]).then(([app, os, window]) => {
			if (!active) return;
			const failed = [app, os, window].find((result) => !result.ok);
			if (failed && !failed.ok) onerror?.(failed.error);
			else if (app.ok && os.ok && window.ok) {
				info = { app: app.value, os: os.value, window: window.value };
				onload?.(info);
			}
			loading = false;
		});
		return () => {
			active = false;
		};
	});
</script>

<ZStack gap="small" data-webview-system-info aria-busy={loading || undefined}>
	<ZText as="strong">{title}</ZText>
	{#if loading}
		<ZText tone="muted">Loading…</ZText>
	{:else if info}
		<ZText>{info.app.name} {info.app.version}</ZText>
		<ZText tone="muted">WebView2 {info.app.webviewVersion}</ZText>
		<ZText>{info.os.platform} {info.os.version} ({info.os.arch})</ZText>
		<ZText tone="muted">Locale: {info.os.locale}</ZText>
		<ZText tone="muted">Scale: {info.window.scaleFactor}</ZText>
	{:else}
		<ZText tone="danger">System information is unavailable.</ZText>
	{/if}
</ZStack>
