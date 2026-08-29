import { describe, expect, it, vi } from 'vitest';

import {
	createWebviewClient,
	WEBVIEW_PROTOCOL_VERSION,
	type WebviewTransport
} from '../src/index.js';

function transport(
	handler: (message: string, emit: (value: unknown) => void) => void
): WebviewTransport {
	const listeners = new Set<(value: unknown) => void>();
	return {
		origin: 'https://app.zadmin.local',
		postMessage(message) {
			handler(message, (value) => listeners.forEach((listener) => listener(value)));
		},
		subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		}
	};
}

describe('webview client', () => {
	it('correlates typed requests and responses', async () => {
		const client = createWebviewClient(
			transport((raw, emit) => {
				const request = JSON.parse(raw);
				emit({ id: request.id, kind: 'response', ok: true, result: { text: 'hello' }, v: 1 });
			})
		);
		await expect(client.call('clipboard.readText', {})).resolves.toEqual({ text: 'hello' });
	});

	it('rejects a host error and ignores wrong protocol versions', async () => {
		const client = createWebviewClient(
			transport((raw, emit) => {
				const request = JSON.parse(raw);
				emit({ id: request.id, kind: 'response', ok: true, result: {}, v: 99 });
				queueMicrotask(() =>
					emit({
						error: {
							code: 'system-error',
							message: 'failed',
							operation: request.method,
							retryable: false
						},
						id: request.id,
						kind: 'response',
						ok: false,
						v: WEBVIEW_PROTOCOL_VERSION
					})
				);
			})
		);
		await expect(client.call('app.snapshot', {})).rejects.toMatchObject({ code: 'system-error' });
	});

	it('cancels timed-out requests at the transport boundary', async () => {
		vi.useFakeTimers();
		const messages: Array<{ kind: string }> = [];
		const client = createWebviewClient(transport((raw) => messages.push(JSON.parse(raw))));
		const pending = client.call('app.snapshot', {}, { timeoutMs: 25 });
		const rejected = expect(pending).rejects.toThrow('timeout');
		await vi.advanceTimersByTimeAsync(25);
		await rejected;
		expect(messages.map((message) => message.kind)).toEqual(['request', 'cancel']);
		vi.useRealTimers();
	});

	it('emits events and releases subscriptions', () => {
		let emit!: (value: unknown) => void;
		const client = createWebviewClient(
			transport((_raw, send) => {
				emit = send;
			})
		);
		const listener = vi.fn();
		const unsubscribe = client.on('host.ready', listener);
		// Capture the sender without creating a pending request.
		client.disposeHandle('probe');
		emit('{invalid');
		emit(null);
		emit({ kind: 'event', payload: {}, topic: 'host.ready', v: 99 });
		emit({ kind: 'event', payload: { ready: true }, topic: 'host.ready', v: 1 });
		unsubscribe();
		emit({ kind: 'event', payload: {}, topic: 'host.ready', v: 1 });
		expect(listener).toHaveBeenCalledOnce();
	});

	it('propagates AbortSignal cancellation and close', async () => {
		const messages: Array<{ kind: string }> = [];
		const client = createWebviewClient(transport((raw) => messages.push(JSON.parse(raw))));
		const controller = new AbortController();
		const aborted = client.call('app.snapshot', {}, { signal: controller.signal });
		const rejected = expect(aborted).rejects.toMatchObject({ name: 'AbortError' });
		controller.abort();
		await rejected;
		const closed = client.call('app.snapshot', {});
		const closeRejected = expect(closed).rejects.toThrow('shutdown');
		client.close('shutdown');
		await closeRejected;
		expect(messages.map((message) => message.kind)).toEqual(['request', 'cancel', 'request']);
	});

	it('rejects oversized outgoing payloads', async () => {
		const client = createWebviewClient(transport(() => undefined));
		await expect(
			client.call('clipboard.writeText', { text: 'x'.repeat(1_100_000) })
		).rejects.toThrow('exceeds');
	});

	it('rejects calls after close and an already-aborted signal', async () => {
		const client = createWebviewClient(transport(() => undefined));
		const controller = new AbortController();
		controller.abort();
		await expect(
			client.call('app.snapshot', {}, { signal: controller.signal })
		).rejects.toMatchObject({ name: 'AbortError' });
		client.close();
		client.close();
		client.disposeHandle('ignored');
		await expect(client.call('app.snapshot', {})).rejects.toThrow('closed');
	});
});
