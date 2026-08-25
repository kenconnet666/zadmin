import { getContext, setContext } from 'svelte';

import { DESKTOP_PLATFORM_CONTEXT } from '../runtime/context.js';
import type { DesktopPlatform } from '../runtime/driver.js';

interface DesktopPlatformContext {
	readonly platform: DesktopPlatform;
}

export function provideDesktopPlatform(getPlatform: () => DesktopPlatform): DesktopPlatformContext {
	const context: DesktopPlatformContext = {
		get platform() {
			return getPlatform();
		}
	};
	setContext(DESKTOP_PLATFORM_CONTEXT, context);
	return context;
}

export function useDesktopPlatform(): DesktopPlatform {
	const context = getContext<DesktopPlatformContext | undefined>(DESKTOP_PLATFORM_CONTEXT);
	if (!context) {
		throw new Error('Desktop components must be rendered inside DesktopProvider.');
	}
	return context.platform;
}
