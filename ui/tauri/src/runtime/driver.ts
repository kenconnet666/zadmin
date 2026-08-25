import { createAppApi, createUnsupportedAppApi, type DesktopAppApi } from '../api/app.js';
import {
	createClipboardApi,
	createUnsupportedClipboardApi,
	type DesktopClipboardApi
} from '../api/clipboard.js';
import {
	createDialogApi,
	createUnsupportedDialogApi,
	type DesktopDialogApi
} from '../api/dialog.js';
import {
	createFilesystemApi,
	createUnsupportedFilesystemApi,
	type DesktopFilesystemApi
} from '../api/filesystem.js';
import { createLogApi, createUnsupportedLogApi, type DesktopLogApi } from '../api/log.js';
import {
	createNotificationApi,
	createUnsupportedNotificationApi,
	type DesktopNotificationApi
} from '../api/notification.js';
import {
	createOpenerApi,
	createUnsupportedOpenerApi,
	type DesktopOpenerApi
} from '../api/opener.js';
import { createOsApi, createUnsupportedOsApi, type DesktopOsApi } from '../api/os.js';
import {
	createProcessApi,
	createUnsupportedProcessApi,
	type DesktopProcessApi
} from '../api/process.js';
import { createStoreApi, createUnsupportedStoreApi, type DesktopStoreApi } from '../api/store.js';
import { createDisabledUpdaterApi, type DesktopUpdaterApi } from '../api/updater.js';
import {
	createWindowApi,
	createUnsupportedWindowApi,
	type DesktopWindowApi
} from '../api/window.js';
import {
	createUnsupportedWindowStateApi,
	createWindowStateApi,
	type DesktopWindowStateApi
} from '../api/window-state.js';
import {
	createEnvironmentApi,
	desktopAvailability,
	detectDesktopRuntime,
	type DesktopEnvironmentApi,
	type DesktopRuntime
} from './environment.js';

export interface DesktopPlatform {
	readonly app: DesktopAppApi;
	readonly clipboard: DesktopClipboardApi;
	readonly dialog: DesktopDialogApi;
	readonly environment: DesktopEnvironmentApi;
	readonly filesystem: DesktopFilesystemApi;
	readonly log: DesktopLogApi;
	readonly notification: DesktopNotificationApi;
	readonly opener: DesktopOpenerApi;
	readonly os: DesktopOsApi;
	readonly process: DesktopProcessApi;
	readonly store: DesktopStoreApi;
	readonly updater: DesktopUpdaterApi;
	readonly window: DesktopWindowApi;
	readonly windowState: DesktopWindowStateApi;
}

export interface DesktopPlatformOptions {
	readonly opener: {
		readonly allowedOrigins: readonly string[];
	};
	readonly store?: {
		readonly filename?: string;
	};
}

export function createTauriDesktopPlatform(
	options: DesktopPlatformOptions,
	runtime = detectDesktopRuntime()
): DesktopPlatform {
	if (runtime !== 'tauri') return createUnsupportedDesktopPlatform(runtime);
	const availability = desktopAvailability(runtime);
	return {
		app: createAppApi(availability),
		clipboard: createClipboardApi(availability),
		dialog: createDialogApi(availability),
		environment: createEnvironmentApi(runtime),
		filesystem: createFilesystemApi(availability),
		log: createLogApi(availability),
		notification: createNotificationApi(availability),
		opener: createOpenerApi(availability, options.opener),
		os: createOsApi(availability),
		process: createProcessApi(availability),
		store: createStoreApi(availability, options.store?.filename ?? 'settings.json'),
		updater: createDisabledUpdaterApi(
			'Updater integration is disabled in the first release.',
			'tauri'
		),
		window: createWindowApi(availability),
		windowState: createWindowStateApi(availability)
	};
}

export function createUnsupportedDesktopPlatform(
	runtime: Exclude<DesktopRuntime, 'fake' | 'tauri'> = 'browser'
): DesktopPlatform {
	const availability = desktopAvailability(runtime);
	return {
		app: createUnsupportedAppApi(availability),
		clipboard: createUnsupportedClipboardApi(availability),
		dialog: createUnsupportedDialogApi(availability),
		environment: createEnvironmentApi(runtime),
		filesystem: createUnsupportedFilesystemApi(availability),
		log: createUnsupportedLogApi(availability),
		notification: createUnsupportedNotificationApi(availability),
		opener: createUnsupportedOpenerApi(availability),
		os: createUnsupportedOsApi(availability),
		process: createUnsupportedProcessApi(availability),
		store: createUnsupportedStoreApi(availability),
		updater: createDisabledUpdaterApi('Updater integration is unavailable outside Tauri.'),
		window: createUnsupportedWindowApi(availability),
		windowState: createUnsupportedWindowStateApi(availability)
	};
}
