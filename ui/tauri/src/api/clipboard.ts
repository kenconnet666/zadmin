import { clear, readText, writeText } from '@tauri-apps/plugin-clipboard-manager';

import type { DesktopAvailability } from '../runtime/environment.js';
import { captureDesktop, unsupportedDesktop, type DesktopResult } from '../runtime/error.js';

export interface DesktopClipboardApi {
	readonly availability: DesktopAvailability;
	clear(): Promise<DesktopResult<void>>;
	readText(): Promise<DesktopResult<string>>;
	writeText(text: string): Promise<DesktopResult<void>>;
}

export function createClipboardApi(availability: DesktopAvailability): DesktopClipboardApi {
	return {
		availability,
		clear: () => captureDesktop('clipboard.clear', () => clear()),
		readText: () => captureDesktop('clipboard.readText', () => readText()),
		writeText: (text) => captureDesktop('clipboard.writeText', () => writeText(text))
	};
}

export function createUnsupportedClipboardApi(
	availability: DesktopAvailability
): DesktopClipboardApi {
	return {
		availability,
		clear: () => unsupportedDesktop('clipboard.clear', availability.reason),
		readText: () => unsupportedDesktop('clipboard.readText', availability.reason),
		writeText: () => unsupportedDesktop('clipboard.writeText', availability.reason)
	};
}
