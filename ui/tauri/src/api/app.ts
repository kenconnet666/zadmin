import { getIdentifier, getName, getTauriVersion, getVersion } from '@tauri-apps/api/app';

import type { DesktopAvailability } from '../runtime/environment.js';
import { captureDesktop, unsupportedDesktop, type DesktopResult } from '../runtime/error.js';

export interface DesktopAppSnapshot {
	readonly identifier: string;
	readonly name: string;
	readonly tauriVersion: string;
	readonly version: string;
}

export interface DesktopAppApi {
	readonly availability: DesktopAvailability;
	snapshot(): Promise<DesktopResult<DesktopAppSnapshot>>;
}

export function createAppApi(availability: DesktopAvailability): DesktopAppApi {
	return {
		availability,
		snapshot: () =>
			captureDesktop('app.snapshot', async () => {
				const [identifier, name, tauriVersion, version] = await Promise.all([
					getIdentifier(),
					getName(),
					getTauriVersion(),
					getVersion()
				]);
				return { identifier, name, tauriVersion, version };
			})
	};
}

export function createUnsupportedAppApi(availability: DesktopAvailability): DesktopAppApi {
	return {
		availability,
		snapshot: () => unsupportedDesktop('app.snapshot', availability.reason)
	};
}
