<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button, type ButtonProps } from '@zadmin/zui-svelte';

	import type { DesktopError } from '../runtime/error.js';
	import { useDesktopPlatform } from './context.js';
	import type { DesktopClipboardMode } from './types.js';

	type Props = Omit<ButtonProps, 'children' | 'onclick' | 'onerror'> & {
		children?: Snippet;
		label?: string;
		mode?: DesktopClipboardMode;
		onerror?: (error: DesktopError) => void;
		onread?: (text: string) => void;
		onsuccess?: () => void;
		text?: string;
	};

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
	}: Props = $props();
	const desktop = useDesktopPlatform();
	let loading = $state(false);

	async function useClipboard(): Promise<void> {
		if (loading || disabled) return;
		loading = true;
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
		loading = false;
	}
</script>

<Button {...rest} {disabled} {loading} onclick={useClipboard}>
	{#if children}{@render children()}{:else}{label}{/if}
</Button>
