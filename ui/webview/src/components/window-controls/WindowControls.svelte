<script lang="ts">
	import { onMount } from 'svelte';
	import { ZButton, ZIcon, ZStack } from '@zadmin/zui';

	import type { DesktopResult } from '../../platform/types.js';
	import { useDesktopPlatform } from '../provider/context.js';
	import type { WindowControlsProps } from './types.js';

	let { onerror }: WindowControlsProps = $props();
	const desktop = useDesktopPlatform();
	let maximized = $state(false);
	let busy = $state(false);
	let queue = Promise.resolve();

	async function refresh(): Promise<void> {
		const result = await desktop.window.snapshot();
		if (result.ok) maximized = result.value.maximized;
		else onerror?.(result.error);
	}

	function run(action: () => Promise<DesktopResult<void>>): Promise<void> {
		busy = true;
		const task = queue.then(async () => {
			const result = await action();
			if (!result.ok) onerror?.(result.error);
			await refresh();
		});
		queue = task.catch(() => undefined);
		return task.finally(() => {
			busy = false;
		});
	}

	onMount(() => {
		let active = true;
		let dispose = () => Promise.resolve();
		void refresh();
		void desktop.window
			.listen((snapshot) => {
				if (active) maximized = snapshot.maximized;
			})
			.then((result) => {
				if (result.ok) dispose = () => result.value.dispose();
				else onerror?.(result.error);
			});
		return () => {
			active = false;
			void dispose();
		};
	});
</script>

<ZStack direction="row" gap="none" align="center" data-webview-window-controls>
	<ZButton
		variant="ghost"
		size="small"
		aria-busy={busy || undefined}
		aria-label="Minimize window"
		onclick={() => run(() => desktop.window.minimize())}
		><ZIcon aria-hidden="true" name="minimize" size={15} /></ZButton
	>
	<ZButton
		variant="ghost"
		size="small"
		aria-busy={busy || undefined}
		aria-label={maximized ? 'Restore window' : 'Maximize window'}
		aria-pressed={maximized}
		onclick={() => run(() => (maximized ? desktop.window.restore() : desktop.window.maximize()))}
		><ZIcon aria-hidden="true" name={maximized ? 'restore' : 'maximize'} size={15} /></ZButton
	>
	<ZButton
		tone="danger"
		size="small"
		aria-busy={busy || undefined}
		aria-label="Close window"
		onclick={() => run(() => desktop.window.close())}
		><ZIcon aria-hidden="true" name="close" size={15} /></ZButton
	>
</ZStack>
