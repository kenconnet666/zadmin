import {
	filename,
	restoreStateCurrent,
	saveWindowState,
	type StateFlags
} from '@tauri-apps/plugin-window-state';

import type { DesktopAvailability } from '../runtime/environment.js';
import { captureDesktop, unsupportedDesktop, type DesktopResult } from '../runtime/error.js';

export type { StateFlags } from '@tauri-apps/plugin-window-state';

export interface DesktopWindowStateApi {
	readonly availability: DesktopAvailability;
	filename(): Promise<DesktopResult<string>>;
	restore(flags?: StateFlags): Promise<DesktopResult<void>>;
	save(flags?: StateFlags): Promise<DesktopResult<void>>;
}

export function createWindowStateApi(availability: DesktopAvailability): DesktopWindowStateApi {
	return {
		availability,
		filename: () => captureDesktop('windowState.filename', () => filename()),
		restore: (flags) => captureDesktop('windowState.restore', () => restoreStateCurrent(flags)),
		save: (flags) => captureDesktop('windowState.save', () => saveWindowState(flags))
	};
}

export function createUnsupportedWindowStateApi(
	availability: DesktopAvailability
): DesktopWindowStateApi {
	return {
		availability,
		filename: () => unsupportedDesktop('windowState.filename', availability.reason),
		restore: () => unsupportedDesktop('windowState.restore', availability.reason),
		save: () => unsupportedDesktop('windowState.save', availability.reason)
	};
}
