import { getContext, setContext } from 'svelte';

import type { DesktopPlatform } from '../../platform/types.js';

const DESKTOP_PLATFORM_CONTEXT = Symbol('zadmin.webview.desktop-platform');

export function provideDesktopPlatform(getPlatform: () => DesktopPlatform): void {
	setContext(DESKTOP_PLATFORM_CONTEXT, {
		get platform() {
			return getPlatform();
		}
	});
}

export function useDesktopPlatform(): DesktopPlatform {
	const context = getContext<{ readonly platform: DesktopPlatform } | undefined>(
		DESKTOP_PLATFORM_CONTEXT
	);
	if (!context)
		throw new Error('DesktopProvider is required for @zadmin/webview/svelte components.');
	return context.platform;
}
