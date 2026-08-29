export interface WebviewTransport {
	readonly origin: string;
	postMessage(message: string): void;
	subscribe(listener: (message: unknown) => void): () => void;
}

interface WebView2Bridge {
	addEventListener(type: 'message', listener: (event: { data: unknown }) => void): void;
	postMessage(message: string): void;
	removeEventListener(type: 'message', listener: (event: { data: unknown }) => void): void;
}

interface WebView2Global {
	readonly chrome?: { readonly webview?: WebView2Bridge };
	readonly location?: { readonly origin?: string };
}

export const WEBVIEW_APP_ORIGIN = 'https://app.zadmin.local';

export function createWebView2Transport(
	root: WebView2Global = globalThis as WebView2Global
): WebviewTransport | null {
	const webview = root.chrome?.webview;
	if (!webview || root.location?.origin !== WEBVIEW_APP_ORIGIN) return null;
	return {
		origin: WEBVIEW_APP_ORIGIN,
		postMessage(message) {
			webview.postMessage(message);
		},
		subscribe(listener) {
			const receive = (event: { data: unknown }) => listener(event.data);
			webview.addEventListener('message', receive);
			return () => webview.removeEventListener('message', receive);
		}
	};
}
