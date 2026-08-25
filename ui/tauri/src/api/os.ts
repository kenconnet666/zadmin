import { arch, locale, platform, version, type Arch, type Platform } from '@tauri-apps/plugin-os';

import type { DesktopAvailability } from '../runtime/environment.js';
import { captureDesktop, unsupportedDesktop, type DesktopResult } from '../runtime/error.js';

export interface DesktopOsSnapshot {
	readonly arch: Arch;
	readonly locale: string | null;
	readonly platform: Platform;
	readonly version: string;
}

export interface DesktopOsApi {
	readonly availability: DesktopAvailability;
	snapshot(): Promise<DesktopResult<DesktopOsSnapshot>>;
}

export function createOsApi(availability: DesktopAvailability): DesktopOsApi {
	return {
		availability,
		snapshot: () =>
			captureDesktop('os.snapshot', async () => ({
				arch: arch(),
				locale: await locale(),
				platform: platform(),
				version: version()
			}))
	};
}

export function createUnsupportedOsApi(availability: DesktopAvailability): DesktopOsApi {
	return {
		availability,
		snapshot: () => unsupportedDesktop('os.snapshot', availability.reason)
	};
}
