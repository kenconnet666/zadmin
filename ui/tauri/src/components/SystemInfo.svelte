<script lang="ts">
	import { onMount } from 'svelte';
	import { Stack, Text } from '@zadmin/zui-svelte';

	import type { DesktopError } from '../runtime/error.js';
	import { useDesktopPlatform } from './context.js';
	import type { DesktopSystemInfo } from './types.js';

	interface Props {
		onerror?: (error: DesktopError) => void;
		onload?: (info: DesktopSystemInfo) => void;
		title?: string;
	}

	let { onerror, onload, title = 'System information' }: Props = $props();
	const desktop = useDesktopPlatform();
	let info = $state<DesktopSystemInfo>();
	let loading = $state(true);

	onMount(() => {
		let active = true;
		void (async () => {
			const [app, os, window] = await Promise.all([
				desktop.app.snapshot(),
				desktop.os.snapshot(),
				desktop.window.snapshot()
			]);
			if (!active) return;
			for (const result of [app, os, window]) {
				if (!result.ok) {
					onerror?.(result.error);
					loading = false;
					return;
				}
			}
			if (app.ok && os.ok && window.ok) {
				info = { app: app.value, os: os.value, window: window.value };
				onload?.(info);
			}
			loading = false;
		})();
		return () => {
			active = false;
		};
	});
</script>

<Stack gap="small" data-tauri-system-info aria-busy={loading || undefined}>
	<Text as="strong">{title}</Text>
	{#if loading}
		<Text color="textMuted">Loading…</Text>
	{:else if info}
		<Text>{info.app.name} {info.app.version}</Text>
		<Text color="textMuted">Tauri {info.app.tauriVersion}</Text>
		<Text>{info.os.platform} {info.os.version} ({info.os.arch})</Text>
		<Text color="textMuted">Locale: {info.os.locale ?? 'unknown'}</Text>
		<Text color="textMuted">Scale: {info.window.scaleFactor}</Text>
	{:else}
		<Text color="danger">System information is unavailable.</Text>
	{/if}
</Stack>
