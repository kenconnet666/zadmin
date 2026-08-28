<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ZButton, type ZButtonProps } from '@zadmin/zui';

	import type { DesktopNotificationOptions } from '../api/notification.js';
	import type { DesktopError } from '../runtime/error.js';
	import { useDesktopPlatform } from './context.js';

	type Props = Omit<ZButtonProps, 'children' | 'onclick' | 'onerror'> & {
		children?: Snippet;
		label?: string;
		notification: DesktopNotificationOptions | string;
		onerror?: (error: DesktopError) => void;
		onpermission?: (permission: NotificationPermission) => void;
		onsuccess?: () => void;
	};

	let {
		children,
		disabled = false,
		label = 'Send notification',
		notification,
		onerror,
		onpermission,
		onsuccess,
		...rest
	}: Props = $props();
	const desktop = useDesktopPlatform();
	let loading = $state(false);

	async function notify(): Promise<void> {
		if (loading || disabled) return;
		loading = true;
		const granted = await desktop.notification.isPermissionGranted();
		if (!granted.ok) {
			onerror?.(granted.error);
			loading = false;
			return;
		}
		let permission: NotificationPermission = granted.value ? 'granted' : 'default';
		if (!granted.value) {
			const requested = await desktop.notification.requestPermission();
			if (!requested.ok) {
				onerror?.(requested.error);
				loading = false;
				return;
			}
			permission = requested.value;
		}
		onpermission?.(permission);
		if (permission === 'granted') {
			const sent = await desktop.notification.send(notification);
			if (sent.ok) onsuccess?.();
			else onerror?.(sent.error);
		}
		loading = false;
	}
</script>

<ZButton {...rest} {disabled} {loading} onclick={notify}>
	{#if children}{@render children()}{:else}{label}{/if}
</ZButton>
