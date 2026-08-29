import {
	WEBVIEW_MAX_MESSAGE_BYTES,
	WEBVIEW_PROTOCOL_VERSION,
	type WebviewEventTopic,
	type WebviewMessage,
	type WebviewMethod,
	type WebviewMethodMap
} from '../generated/protocol.js';
import type { DesktopError } from '../platform/types.js';
import type { WebviewTransport } from './transport.js';

export interface WebviewCallOptions {
	readonly signal?: AbortSignal;
	readonly timeoutMs?: number;
}

export interface WebviewClient {
	readonly origin: string;
	call<TMethod extends WebviewMethod>(
		method: TMethod,
		params: WebviewMethodMap[TMethod]['params'],
		options?: WebviewCallOptions
	): Promise<WebviewMethodMap[TMethod]['result']>;
	close(reason?: string): void;
	disposeHandle(handle: string): void;
	on(topic: WebviewEventTopic, listener: (payload: unknown) => void): () => void;
}

interface PendingCall {
	reject(error: unknown): void;
	resolve(value: unknown): void;
}

function parseMessage(value: unknown): WebviewMessage | null {
	let message: unknown = value;
	if (typeof value === 'string') {
		if (new TextEncoder().encode(value).byteLength > WEBVIEW_MAX_MESSAGE_BYTES) return null;
		try {
			message = JSON.parse(value);
		} catch {
			return null;
		}
	}
	if (!message || typeof message !== 'object') return null;
	if (Reflect.get(message, 'v') !== WEBVIEW_PROTOCOL_VERSION) return null;
	return message as WebviewMessage;
}

function post(transport: WebviewTransport, message: WebviewMessage): void {
	const serialized = JSON.stringify(message);
	if (new TextEncoder().encode(serialized).byteLength > WEBVIEW_MAX_MESSAGE_BYTES) {
		throw new Error(`WebView protocol payload exceeds ${WEBVIEW_MAX_MESSAGE_BYTES} bytes.`);
	}
	transport.postMessage(serialized);
}

export function createWebviewClient(transport: WebviewTransport): WebviewClient {
	const pending = new Map<string, PendingCall>();
	const listeners = new Map<WebviewEventTopic, Set<(payload: unknown) => void>>();
	let sequence = 0;
	let closed = false;
	const unsubscribe = transport.subscribe((raw) => {
		const message = parseMessage(raw);
		if (!message) return;
		if (message.kind === 'response') {
			const call = pending.get(message.id);
			if (!call) return;
			pending.delete(message.id);
			if (message.ok) call.resolve(message.result);
			else call.reject(message.error satisfies DesktopError);
		} else if (message.kind === 'event') {
			for (const listener of listeners.get(message.topic) ?? []) listener(message.payload);
		}
	});

	return {
		origin: transport.origin,
		call(method, params, options = {}) {
			if (closed) return Promise.reject(new Error('WebView client is closed.'));
			const id = `${Date.now().toString(36)}-${(++sequence).toString(36)}`;
			return new Promise((resolve, reject) => {
				let settled = false;
				const finish = (action: () => void) => {
					if (settled) return;
					settled = true;
					pending.delete(id);
					clearTimeout(timeout);
					options.signal?.removeEventListener('abort', abort);
					action();
				};
				const abort = () => {
					post(transport, { id, kind: 'cancel', v: WEBVIEW_PROTOCOL_VERSION });
					finish(() => reject(new DOMException('Desktop operation aborted.', 'AbortError')));
				};
				const timeout = setTimeout(() => {
					post(transport, { id, kind: 'cancel', v: WEBVIEW_PROTOCOL_VERSION });
					finish(() => reject(new Error(`WebView request timeout: ${method}`)));
				}, options.timeoutMs ?? 10_000);
				pending.set(id, {
					reject: (error) => finish(() => reject(error)),
					resolve: (value) => finish(() => resolve(value as never))
				});
				options.signal?.addEventListener('abort', abort, { once: true });
				if (options.signal?.aborted) abort();
				else {
					try {
						post(transport, { id, kind: 'request', method, params, v: WEBVIEW_PROTOCOL_VERSION });
					} catch (error) {
						finish(() => reject(error));
					}
				}
			});
		},
		close(reason = 'WebView client closed.') {
			if (closed) return;
			closed = true;
			unsubscribe();
			for (const call of pending.values()) call.reject(new Error(reason));
			pending.clear();
			listeners.clear();
		},
		disposeHandle(handle) {
			if (!closed) post(transport, { handle, kind: 'dispose', v: WEBVIEW_PROTOCOL_VERSION });
		},
		on(topic, listener) {
			const topicListeners = listeners.get(topic) ?? new Set();
			topicListeners.add(listener);
			listeners.set(topic, topicListeners);
			return () => {
				topicListeners.delete(listener);
				if (topicListeners.size === 0) listeners.delete(topic);
			};
		}
	};
}
