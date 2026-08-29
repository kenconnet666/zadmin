import {
	WEBVIEW_PROTOCOL_VERSION,
	type WebviewMethod,
	type WebviewMethodMap
} from '../generated/protocol.js';
import { createWebviewClient, type WebviewClient } from '../bridge/client.js';
import { createWebView2Transport } from '../bridge/transport.js';
import { captureDesktop, desktopFail, unsupportedDesktop } from './error.js';
import { validateExternalUrl } from './guards.js';
import { createDesktopResourceHandle, createDesktopResourceScope } from './scope.js';
import type {
	ConfirmedAction,
	DesktopAvailability,
	DesktopPlatform,
	DesktopResourceScope,
	JsonValue,
	LogRecord,
	NotificationOptions,
	OpenDialogOptions,
	SaveDialogOptions,
	WindowSnapshot
} from './types.js';

export interface DesktopPlatformOptions {
	readonly opener: { readonly allowedOrigins: readonly string[] };
	readonly requestTimeoutMs?: number;
}

function unavailable(
	operation: string,
	availability: DesktopAvailability
): Promise<import('./types.js').DesktopResult<never>> {
	return unsupportedDesktop<never>(
		operation,
		availability.reason ?? 'Desktop host is unavailable.'
	);
}

export function createUnsupportedDesktopPlatform(
	reason = 'WebView2 host is unavailable.'
): DesktopPlatform {
	const availability: DesktopAvailability = { available: false, reason, runtime: 'browser' };
	const platform: DesktopPlatform = {
		app: { availability, snapshot: () => unavailable('app.snapshot', availability) },
		clipboard: {
			availability,
			clear: () => unavailable('clipboard.clear', availability),
			readText: () => unavailable('clipboard.readText', availability),
			writeText: () => unavailable('clipboard.writeText', availability)
		},
		dialog: {
			availability,
			open: () => unavailable('dialog.open', availability),
			save: () => unavailable('dialog.save', availability)
		},
		environment: {
			snapshot: () => ({
				availability,
				origin: null,
				protocolVersion: WEBVIEW_PROTOCOL_VERSION,
				runtime: 'browser'
			})
		},
		filesystem: {
			availability,
			exists: () => unavailable('filesystem.exists', availability),
			readText: () => unavailable('filesystem.readText', availability),
			remove: () => unavailable('filesystem.remove', availability),
			writeText: () => unavailable('filesystem.writeText', availability)
		},
		log: { availability, write: () => unavailable('log.write', availability) },
		notification: {
			availability,
			permission: () => unavailable('notification.permission', availability),
			requestPermission: () => unavailable('notification.requestPermission', availability),
			send: () => unavailable('notification.send', availability)
		},
		opener: {
			availability,
			allowedOrigins: [],
			openUrl: () => unavailable('opener.openUrl', availability)
		},
		os: { availability, snapshot: () => unavailable('os.snapshot', availability) },
		process: {
			availability,
			exit: () => unavailable('process.exit', availability),
			relaunch: () => unavailable('process.relaunch', availability)
		},
		store: {
			availability,
			clear: () => unavailable('store.clear', availability),
			delete: () => unavailable('store.delete', availability),
			get: () => unavailable('store.get', availability),
			keys: () => unavailable('store.keys', availability),
			save: () => unavailable('store.save', availability),
			set: () => unavailable('store.set', availability)
		},
		updater: { availability, check: () => unavailable('updater.check', availability) },
		window: {
			availability,
			close: () => unavailable('window.close', availability),
			listen: () => unavailable('window.listen', availability),
			maximize: () => unavailable('window.maximize', availability),
			minimize: () => unavailable('window.minimize', availability),
			restore: () => unavailable('window.restore', availability),
			snapshot: () => unavailable('window.snapshot', availability),
			startDragging: () => unavailable('window.startDragging', availability),
			toggleMaximize: () => unavailable('window.toggleMaximize', availability)
		},
		windowState: {
			availability,
			restore: () => unavailable('windowState.restore', availability),
			save: () => unavailable('windowState.save', availability)
		},
		forScope: () => platform
	};
	return platform;
}

function createPlatform(
	client: WebviewClient,
	options: DesktopPlatformOptions,
	scope: DesktopResourceScope
): DesktopPlatform {
	const availability: DesktopAvailability = { available: true, runtime: 'webview' };
	const call = <TMethod extends WebviewMethod>(
		method: TMethod,
		params: WebviewMethodMap[TMethod]['params']
	) =>
		captureDesktop(method, () =>
			client.call(method, params, { timeoutMs: options.requestTimeoutMs })
		);
	const empty = {};
	return {
		app: { availability, snapshot: () => call('app.snapshot', empty) },
		clipboard: {
			availability,
			clear: () => call('clipboard.clear', empty),
			async readText() {
				const result = await call('clipboard.readText', empty);
				return result.ok ? { ok: true, value: result.value.text } : result;
			},
			writeText: (text) => call('clipboard.writeText', { text })
		},
		dialog: {
			availability,
			async open(dialogOptions: OpenDialogOptions = {}) {
				const result = await call('dialog.open', dialogOptions);
				return result.ok ? { ok: true, value: result.value.paths } : result;
			},
			async save(dialogOptions: SaveDialogOptions = {}) {
				const result = await call('dialog.save', dialogOptions);
				return result.ok ? { ok: true, value: result.value.path } : result;
			}
		},
		environment: {
			snapshot: () => ({
				availability,
				origin: client.origin,
				protocolVersion: WEBVIEW_PROTOCOL_VERSION,
				runtime: 'webview'
			})
		},
		filesystem: {
			availability,
			async exists(path) {
				const result = await call('filesystem.exists', { path });
				return result.ok ? { ok: true, value: result.value.value } : result;
			},
			async readText(path) {
				const result = await call('filesystem.readText', { path });
				return result.ok ? { ok: true, value: result.value.text } : result;
			},
			remove: (path, action) => call('filesystem.remove', { confirmed: action.confirmed, path }),
			writeText: (path, contents) => call('filesystem.writeText', { contents, path })
		},
		log: { availability, write: (record: LogRecord) => call('log.write', record) },
		notification: {
			availability,
			permission: () => call('notification.permission', empty),
			requestPermission: () => call('notification.requestPermission', empty),
			send: (notificationOptions: NotificationOptions) =>
				call('notification.send', notificationOptions)
		},
		opener: {
			availability,
			allowedOrigins: options.opener.allowedOrigins,
			async openUrl(value) {
				const validated = validateExternalUrl(value, options.opener.allowedOrigins);
				if (!validated.ok) return desktopFail(validated.error);
				return call('opener.openUrl', { url: validated.value.toString() });
			}
		},
		os: { availability, snapshot: () => call('os.snapshot', empty) },
		process: {
			availability,
			exit: (action: ConfirmedAction, code = 0) =>
				call('process.exit', { code, confirmed: action.confirmed }),
			relaunch: (action: ConfirmedAction) => call('process.relaunch', action)
		},
		store: {
			availability,
			clear: () => call('store.clear', empty),
			async delete(key) {
				const result = await call('store.delete', { key });
				return result.ok ? { ok: true, value: result.value.value } : result;
			},
			get: (key) => call('store.get', { key }),
			async keys() {
				const result = await call('store.keys', empty);
				return result.ok ? { ok: true, value: result.value.values } : result;
			},
			save: () => call('store.save', empty),
			set: (key: string, value: JsonValue) => call('store.set', { key, value })
		},
		updater: { availability, check: () => call('updater.check', empty) },
		window: {
			availability,
			close: () => call('window.close', empty),
			async listen(listener) {
				const unsubscribe = client.on('window.changed', (payload) =>
					listener(payload as WindowSnapshot)
				);
				const handle = scope.add(createDesktopResourceHandle(unsubscribe));
				return { ok: true, value: handle };
			},
			maximize: () => call('window.maximize', empty),
			minimize: () => call('window.minimize', empty),
			restore: () => call('window.restore', empty),
			snapshot: () => call('window.snapshot', empty),
			startDragging: () => call('window.startDragging', empty),
			toggleMaximize: () => call('window.toggleMaximize', empty)
		},
		windowState: {
			availability,
			restore: () => call('windowState.restore', empty),
			save: () => call('windowState.save', empty)
		},
		forScope: (childScope) => createPlatform(client, options, childScope)
	};
}

export function createWebviewDesktopPlatform(
	options: DesktopPlatformOptions,
	client?: WebviewClient
): DesktopPlatform {
	const resolvedClient =
		client ??
		(() => {
			const transport = createWebView2Transport();
			return transport ? createWebviewClient(transport) : null;
		})();
	return resolvedClient
		? createPlatform(resolvedClient, options, createDesktopResourceScope())
		: createUnsupportedDesktopPlatform();
}
