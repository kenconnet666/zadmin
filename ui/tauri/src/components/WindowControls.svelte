<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Stack } from '@zadmin/zui';

	import type { DesktopError } from '../runtime/error.js';
	import type { DesktopResourceHandle } from '../runtime/context.js';
	import { useDesktopPlatform } from './context.js';

	interface Props {
		onerror?: (error: DesktopError) => void;
	}

	let { onerror }: Props = $props();
	const desktop = useDesktopPlatform();
	let maximized = $state(false);
	let busy = $state(false);
	let pending = 0;
	let actionQueue = Promise.resolve();

	async function refresh(): Promise<void> {
		const result = await desktop.window.snapshot();
		if (result.ok) maximized = result.value.maximized;
		else onerror?.(result.error);
	}

	function run(
		action: () => Promise<import('../runtime/error.js').DesktopResult<void>>
	): Promise<void> {
		pending += 1;
		busy = true;
		const task = actionQueue.then(async () => {
			const result = await action();
			if (!result.ok) onerror?.(result.error);
			await refresh();
		});
		actionQueue = task.catch(() => undefined);
		return task.finally(() => {
			pending -= 1;
			busy = pending > 0;
		});
	}

	onMount(() => {
		let active = true;
		let handle: DesktopResourceHandle | undefined;
		void (async () => {
			await refresh();
			const result = await desktop.window.listen((snapshot) => {
				if (active) maximized = snapshot.maximized;
			});
			if (result.ok) handle = result.value;
			else onerror?.(result.error);
		})();
		return () => {
			active = false;
			void handle?.dispose();
		};
	});
</script>

<Stack direction="row" gap="none" align="center" data-tauri-window-controls>
	<Button
		variant="ghost"
		size="small"
		aria-busy={busy || undefined}
		aria-label="Minimize window"
		onclick={() => run(() => desktop.window.minimize())}>—</Button
	>
	<Button
		variant="ghost"
		size="small"
		aria-busy={busy || undefined}
		aria-label={maximized ? 'Restore window' : 'Maximize window'}
		aria-pressed={maximized}
		onclick={() => run(() => (maximized ? desktop.window.restore() : desktop.window.maximize()))}
		>{maximized ? '❐' : '□'}</Button
	>
	<Button
		variant="danger"
		size="small"
		aria-busy={busy || undefined}
		aria-label="Close window"
		onclick={() => run(() => desktop.window.close({ confirmed: true }))}>×</Button
	>
</Stack>
