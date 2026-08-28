<script lang="ts">
	import { onMount } from 'svelte';
	import { ZStack, ZText } from '@zadmin/zui';

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

<ZStack gap="small" data-tauri-system-info aria-busy={loading || undefined}>
	<ZText as="strong">{title}</ZText>
	{#if loading}
		<ZText tone="muted">Loading…</ZText>
	{:else if info}
		<ZText>{info.app.name} {info.app.version}</ZText>
		<ZText tone="muted">Tauri {info.app.tauriVersion}</ZText>
		<ZText>{info.os.platform} {info.os.version} ({info.os.arch})</ZText>
		<ZText tone="muted">Locale: {info.os.locale ?? 'unknown'}</ZText>
		<ZText tone="muted">Scale: {info.window.scaleFactor}</ZText>
	{:else}
		<ZText tone="danger">System information is unavailable.</ZText>
	{/if}
</ZStack>
