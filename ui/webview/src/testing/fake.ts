import {
	WEBVIEW_PROTOCOL_VERSION,
	type WebviewEventTopic,
	type WebviewMessage,
	type WebviewRequest,
	type WebviewResponse
} from '../generated/protocol.js';
import { createWebviewClient } from '../bridge/client.js';
import type { WebviewTransport } from '../bridge/transport.js';
import { createWebviewDesktopPlatform } from '../platform/create.js';
import type {
	AppSnapshot,
	DesktopPlatform,
	JsonValue,
	NotificationOptions,
	OsSnapshot,
	WindowSnapshot
} from '../platform/types.js';

export interface FakeWebviewState {
	app: AppSnapshot;
	clipboard: string;
	files: Map<string, string>;
	logs: unknown[];
	notifications: NotificationOptions[];
	openedUrls: string[];
	os: OsSnapshot;
	store: Map<string, JsonValue>;
	window: WindowSnapshot;
	windowActions: string[];
}

export interface FakeWebviewDriver {
	emit(topic: WebviewEventTopic, payload: unknown): void;
	readonly platform: DesktopPlatform;
	readonly requests: readonly WebviewRequest[];
	readonly state: FakeWebviewState;
}

export function createFakeWebviewDriver(): FakeWebviewDriver {
	const requests: WebviewRequest[] = [];
	const subscribers = new Set<(message: unknown) => void>();
	const state: FakeWebviewState = {
		app: { environment: 'test', name: 'ZAdmin', version: '0.1.0', webviewVersion: 'fake' },
		clipboard: '',
		files: new Map(),
		logs: [],
		notifications: [],
		openedUrls: [],
		os: { arch: 'x64', locale: 'zh-CN', platform: 'windows', version: '11' },
		store: new Map(),
		window: {
			focused: true,
			height: 720,
			maximized: false,
			minimized: false,
			scaleFactor: 1,
			visible: true,
			width: 1280
		},
		windowActions: []
	};
	const emit = (topic: WebviewEventTopic, payload: unknown) => {
		const event: WebviewMessage = { kind: 'event', payload, topic, v: WEBVIEW_PROTOCOL_VERSION };
		for (const subscriber of subscribers) subscriber(event);
	};
	const handle = (request: WebviewRequest): unknown => {
		const params = request.params as Record<string, unknown>;
		switch (request.method) {
			case 'app.snapshot':
				return state.app;
			case 'clipboard.clear':
				state.clipboard = '';
				return undefined;
			case 'clipboard.readText':
				return { text: state.clipboard };
			case 'clipboard.writeText':
				state.clipboard = String(params.text);
				return undefined;
			case 'dialog.open':
				return { paths: [] };
			case 'dialog.save':
				return { path: null };
			case 'filesystem.exists':
				return { value: state.files.has(String(params.path)) };
			case 'filesystem.readText':
				return { text: state.files.get(String(params.path)) ?? '' };
			case 'filesystem.remove':
				state.files.delete(String(params.path));
				return undefined;
			case 'filesystem.writeText':
				state.files.set(String(params.path), String(params.contents));
				return undefined;
			case 'log.write':
				state.logs.push(params);
				return undefined;
			case 'notification.permission':
				return 'granted';
			case 'notification.requestPermission':
				return 'granted';
			case 'notification.send':
				state.notifications.push(params as unknown as NotificationOptions);
				return undefined;
			case 'opener.openUrl':
				state.openedUrls.push(String(params.url));
				return undefined;
			case 'os.snapshot':
				return state.os;
			case 'process.exit':
				state.windowActions.push(`exit:${params.code}`);
				return undefined;
			case 'process.relaunch':
				state.windowActions.push('relaunch');
				return undefined;
			case 'store.clear':
				state.store.clear();
				return undefined;
			case 'store.delete':
				return { value: state.store.delete(String(params.key)) };
			case 'store.get':
				return state.store.get(String(params.key)) ?? null;
			case 'store.keys':
				return { values: [...state.store.keys()] };
			case 'store.save':
				return undefined;
			case 'store.set':
				state.store.set(String(params.key), params.value as JsonValue);
				return undefined;
			case 'updater.check':
				return null;
			case 'window.snapshot':
				return state.window;
			case 'window.maximize':
				state.window = { ...state.window, maximized: true };
				break;
			case 'window.restore':
				state.window = { ...state.window, maximized: false, minimized: false };
				break;
			case 'window.minimize':
				state.window = { ...state.window, minimized: true };
				break;
			case 'window.toggleMaximize':
				state.window = { ...state.window, maximized: !state.window.maximized };
				break;
			case 'window.close':
			case 'window.startDragging':
			case 'windowState.restore':
			case 'windowState.save':
				break;
		}
		state.windowActions.push(request.method);
		if (request.method.startsWith('window.')) emit('window.changed', state.window);
		return undefined;
	};
	const transport: WebviewTransport = {
		origin: 'https://app.zadmin.local',
		postMessage(serialized) {
			const message = JSON.parse(serialized) as WebviewMessage;
			if (message.kind !== 'request') return;
			requests.push(message);
			queueMicrotask(() => {
				let response: WebviewResponse;
				try {
					response = {
						id: message.id,
						kind: 'response',
						ok: true,
						result: handle(message),
						v: WEBVIEW_PROTOCOL_VERSION
					};
				} catch (cause) {
					response = {
						error: {
							code: 'system-error',
							message: String(cause),
							operation: message.method,
							retryable: false
						},
						id: message.id,
						kind: 'response',
						ok: false,
						v: WEBVIEW_PROTOCOL_VERSION
					};
				}
				for (const subscriber of subscribers) subscriber(response);
			});
		},
		subscribe(listener) {
			subscribers.add(listener);
			return () => subscribers.delete(listener);
		}
	};
	const client = createWebviewClient(transport);
	return {
		emit,
		platform: createWebviewDesktopPlatform(
			{ opener: { allowedOrigins: ['https://docs.zadmin.dev'] } },
			client
		),
		requests,
		state
	};
}

export function expectDesktopOk<T>(result: { readonly ok: boolean; readonly value?: T }): T {
	if (!result.ok) throw new Error('Expected desktop result to be ok.');
	return result.value as T;
}
