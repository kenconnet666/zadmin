import type { DesktopAvailability, DesktopRuntime } from '../runtime/environment.js';
import { unsupportedDesktop, type DesktopResult } from '../runtime/error.js';

export interface DesktopUpdate {
	readonly body?: string;
	readonly currentVersion: string;
	readonly date?: string;
	readonly version: string;
}

export interface DesktopUpdaterApi {
	readonly availability: DesktopAvailability;
	check(): Promise<DesktopResult<DesktopUpdate | null>>;
}

export function createDisabledUpdaterApi(
	reason: string,
	runtime: Exclude<DesktopRuntime, 'fake'> = 'browser'
): DesktopUpdaterApi {
	const availability: DesktopAvailability = { available: false, reason, runtime };
	return {
		availability,
		check: () => unsupportedDesktop('updater.check', reason)
	};
}
