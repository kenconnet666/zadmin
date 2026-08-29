<script lang="ts">
	import { ZButton } from '@zadmin/zui';

	import { useDesktopPlatform } from '../provider/context.js';
	import type { ClipboardButtonProps } from './types.js';

	let {
		children,
		disabled = false,
		label = 'Copy',
		mode = 'write',
		onerror,
		onread,
		onsuccess,
		text = '',
		...rest
	}: ClipboardButtonProps = $props();
	const desktop = useDesktopPlatform();
	let loading = $state(false);

	async function useClipboard(): Promise<void> {
		if (loading || disabled) return;
		loading = true;
		try {
			if (mode === 'read') {
				const result = await desktop.clipboard.readText();
				if (result.ok) {
					onread?.(result.value);
					onsuccess?.();
				} else onerror?.(result.error);
			} else {
				const result =
					mode === 'clear'
						? await desktop.clipboard.clear()
						: await desktop.clipboard.writeText(text);
				if (result.ok) onsuccess?.();
				else onerror?.(result.error);
			}
		} finally {
			loading = false;
		}
	}
</script>

<ZButton {...rest} {disabled} {loading} onclick={useClipboard}>
	{#if children}{@render children()}{:else}{label}{/if}
</ZButton>
