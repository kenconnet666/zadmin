import { isTauri } from '@tauri-apps/api/core';

export type DesktopRuntime = 'browser' | 'fake' | 'tauri';

export interface DesktopAvailability {
	readonly available: boolean;
	readonly reason?: string;
	readonly runtime: DesktopRuntime;
}

export interface DesktopEnvironmentSnapshot {
	readonly isTauri: boolean;
	readonly runtime: DesktopRuntime;
}

export interface DesktopEnvironmentApi {
	readonly availability: DesktopAvailability;
	snapshot(): DesktopEnvironmentSnapshot;
}

export function detectDesktopRuntime(): Exclude<DesktopRuntime, 'fake'> {
	return typeof window !== 'undefined' && isTauri() ? 'tauri' : 'browser';
}

export function desktopAvailability(runtime: DesktopRuntime, reason?: string): DesktopAvailability {
	return {
		available: runtime === 'fake' || runtime === 'tauri',
		reason: runtime === 'browser' ? (reason ?? 'Tauri runtime is not available.') : reason,
		runtime
	};
}

export function createEnvironmentApi(runtime = detectDesktopRuntime()): DesktopEnvironmentApi {
	const availability = desktopAvailability(runtime);
	return {
		availability,
		snapshot: () => ({ isTauri: runtime === 'tauri', runtime })
	};
}
