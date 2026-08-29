// Generated from protocol/desktop.protocol.json. Do not edit.
import type * as Dto from '../platform/types.js';

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
	'app.snapshot': { params: Dto.Empty; result: Dto.AppSnapshot };
	'clipboard.clear': { params: Dto.Empty; result: Dto.Void };
	'clipboard.readText': { params: Dto.Empty; result: Dto.TextValue };
	'clipboard.writeText': { params: Dto.TextValue; result: Dto.Void };
	'dialog.open': { params: Dto.OpenDialogOptions; result: Dto.PathSelection };
	'dialog.save': { params: Dto.SaveDialogOptions; result: Dto.NullablePath };
	'filesystem.exists': { params: Dto.PathValue; result: Dto.BooleanValue };
	'filesystem.readText': { params: Dto.PathValue; result: Dto.TextValue };
	'filesystem.remove': { params: Dto.ConfirmedPath; result: Dto.Void };
	'filesystem.writeText': { params: Dto.WriteTextOptions; result: Dto.Void };
	'log.write': { params: Dto.LogRecord; result: Dto.Void };
	'notification.permission': { params: Dto.Empty; result: Dto.NotificationPermissionValue };
	'notification.requestPermission': { params: Dto.Empty; result: Dto.NotificationPermissionValue };
	'notification.send': { params: Dto.NotificationOptions; result: Dto.Void };
	'opener.openUrl': { params: Dto.UrlValue; result: Dto.Void };
	'os.snapshot': { params: Dto.Empty; result: Dto.OsSnapshot };
	'process.exit': { params: Dto.ExitOptions; result: Dto.Void };
	'process.relaunch': { params: Dto.ConfirmedAction; result: Dto.Void };
	'store.clear': { params: Dto.Empty; result: Dto.Void };
	'store.delete': { params: Dto.KeyValue; result: Dto.BooleanValue };
	'store.get': { params: Dto.KeyValue; result: Dto.JsonValue };
	'store.keys': { params: Dto.Empty; result: Dto.StringList };
	'store.save': { params: Dto.Empty; result: Dto.Void };
	'store.set': { params: Dto.StoreSetOptions; result: Dto.Void };
	'updater.check': { params: Dto.Empty; result: Dto.UpdateInfo };
	'window.close': { params: Dto.Empty; result: Dto.Void };
	'window.maximize': { params: Dto.Empty; result: Dto.Void };
	'window.minimize': { params: Dto.Empty; result: Dto.Void };
	'window.restore': { params: Dto.Empty; result: Dto.Void };
	'window.snapshot': { params: Dto.Empty; result: Dto.WindowSnapshot };
	'window.startDragging': { params: Dto.Empty; result: Dto.Void };
	'window.toggleMaximize': { params: Dto.Empty; result: Dto.Void };
	'windowState.restore': { params: Dto.Empty; result: Dto.Void };
	'windowState.save': { params: Dto.Empty; result: Dto.Void };
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
			error: Dto.DesktopError;
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
