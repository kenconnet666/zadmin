import { LogLevel } from '@tauri-apps/plugin-log';

import type { DesktopPlatform } from '../runtime/driver.js';
import { createDesktopResourceHandle } from '../runtime/context.js';
import { desktopAvailability } from '../runtime/environment.js';
import { desktopOk, type DesktopResult } from '../runtime/error.js';
import { validateExternalUrl } from '../runtime/scope.js';
import type { DesktopAppSnapshot } from '../api/app.js';
import type { OpenDialogOptions, OpenDialogReturn } from '../api/dialog.js';
import type { FileInfo, WatchEvent } from '../api/filesystem.js';
import type { DesktopLogRecord } from '../api/log.js';
import type { DesktopNotificationOptions } from '../api/notification.js';
import type { DesktopOsSnapshot } from '../api/os.js';
import type { JsonValue } from '../api/store.js';
import type { DesktopUpdate } from '../api/updater.js';
import type { DesktopWindowSnapshot } from '../api/window.js';
import { fakeAppSnapshot, fakeOsSnapshot, fakeWindowSnapshot } from './fixtures.js';

export interface FakeDesktopState {
	app: DesktopAppSnapshot;
	clipboard: string;
	dialog: {
		confirm: boolean;
		message: 'Cancel' | 'No' | 'Ok' | 'Yes';
		open: string | string[] | null;
		save: string | null;
	};
	exitCodes: number[];
	files: Map<string, string>;
	logs: DesktopLogRecord[];
	notificationPermission: NotificationPermission;
	notifications: Array<DesktopNotificationOptions | string>;
	openedUrls: string[];
	os: DesktopOsSnapshot;
	relaunches: number;
	store: Map<string, JsonValue>;
	update: DesktopUpdate | null;
	window: DesktopWindowSnapshot;
	windowActions: string[];
	windowState: {
		restores: number;
		saves: number;
	};
}

export interface FakeDesktopOptions {
	readonly allowedOrigins?: readonly string[];
	readonly files?: Readonly<Record<string, string>>;
	readonly notificationPermission?: NotificationPermission;
	readonly update?: DesktopUpdate | null;
}

export interface FakeDesktopDriver {
	readonly platform: DesktopPlatform;
	readonly state: FakeDesktopState;
}

function fileInfo(contents: string): FileInfo {
	return {
		atime: null,
		birthtime: null,
		blksize: null,
		blocks: null,
		dev: null,
		fileAttributes: null,
		gid: null,
		ino: null,
		isDirectory: false,
		isFile: true,
		isSymlink: false,
		mode: null,
		mtime: null,
		nlink: null,
		readonly: false,
		rdev: null,
		size: new TextEncoder().encode(contents).byteLength,
		uid: null
	};
}

function fileKey(path: string | URL): string {
	return path instanceof URL ? path.toString() : path;
}

export function createFakeDesktopDriver(options: FakeDesktopOptions = {}): FakeDesktopDriver {
	const availability = desktopAvailability('fake');
	const state: FakeDesktopState = {
		app: { ...fakeAppSnapshot },
		clipboard: '',
		dialog: { confirm: true, message: 'Ok', open: null, save: null },
		exitCodes: [],
		files: new Map(Object.entries(options.files ?? {})),
		logs: [],
		notificationPermission: options.notificationPermission ?? 'granted',
		notifications: [],
		openedUrls: [],
		os: { ...fakeOsSnapshot },
		relaunches: 0,
		store: new Map(),
		update: options.update ?? null,
		window: structuredClone(fakeWindowSnapshot),
		windowActions: [],
		windowState: { restores: 0, saves: 0 }
	};
	const fileWatchers = new Set<(event: WatchEvent) => void>();
	const logListeners = new Set<(record: DesktopLogRecord) => void>();
	const windowListeners = new Set<(snapshot: DesktopWindowSnapshot) => void>();
	const log = (record: DesktopLogRecord) => {
		state.logs.push(record);
		for (const listener of logListeners) listener(record);
	};
	const windowAction = (action: string) => {
		state.windowActions.push(action);
		for (const listener of windowListeners) listener(structuredClone(state.window));
	};
	const emitFile = (path: string, kind: 'create' | 'modify' | 'remove') => {
		const event: WatchEvent = {
			attrs: null,
			paths: [path],
			type: { [kind]: { kind: 'file' } }
		} as WatchEvent;
		for (const listener of fileWatchers) listener(event);
	};
	const allowedOrigins = options.allowedOrigins ?? ['https://v2.tauri.app'];

	const platform: DesktopPlatform = {
		app: { availability, snapshot: async () => desktopOk({ ...state.app }) },
		clipboard: {
			availability,
			clear: async () => {
				state.clipboard = '';
				return desktopOk(undefined);
			},
			readText: async () => desktopOk(state.clipboard),
			writeText: async (text) => {
				state.clipboard = text;
				return desktopOk(undefined);
			}
		},
		dialog: {
			availability,
			confirm: async () => desktopOk(state.dialog.confirm),
			message: async () => desktopOk(state.dialog.message),
			open: async <TOptions extends OpenDialogOptions>() =>
				desktopOk(state.dialog.open as OpenDialogReturn<TOptions>),
			save: async () => desktopOk(state.dialog.save)
		},
		environment: {
			availability,
			snapshot: () => ({ isTauri: false, runtime: 'fake' })
		},
		filesystem: {
			availability,
			exists: async (path) => desktopOk(state.files.has(fileKey(path))),
			mkdir: async () => desktopOk(undefined),
			readDir: async () => desktopOk([]),
			readText: async (path) => desktopOk(state.files.get(fileKey(path)) ?? ''),
			remove: async (path) => {
				const key = fileKey(path);
				state.files.delete(key);
				emitFile(key, 'remove');
				return desktopOk(undefined);
			},
			stat: async (path) => desktopOk(fileInfo(state.files.get(fileKey(path)) ?? '')),
			watch: async (_paths, listener) => {
				fileWatchers.add(listener);
				return desktopOk(
					createDesktopResourceHandle(() => {
						fileWatchers.delete(listener);
					})
				);
			},
			writeText: async (path, contents) => {
				const key = fileKey(path);
				const existed = state.files.has(key);
				state.files.set(key, contents);
				emitFile(key, existed ? 'modify' : 'create');
				return desktopOk(undefined);
			}
		},
		log: {
			availability,
			attach: async (listener) => {
				logListeners.add(listener);
				return desktopOk(
					createDesktopResourceHandle(() => {
						logListeners.delete(listener);
					})
				);
			},
			debug: async (message) => {
				log({ level: LogLevel.Debug, message });
				return desktopOk(undefined);
			},
			error: async (message) => {
				log({ level: LogLevel.Error, message });
				return desktopOk(undefined);
			},
			info: async (message) => {
				log({ level: LogLevel.Info, message });
				return desktopOk(undefined);
			},
			trace: async (message) => {
				log({ level: LogLevel.Trace, message });
				return desktopOk(undefined);
			},
			warn: async (message) => {
				log({ level: LogLevel.Warn, message });
				return desktopOk(undefined);
			}
		},
		notification: {
			availability,
			isPermissionGranted: async () => desktopOk(state.notificationPermission === 'granted'),
			requestPermission: async () => desktopOk(state.notificationPermission),
			send: async (notification) => {
				state.notifications.push(notification);
				return desktopOk(undefined);
			}
		},
		opener: {
			availability,
			policy: { allowedOrigins },
			openUrl: async (value) => {
				const validated = validateExternalUrl(value, { allowedOrigins });
				if (!validated.ok) return validated;
				state.openedUrls.push(validated.value.toString());
				return desktopOk(undefined);
			}
		},
		os: { availability, snapshot: async () => desktopOk({ ...state.os }) },
		process: {
			availability,
			exit: async (_action, code = 0) => {
				state.exitCodes.push(code);
				return desktopOk(undefined);
			},
			relaunch: async () => {
				state.relaunches += 1;
				return desktopOk(undefined);
			}
		},
		store: {
			availability,
			filename: 'settings.json',
			clear: async () => {
				state.store.clear();
				return desktopOk(undefined);
			},
			delete: async (key) => desktopOk(state.store.delete(key)),
			get: async (key) => desktopOk(state.store.get(key) ?? null),
			has: async (key) => desktopOk(state.store.has(key)),
			keys: async () => desktopOk([...state.store.keys()]),
			save: async () => desktopOk(undefined),
			set: async (key, value) => {
				state.store.set(key, value);
				return desktopOk(undefined);
			}
		},
		updater: {
			availability,
			check: async () => desktopOk(state.update)
		},
		window: {
			availability,
			close: async () => {
				windowAction('close');
				return desktopOk(undefined);
			},
			listen: async (listener) => {
				windowListeners.add(listener);
				return desktopOk(
					createDesktopResourceHandle(() => {
						windowListeners.delete(listener);
					})
				);
			},
			maximize: async () => {
				state.window = { ...state.window, maximized: true };
				windowAction('maximize');
				return desktopOk(undefined);
			},
			minimize: async () => {
				windowAction('minimize');
				return desktopOk(undefined);
			},
			restore: async () => {
				state.window = { ...state.window, maximized: false };
				windowAction('restore');
				return desktopOk(undefined);
			},
			snapshot: async () => desktopOk(structuredClone(state.window)),
			startDragging: async () => {
				windowAction('startDragging');
				return desktopOk(undefined);
			},
			toggleMaximize: async () => {
				state.window = { ...state.window, maximized: !state.window.maximized };
				windowAction('toggleMaximize');
				return desktopOk(undefined);
			}
		},
		windowState: {
			availability,
			filename: async () => desktopOk('window-state.json'),
			restore: async () => {
				state.windowState.restores += 1;
				return desktopOk(undefined);
			},
			save: async () => {
				state.windowState.saves += 1;
				return desktopOk(undefined);
			}
		}
	};

	return { platform, state };
}

export function expectDesktopOk<T>(result: DesktopResult<T>): T {
	if (!result.ok) throw new Error(`${result.error.operation}: ${result.error.message}`);
	return result.value;
}
