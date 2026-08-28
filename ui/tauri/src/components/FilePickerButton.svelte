<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button, type ButtonProps } from '@zadmin/zui';

	import type { DesktopError } from '../runtime/error.js';
	import { useDesktopPlatform } from './context.js';
	import type { DesktopFilePickerMode, DesktopFileSelection } from './types.js';

	type Props = Omit<ButtonProps, 'children' | 'onclick' | 'onerror' | 'onselect'> & {
		children?: Snippet;
		label?: string;
		mode?: DesktopFilePickerMode;
		multiple?: boolean;
		onerror?: (error: DesktopError) => void;
		onselect?: (selection: DesktopFileSelection) => void;
	};

	let {
		children,
		disabled = false,
		label = 'Choose file',
		mode = 'file',
		multiple = false,
		onerror,
		onselect,
		...rest
	}: Props = $props();
	const desktop = useDesktopPlatform();
	let loading = $state(false);

	async function choose(): Promise<void> {
		if (loading || disabled) return;
		loading = true;
		const result =
			mode === 'save'
				? await desktop.dialog.save()
				: await desktop.dialog.open({ directory: mode === 'directory', multiple });
		loading = false;
		if (result.ok) onselect?.(result.value);
		else onerror?.(result.error);
	}
</script>

<Button {...rest} {disabled} {loading} onclick={choose}>
	{#if children}{@render children()}{:else}{label}{/if}
</Button>
