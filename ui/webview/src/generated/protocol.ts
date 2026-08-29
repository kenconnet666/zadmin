// Generated from protocol/desktop.protocol.json. Do not edit.

export type Empty = Record<string, never>;

export type Void = undefined;

export type JsonValue =
	null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface TextValue {
	readonly text: string;
}

export interface PathValue {
	readonly path: string;
}

export interface ConfirmedPath {
	readonly confirmed: true;
	readonly path: string;
}

export interface BooleanValue {
	readonly value: boolean;
}

export interface KeyValue {
	readonly key: string;
}

export interface UrlValue {
	readonly url: string;
}

export interface StringList {
	readonly values: readonly string[];
}

export interface NullablePath {
	readonly path: string | null;
}

export interface PathSelection {
	readonly paths: readonly string[];
}

export interface ConfirmedAction {
	readonly confirmed: true;
}

export interface ExitOptions {
	readonly code: number;
	readonly confirmed: true;
}

export interface WriteTextOptions {
	readonly contents: string;
	readonly path: string;
}

export interface StoreSetOptions {
	readonly key: string;
	readonly value: JsonValue;
}

export interface AppSnapshot {
	readonly environment: string;
	readonly name: string;
	readonly version: string;
	readonly webviewVersion: string;
}

export interface OsSnapshot {
	readonly arch: string;
	readonly locale: string;
	readonly platform: string;
	readonly version: string;
}

export interface WindowSnapshot {
	readonly focused: boolean;
	readonly height: number;
	readonly maximized: boolean;
	readonly minimized: boolean;
	readonly scaleFactor: number;
	readonly visible: boolean;
	readonly width: number;
}

export interface OpenDialogOptions {
	readonly directory?: boolean;
	readonly filters?: Readonly<Record<string, readonly string[]>>;
	readonly multiple?: boolean;
	readonly title?: string;
}

export interface SaveDialogOptions {
	readonly defaultPath?: string;
	readonly filters?: Readonly<Record<string, readonly string[]>>;
	readonly title?: string;
}

export type DesktopLogLevel = 'debug' | 'error' | 'info' | 'trace' | 'warn';

export interface LogRecord {
	readonly fields?: Readonly<Record<string, JsonValue>>;
	readonly level: DesktopLogLevel;
	readonly message: string;
}

export type NotificationPermissionValue = 'default' | 'denied' | 'granted';

export interface NotificationOptions {
	readonly body?: string;
	readonly icon?: string;
	readonly title: string;
}

export type UpdateInfo = {
	readonly body?: string;
	readonly currentVersion: string;
	readonly date?: string;
	readonly version: string;
} | null;

export type DesktopErrorCode =
	| 'cancelled'
	| 'disposed'
	| 'invalid-input'
	| 'permission-denied'
	| 'protocol-error'
	| 'system-error'
	| 'timeout'
	| 'transport-error'
	| 'unsupported';

export interface DesktopError {
	readonly code: DesktopErrorCode;
	readonly message: string;
	readonly operation: string;
	readonly retryable: boolean;
}

export const WEBVIEW_PROTOCOL_VERSION = 1 as const;
export const WEBVIEW_MAX_MESSAGE_BYTES = 1048576 as const;
export const webviewProtocolMethods = [
	'app.snapshot',
	'clipboard.clear',
	'clipboard.readText',
	'clipboard.writeText',
	'dialog.open',
	'dialog.save',
	'filesystem.exists',
	'filesystem.readText',
	'filesystem.remove',
	'filesystem.writeText',
	'log.write',
	'notification.permission',
	'notification.requestPermission',
	'notification.send',
	'opener.openUrl',
	'os.snapshot',
	'process.exit',
	'process.relaunch',
	'store.clear',
	'store.delete',
	'store.get',
	'store.keys',
	'store.save',
	'store.set',
	'updater.check',
	'window.close',
	'window.maximize',
	'window.minimize',
	'window.restore',
	'window.snapshot',
	'window.startDragging',
	'window.toggleMaximize',
	'windowState.restore',
	'windowState.save'
] as const;
export const webviewProtocolEvents = ['host.ready', 'window.changed', 'updater.available'] as const;

export type WebviewMethod = (typeof webviewProtocolMethods)[number];
export type WebviewEventTopic = (typeof webviewProtocolEvents)[number];

export interface WebviewMethodMap {
	'app.snapshot': { params: Empty; result: AppSnapshot };
	'clipboard.clear': { params: Empty; result: Void };
	'clipboard.readText': { params: Empty; result: TextValue };
	'clipboard.writeText': { params: TextValue; result: Void };
	'dialog.open': { params: OpenDialogOptions; result: PathSelection };
	'dialog.save': { params: SaveDialogOptions; result: NullablePath };
	'filesystem.exists': { params: PathValue; result: BooleanValue };
	'filesystem.readText': { params: PathValue; result: TextValue };
	'filesystem.remove': { params: ConfirmedPath; result: Void };
	'filesystem.writeText': { params: WriteTextOptions; result: Void };
	'log.write': { params: LogRecord; result: Void };
	'notification.permission': { params: Empty; result: NotificationPermissionValue };
	'notification.requestPermission': { params: Empty; result: NotificationPermissionValue };
	'notification.send': { params: NotificationOptions; result: Void };
	'opener.openUrl': { params: UrlValue; result: Void };
	'os.snapshot': { params: Empty; result: OsSnapshot };
	'process.exit': { params: ExitOptions; result: Void };
	'process.relaunch': { params: ConfirmedAction; result: Void };
	'store.clear': { params: Empty; result: Void };
	'store.delete': { params: KeyValue; result: BooleanValue };
	'store.get': { params: KeyValue; result: JsonValue };
	'store.keys': { params: Empty; result: StringList };
	'store.save': { params: Empty; result: Void };
	'store.set': { params: StoreSetOptions; result: Void };
	'updater.check': { params: Empty; result: UpdateInfo };
	'window.close': { params: Empty; result: Void };
	'window.maximize': { params: Empty; result: Void };
	'window.minimize': { params: Empty; result: Void };
	'window.restore': { params: Empty; result: Void };
	'window.snapshot': { params: Empty; result: WindowSnapshot };
	'window.startDragging': { params: Empty; result: Void };
	'window.toggleMaximize': { params: Empty; result: Void };
	'windowState.restore': { params: Empty; result: Void };
	'windowState.save': { params: Empty; result: Void };
}

export type WebviewRequest = {
	v: typeof WEBVIEW_PROTOCOL_VERSION;
	kind: 'request';
	id: string;
	method: WebviewMethod;
	params: unknown;
};
export type WebviewResponse =
	| { v: typeof WEBVIEW_PROTOCOL_VERSION; kind: 'response'; id: string; ok: true; result: unknown }
	| {
			v: typeof WEBVIEW_PROTOCOL_VERSION;
			kind: 'response';
			id: string;
			ok: false;
			error: DesktopError;
	  };
export type WebviewEvent = {
	v: typeof WEBVIEW_PROTOCOL_VERSION;
	kind: 'event';
	topic: WebviewEventTopic;
	payload: unknown;
};
export type WebviewCancel = { v: typeof WEBVIEW_PROTOCOL_VERSION; kind: 'cancel'; id: string };
export type WebviewDispose = {
	v: typeof WEBVIEW_PROTOCOL_VERSION;
	kind: 'dispose';
	handle: string;
};
export type WebviewMessage =
	WebviewRequest | WebviewResponse | WebviewEvent | WebviewCancel | WebviewDispose;
