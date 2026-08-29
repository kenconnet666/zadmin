<script lang="ts">
	import { ZButton } from '@zadmin/zui';

	import { useDesktopPlatform } from '../provider/context.js';
	import type { NotificationButtonProps } from './types.js';

	let {
		children,
		disabled = false,
		label = 'Send notification',
		notification,
		onerror,
		onpermission,
		onsuccess,
		...rest
	}: NotificationButtonProps = $props();
	const desktop = useDesktopPlatform();
	let loading = $state(false);

	async function notify(): Promise<void> {
		if (loading || disabled) return;
		loading = true;
		try {
			let permission = await desktop.notification.permission();
			if (!permission.ok) {
				onerror?.(permission.error);
				return;
			}
			if (permission.value === 'default')
				permission = await desktop.notification.requestPermission();
			if (!permission.ok) {
				onerror?.(permission.error);
				return;
			}
			onpermission?.(permission.value);
			if (permission.value !== 'granted') return;
			const result = await desktop.notification.send(notification);
			if (result.ok) onsuccess?.();
			else onerror?.(result.error);
		} finally {
			loading = false;
		}
	}
</script>

<ZButton {...rest} {disabled} {loading} onclick={notify}>
	{#if children}{@render children()}{:else}{label}{/if}
</ZButton>
