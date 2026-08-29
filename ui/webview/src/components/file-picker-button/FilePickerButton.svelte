<script lang="ts">
	import { ZButton } from '@zadmin/zui';

	import { useDesktopPlatform } from '../provider/context.js';
	import type { FilePickerButtonProps } from './types.js';

	let {
		children,
		disabled = false,
		label = 'Choose file',
		mode = 'file',
		multiple = false,
		onerror,
		onselect,
		...rest
	}: FilePickerButtonProps = $props();
	const desktop = useDesktopPlatform();
	let loading = $state(false);

	async function choose(): Promise<void> {
		if (loading || disabled) return;
		loading = true;
		try {
			if (mode === 'save') {
				const result = await desktop.dialog.save();
				if (result.ok) onselect?.(result.value);
				else onerror?.(result.error);
				return;
			}
			const result = await desktop.dialog.open({ directory: mode === 'directory', multiple });
			if (result.ok) onselect?.(multiple ? result.value : (result.value[0] ?? null));
			else onerror?.(result.error);
		} finally {
			loading = false;
		}
	}
</script>

<ZButton {...rest} {disabled} {loading} onclick={choose}>
	{#if children}{@render children()}{:else}{label}{/if}
</ZButton>
