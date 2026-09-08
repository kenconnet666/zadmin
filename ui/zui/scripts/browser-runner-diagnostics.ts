import {
	PlaywrightBrowserProvider,
	playwright,
	type PlaywrightProviderOptions
} from '@vitest/browser-playwright';
import type { ConsoleMessage, Page, WebSocket } from 'playwright';
import type { BrowserProviderOption } from 'vitest/node';

export type BrowserRunnerExpectedClose = 'provider-teardown' | 'session-replaced';

const MESSAGE_LIMIT = 500;
const URL_PATTERN = /\b(?:https?|wss?):\/\/[^\s"'<>]+/giu;

export function browserRunnerPathname(value: string): string {
	try {
		return new URL(value).pathname;
	} catch {
		return '[invalid-url]';
	}
}

export function sanitizeBrowserRunnerMessage(value: string): string {
	return value
		.replace(URL_PATTERN, (url) => browserRunnerPathname(url))
		.replace(/[\r\n\t]+/gu, ' ')
		.slice(0, MESSAGE_LIMIT);
}

function websocketKind(socket: WebSocket): 'vitest-control' | 'vite' | 'other' {
	const path = browserRunnerPathname(socket.url());
	if (path.includes('__vitest_browser_api__')) return 'vitest-control';
	if (path.includes('@vite')) return 'vite';
	return 'other';
}

function relevantConsole(message: ConsoleMessage): boolean {
	if (message.type() === 'error') return true;
	return message.type() === 'warning' && /(?:vite|vitest|reload)/iu.test(message.text());
}

function report(
	event: string,
	detail: Readonly<Record<string, boolean | string | undefined>>
): void {
	console.error(`[zui-browser-runner] ${JSON.stringify({ event, ...detail })}`);
}

export function browserRunnerCloseReason(
	expected?: BrowserRunnerExpectedClose
): BrowserRunnerExpectedClose | 'unexpected' {
	return expected ?? 'unexpected';
}

function instrumentProvider(provider: PlaywrightBrowserProvider): PlaywrightBrowserProvider {
	const instrumented = new WeakSet<Page>();
	const expectedClose = new WeakMap<Page, BrowserRunnerExpectedClose>();
	const openPage = provider.openPage.bind(provider);
	const close = provider.close.bind(provider);

	function closeReason(page: Page): BrowserRunnerExpectedClose | 'unexpected' {
		return browserRunnerCloseReason(expectedClose.get(page));
	}

	function instrument(page: Page, sessionId: string): void {
		if (instrumented.has(page)) return;
		instrumented.add(page);
		let currentPathname = browserRunnerPathname(page.url());
		report('page-ready', { pathname: currentPathname, sessionId });
		page.on('framenavigated', (frame) => {
			if (frame !== page.mainFrame()) return;
			const nextPathname = browserRunnerPathname(frame.url());
			report('main-frame-navigation', {
				closeReason: closeReason(page),
				fromPathname: currentPathname,
				sessionId,
				toPathname: nextPathname
			});
			currentPathname = nextPathname;
		});
		page.on('close', () =>
			report('page-close', { closeReason: closeReason(page), pathname: currentPathname, sessionId })
		);
		page.on('crash', () =>
			report('page-crash', { closeReason: closeReason(page), pathname: currentPathname, sessionId })
		);
		page.on('pageerror', (error) =>
			report('page-error', {
				message: sanitizeBrowserRunnerMessage(error.message),
				pathname: currentPathname,
				sessionId
			})
		);
		page.on('console', (message) => {
			if (!relevantConsole(message)) return;
			report('page-console', {
				level: message.type(),
				message: sanitizeBrowserRunnerMessage(message.text()),
				pathname: currentPathname,
				sessionId
			});
		});
		page.on('websocket', (socket) => {
			const kind = websocketKind(socket);
			const path = browserRunnerPathname(socket.url());
			socket.on('close', () =>
				report('websocket-close', {
					// A tester's sockets close normally on each isolated file, even while its Page lives.
					pageState: expectedClose.get(page) ?? 'active',
					kind,
					pathname: path,
					sessionId
				})
			);
			socket.on('socketerror', (error) =>
				report('websocket-error', {
					kind,
					message: sanitizeBrowserRunnerMessage(error),
					pathname: path,
					sessionId
				})
			);
		});
	}

	provider.openPage = async (sessionId, url, options): Promise<void> => {
		const previous = provider.pages.get(sessionId);
		if (previous) expectedClose.set(previous, 'session-replaced');
		await openPage(sessionId, url, options);
		instrument(provider.getPage(sessionId), sessionId);
	};
	provider.close = async (): Promise<void> => {
		for (const page of provider.pages.values()) expectedClose.set(page, 'provider-teardown');
		report('provider-close-requested', { browser: provider.browserName });
		await close();
	};
	return provider;
}

export function withBrowserRunnerDiagnostics(
	descriptor: BrowserProviderOption<PlaywrightProviderOptions>,
	enabled = process.env.ZUI_BROWSER_DIAGNOSTICS === '1'
): BrowserProviderOption<PlaywrightProviderOptions> {
	if (!enabled) return descriptor;
	return {
		...descriptor,
		providerFactory: (project) => {
			const provider = descriptor.providerFactory(project);
			if (!(provider instanceof PlaywrightBrowserProvider))
				throw new TypeError('ZUI browser diagnostics require PlaywrightBrowserProvider.');
			return instrumentProvider(provider);
		}
	};
}

/** Adds observer-only Playwright lifecycle diagnostics when explicitly enabled. */
export function diagnosticPlaywright(
	options?: PlaywrightProviderOptions
): BrowserProviderOption<PlaywrightProviderOptions> {
	return withBrowserRunnerDiagnostics(playwright(options));
}
