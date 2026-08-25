import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	const windowCallbacks: Array<() => void> = [];
	const store = {
		clear: vi.fn(async () => undefined),
		delete: vi.fn(async () => true),
		get: vi.fn(async () => ({ enabled: true })),
		has: vi.fn(async () => true),
		keys: vi.fn(async () => ['setting']),
		save: vi.fn(async () => undefined),
		set: vi.fn(async () => undefined)
	};
	const currentWindow = {
		close: vi.fn(async () => undefined),
		isFocused: vi.fn(async () => true),
		isMaximized: vi.fn(async () => false),
		maximize: vi.fn(async () => undefined),
		minimize: vi.fn(async () => undefined),
		onFocusChanged: vi.fn(async (callback: () => void) => {
			windowCallbacks.push(callback);
			return vi.fn();
		}),
		onResized: vi.fn(async (callback: () => void) => {
			windowCallbacks.push(callback);
			return vi.fn();
		}),
		scaleFactor: vi.fn(async () => 1.25),
		startDragging: vi.fn(async () => undefined),
		theme: vi.fn(async () => 'dark' as const),
		toggleMaximize: vi.fn(async () => undefined),
		unmaximize: vi.fn(async () => undefined)
	};
	return {
		app: {
			getIdentifier: vi.fn(async () => 'dev.zadmin.desktop'),
			getName: vi.fn(async () => 'ZAdmin Desktop'),
			getTauriVersion: vi.fn(async () => '2.11.5'),
			getVersion: vi.fn(async () => '0.1.0')
		},
		clipboard: {
			clear: vi.fn(async () => undefined),
			readText: vi.fn(async () => 'clipboard'),
			writeText: vi.fn(async () => undefined)
		},
		currentWindow,
		dialog: {
			confirm: vi.fn(async () => true),
			message: vi.fn(async () => 'Ok' as const),
			open: vi.fn(async () => 'C:\\probe.txt'),
			save: vi.fn(async () => 'C:\\saved.txt')
		},
		fs: {
			exists: vi.fn(async () => true),
			mkdir: vi.fn(async () => undefined),
			readDir: vi.fn(async () => []),
			readTextFile: vi.fn(async () => 'ready'),
			remove: vi.fn(async () => undefined),
			stat: vi.fn(async () => ({ isFile: true, size: 5 })),
			unwatch: vi.fn(),
			watch: vi.fn(async () => mocks.fs.unwatch),
			writeTextFile: vi.fn(async () => undefined)
		},
		isTauri: vi.fn(() => true),
		log: {
			attachLogger: vi.fn(async (listener: (record: unknown) => void) => {
				listener({ level: 3, message: 'attached' });
				return vi.fn();
			}),
			debug: vi.fn(async () => undefined),
			error: vi.fn(async () => undefined),
			info: vi.fn(async () => undefined),
			trace: vi.fn(async () => undefined),
			warn: vi.fn(async () => undefined)
		},
		notification: {
			isPermissionGranted: vi.fn(async () => true),
			requestPermission: vi.fn(async () => 'granted' as NotificationPermission),
			sendNotification: vi.fn()
		},
		opener: { openUrl: vi.fn(async () => undefined) },
		os: {
			arch: vi.fn(() => 'x86_64' as const),
			locale: vi.fn(async () => 'zh-CN'),
			platform: vi.fn(() => 'windows' as const),
			version: vi.fn(() => 'Windows 11')
		},
		process: {
			exit: vi.fn(async () => undefined),
			relaunch: vi.fn(async () => undefined)
		},
		store,
		window: {
			currentMonitor: vi.fn(async () => ({
				name: 'Monitor',
				position: { x: 0, y: 0 },
				scaleFactor: 1.25,
				size: { height: 1440, width: 2560 },
				workArea: {
					position: { x: 0, y: 0 },
					size: { height: 1392, width: 2560 }
				}
			})),
			getCurrentWindow: vi.fn(() => currentWindow)
		},
		windowState: {
			filename: vi.fn(async () => 'window-state.json'),
			restoreStateCurrent: vi.fn(async () => undefined),
			saveWindowState: vi.fn(async () => undefined)
		},
		windowCallbacks
	};
});

vi.mock('@tauri-apps/api/app', () => mocks.app);
vi.mock('@tauri-apps/api/core', () => ({ isTauri: mocks.isTauri }));
vi.mock('@tauri-apps/api/window', () => mocks.window);
vi.mock('@tauri-apps/plugin-clipboard-manager', () => mocks.clipboard);
vi.mock('@tauri-apps/plugin-dialog', () => mocks.dialog);
vi.mock('@tauri-apps/plugin-fs', () => mocks.fs);
vi.mock('@tauri-apps/plugin-log', () => ({
	...mocks.log,
	LogLevel: { Debug: 2, Error: 5, Info: 3, Trace: 1, Warn: 4 }
}));
vi.mock('@tauri-apps/plugin-notification', () => mocks.notification);
vi.mock('@tauri-apps/plugin-opener', () => mocks.opener);
vi.mock('@tauri-apps/plugin-os', () => mocks.os);
vi.mock('@tauri-apps/plugin-process', () => mocks.process);
vi.mock('@tauri-apps/plugin-store', () => ({ load: vi.fn(async () => mocks.store) }));
vi.mock('@tauri-apps/plugin-window-state', () => mocks.windowState);

import {
	createAppApi,
	createClipboardApi,
	createDialogApi,
	createFilesystemApi,
	createLogApi,
	createNotificationApi,
	createOpenerApi,
	createOsApi,
	createProcessApi,
	createStoreApi,
	createTauriDesktopPlatform,
	createWindowApi,
	createWindowStateApi,
	desktopAvailability
} from '../src/index.js';
import { expectDesktopOk } from '../src/testing/index.js';

const availability = desktopAvailability('tauri');

beforeEach(() => {
	vi.clearAllMocks();
	mocks.windowCallbacks.length = 0;
	mocks.isTauri.mockReturnValue(true);
});

describe('Tauri API adapters', () => {
	it('reads app and OS snapshots', async () => {
		expect(expectDesktopOk(await createAppApi(availability).snapshot())).toMatchObject({
			identifier: 'dev.zadmin.desktop',
			name: 'ZAdmin Desktop'
		});
		expect(expectDesktopOk(await createOsApi(availability).snapshot())).toMatchObject({
			arch: 'x86_64',
			platform: 'windows'
		});
	});

	it('wraps clipboard and dialogs', async () => {
		const clipboard = createClipboardApi(availability);
		expectDesktopOk(await clipboard.writeText('ready'));
		expect(expectDesktopOk(await clipboard.readText())).toBe('clipboard');
		expectDesktopOk(await clipboard.clear());

		const dialog = createDialogApi(availability);
		expect(expectDesktopOk(await dialog.open({ multiple: false }))).toBe('C:\\probe.txt');
		expect(expectDesktopOk(await dialog.save())).toBe('C:\\saved.txt');
		expect(expectDesktopOk(await dialog.confirm('continue?'))).toBe(true);
		expect(expectDesktopOk(await dialog.message('ready'))).toBe('Ok');
	});

	it('wraps scoped filesystem calls and watcher cleanup', async () => {
		const filesystem = createFilesystemApi(availability);
		expectDesktopOk(await filesystem.mkdir('probe'));
		expect(expectDesktopOk(await filesystem.exists('probe.txt'))).toBe(true);
		expect(expectDesktopOk(await filesystem.readDir('probe'))).toEqual([]);
		expect(expectDesktopOk(await filesystem.readText('probe.txt'))).toBe('ready');
		expectDesktopOk(await filesystem.writeText('probe.txt', 'ready'));
		expect(expectDesktopOk(await filesystem.stat('probe.txt'))).toMatchObject({ size: 5 });
		const handle = expectDesktopOk(await filesystem.watch('probe.txt', vi.fn()));
		await handle.dispose();
		expect(mocks.fs.unwatch).toHaveBeenCalledOnce();
		expectDesktopOk(await filesystem.remove('probe.txt'));
	});

	it('wraps logs, notifications, and HTTPS opener policy', async () => {
		const logs = createLogApi(availability);
		const listener = vi.fn();
		const handle = expectDesktopOk(await logs.attach(listener));
		expect(listener).toHaveBeenCalledWith({ level: 3, message: 'attached' });
		await handle.dispose();
		for (const method of ['debug', 'error', 'info', 'trace', 'warn'] as const) {
			expectDesktopOk(await logs[method]('message'));
		}

		const notification = createNotificationApi(availability);
		expect(expectDesktopOk(await notification.isPermissionGranted())).toBe(true);
		expect(expectDesktopOk(await notification.requestPermission())).toBe('granted');
		expectDesktopOk(await notification.send('ready'));

		const opener = createOpenerApi(availability, {
			allowedOrigins: ['https://v2.tauri.app']
		});
		expectDesktopOk(await opener.openUrl('https://v2.tauri.app/plugin/'));
		expect(await opener.openUrl('https://example.com')).toMatchObject({ ok: false });
	});

	it('wraps process, store, and window-state calls', async () => {
		const process = createProcessApi(availability);
		expectDesktopOk(await process.exit({ confirmed: true }, 0));
		expectDesktopOk(await process.relaunch({ confirmed: true }));
		expect(await process.exit(undefined as never)).toMatchObject({
			error: { code: 'invalid-input' },
			ok: false
		});

		const store = createStoreApi(availability, 'settings.json');
		expectDesktopOk(await store.set('setting', { enabled: true }));
		expect(expectDesktopOk(await store.get('setting'))).toEqual({ enabled: true });
		expect(expectDesktopOk(await store.has('setting'))).toBe(true);
		expect(expectDesktopOk(await store.keys())).toEqual(['setting']);
		expect(expectDesktopOk(await store.delete('setting'))).toBe(true);
		expectDesktopOk(await store.clear());
		expectDesktopOk(await store.save());
		expect(await store.set('bad', Number.NaN as never)).toMatchObject({
			error: { code: 'invalid-input' },
			ok: false
		});
		mocks.store.get.mockResolvedValueOnce(new Date() as never);
		expect(await store.get('invalid')).toMatchObject({
			error: { code: 'transport-error' },
			ok: false
		});

		const windowState = createWindowStateApi(availability);
		expect(expectDesktopOk(await windowState.filename())).toBe('window-state.json');
		expectDesktopOk(await windowState.restore());
		expectDesktopOk(await windowState.save());
	});

	it('wraps window snapshots, actions, events, and cleanup', async () => {
		const window = createWindowApi(availability);
		expect(expectDesktopOk(await window.snapshot())).toMatchObject({
			focused: true,
			monitor: { scaleFactor: 1.25 },
			scaleFactor: 1.25,
			theme: 'dark'
		});
		expectDesktopOk(await window.maximize());
		expectDesktopOk(await window.minimize());
		expectDesktopOk(await window.restore());
		expectDesktopOk(await window.toggleMaximize());
		expectDesktopOk(await window.startDragging());
		expectDesktopOk(await window.close({ confirmed: true }));
		expect(await window.close(undefined as never)).toMatchObject({ ok: false });

		const listener = vi.fn();
		const handle = expectDesktopOk(await window.listen(listener));
		for (const callback of mocks.windowCallbacks) callback();
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(listener).toHaveBeenCalled();
		await handle.dispose();
		mocks.window.currentMonitor.mockResolvedValueOnce(null as never);
		expect(expectDesktopOk(await window.snapshot()).monitor).toBeNull();
	});

	it('assembles the real driver only in a Tauri runtime', async () => {
		const platform = createTauriDesktopPlatform(
			{
				opener: { allowedOrigins: ['https://v2.tauri.app'] }
			},
			'tauri'
		);
		expect(platform.environment.snapshot()).toEqual({ isTauri: true, runtime: 'tauri' });
		expect(expectDesktopOk(await platform.app.snapshot()).name).toBe('ZAdmin Desktop');

		mocks.isTauri.mockReturnValue(false);
		const browser = createTauriDesktopPlatform({ opener: { allowedOrigins: [] } });
		expect(browser.environment.snapshot().runtime).toBe('browser');
	});
});
