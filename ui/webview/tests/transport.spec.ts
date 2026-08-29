import { describe, expect, it, vi } from 'vitest';

import { createWebView2Transport, WEBVIEW_APP_ORIGIN } from '../src/bridge/transport.js';

describe('WebView2 transport detection', () => {
	it('requires the virtual app origin and native bridge', () => {
		expect(createWebView2Transport({ location: { origin: WEBVIEW_APP_ORIGIN } })).toBeNull();
		expect(
			createWebView2Transport({
				chrome: {
					webview: { addEventListener: vi.fn(), postMessage: vi.fn(), removeEventListener: vi.fn() }
				},
				location: { origin: 'https://evil.example' }
			})
		).toBeNull();
	});

	it('forwards messages and unsubscribes the WebView2 event listener', () => {
		const addEventListener = vi.fn();
		const postMessage = vi.fn();
		const removeEventListener = vi.fn();
		const native = { addEventListener, postMessage, removeEventListener };
		const transport = createWebView2Transport({
			chrome: { webview: native },
			location: { origin: WEBVIEW_APP_ORIGIN }
		});
		expect(transport?.origin).toBe(WEBVIEW_APP_ORIGIN);
		transport?.postMessage('request');
		const listener = vi.fn();
		const unsubscribe = transport?.subscribe(listener);
		const receive = addEventListener.mock.calls[0]?.[1];
		receive({ data: 'response' });
		unsubscribe?.();
		expect(postMessage).toHaveBeenCalledWith('request');
		expect(listener).toHaveBeenCalledWith('response');
		expect(removeEventListener).toHaveBeenCalledWith('message', receive);
	});

	it('allows only a host-injected development origin marker', () => {
		const native = {
			addEventListener: vi.fn(),
			postMessage: vi.fn(),
			removeEventListener: vi.fn()
		};
		const trusted = createWebView2Transport({
			__ZADMIN_WEBVIEW_TRUSTED_ORIGIN__: 'http://127.0.0.1:5173',
			chrome: { webview: native },
			location: { origin: 'http://127.0.0.1:5173' }
		});
		expect(trusted?.origin).toBe('http://127.0.0.1:5173');
		expect(
			createWebView2Transport({
				__ZADMIN_WEBVIEW_TRUSTED_ORIGIN__: 'http://127.0.0.1:5173',
				chrome: { webview: native },
				location: { origin: 'https://evil.example' }
			})
		).toBeNull();
	});
});
