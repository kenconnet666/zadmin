import {
	PlaywrightBrowserProvider,
	playwright,
	type PlaywrightProviderOptions
} from '@vitest/browser-playwright';
import type { Page } from 'playwright';
import type { BrowserProvider, BrowserProviderOption } from 'vitest/node';

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

function websocketKind(url: string): 'vitest-control' | 'vite' | 'other' {
	const path = browserRunnerPathname(url);
	if (path.includes('__vitest_browser_api__')) return 'vitest-control';
	if (path.includes('@vite')) return 'vite';
	return 'other';
}

function relevantConsole(level: string, message: string): boolean {
	if (level === 'error') return true;
	return level === 'warning' && /(?:vite|vitest|reload)/iu.test(message);
}

export type BrowserRunnerDiagnosticWriter = (
	event: string,
	detail: Readonly<Record<string, boolean | string | undefined>>
) => void;

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

export function shouldEnableBrowserRunnerNetwork(browser: string, enabled: boolean): boolean {
	return enabled && browser === 'chromium';
}

export interface BrowserRunnerObservedWebSocket {
	readonly url: string;
	onClose(listener: () => void): void;
	onError(listener: (message: string) => void): void;
}

export interface BrowserRunnerPageObserver {
	close(): void;
	console(level: string, message: string): void;
	crash(): void;
	mainFrameNavigation(url: string): void;
	pageError(message: string): void;
	websocket(socket: BrowserRunnerObservedWebSocket): void;
}

export interface BrowserRunnerPageHooks<TPage extends object> {
	observe(page: TPage, observer: BrowserRunnerPageObserver): void;
	url(page: TPage): string;
}

export interface BrowserRunnerProviderLike<TPage extends object> {
	readonly browserName: string;
	readonly pages: ReadonlyMap<string, TPage>;
	close(): Promise<void>;
	getPage(sessionId: string): TPage;
	openPage(sessionId: string, url: string, options: { readonly parallel: boolean }): Promise<void>;
}

export interface BrowserRunnerNetworkHooks<TPage extends object> {
	setup(
		page: TPage,
		sessionId: string,
		write: BrowserRunnerDiagnosticWriter
	): Promise<() => Promise<void>>;
}

export interface NetworkWebSocketCreated {
	readonly requestId: string;
	readonly url: string;
}

export interface NetworkWebSocketFrameError {
	readonly errorMessage: string;
	readonly requestId: string;
}

export interface NetworkLoadingFailed {
	readonly errorText: string;
	readonly requestId: string;
	readonly type: string;
}

export interface NetworkWebSocketClosed {
	readonly requestId: string;
}

export interface BrowserRunnerNetworkSession {
	detach(): Promise<void>;
	enable(): Promise<void>;
	onLoadingFailed(listener: (event: NetworkLoadingFailed) => void): () => void;
	onWebSocketClosed(listener: (event: NetworkWebSocketClosed) => void): () => void;
	onWebSocketCreated(listener: (event: NetworkWebSocketCreated) => void): () => void;
	onWebSocketFrameError(listener: (event: NetworkWebSocketFrameError) => void): () => void;
}

const playwrightPageHooks: BrowserRunnerPageHooks<Page> = {
	observe(page, observer) {
		page.on('framenavigated', (frame) => {
			if (frame === page.mainFrame()) observer.mainFrameNavigation(frame.url());
		});
		page.on('close', () => observer.close());
		page.on('crash', () => observer.crash());
		page.on('pageerror', (error) => observer.pageError(error.message));
		page.on('console', (message) => observer.console(message.type(), message.text()));
		page.on('websocket', (socket) =>
			observer.websocket({
				onClose: (listener) => socket.on('close', listener),
				onError: (listener) => socket.on('socketerror', listener),
				url: socket.url()
			})
		);
	},
	url: (page) => page.url()
};

export async function observeBrowserRunnerNetwork(
	session: BrowserRunnerNetworkSession,
	sessionId: string,
	write: BrowserRunnerDiagnosticWriter = report
): Promise<() => Promise<void>> {
	const unsubscribe: (() => void)[] = [];
	let live = true;
	const release = async (): Promise<void> => {
		if (!live) return;
		live = false;
		const failures: unknown[] = [];
		for (const stop of unsubscribe) {
			try {
				stop();
			} catch (error) {
				failures.push(error);
			}
		}
		try {
			await session.detach();
		} catch (error) {
			failures.push(error);
		}
		if (failures.length > 0)
			throw new AggregateError(failures, 'Failed to release browser network diagnostics.');
	};
	try {
		const paths = new Map<string, string>();
		unsubscribe.push(
			session.onWebSocketCreated(({ requestId, url }) => {
				paths.set(requestId, browserRunnerPathname(url));
			})
		);
		unsubscribe.push(
			session.onWebSocketFrameError(({ errorMessage, requestId }) => {
				const path = paths.get(requestId);
				if (!path) return;
				write('network-websocket-frame-error', {
					message: sanitizeBrowserRunnerMessage(errorMessage),
					pathname: path,
					sessionId
				});
			})
		);
		unsubscribe.push(
			session.onLoadingFailed(({ errorText, requestId, type }) => {
				const path = paths.get(requestId);
				if (!path) return;
				write('network-loading-failed', {
					message: sanitizeBrowserRunnerMessage(errorText),
					pathname: path,
					resourceType: type,
					sessionId
				});
			})
		);
		unsubscribe.push(
			session.onWebSocketClosed(({ requestId }) => {
				paths.delete(requestId);
			})
		);
		await session.enable();
		write('network-ready', { sessionId });
		return async () => {
			paths.clear();
			await release();
		};
	} catch (error) {
		await release().catch(() => undefined);
		throw error;
	}
}

const playwrightNetworkHooks: BrowserRunnerNetworkHooks<Page> = {
	async setup(page, sessionId, write) {
		const session = await page.context().newCDPSession(page);
		return observeBrowserRunnerNetwork(
			{
				detach: async () => {
					// Closing the Page already destroys its private CDP session.
					if (page.isClosed()) return;
					try {
						await session.detach();
					} catch (error) {
						if (!page.isClosed()) throw error;
					}
				},
				enable: async () => {
					await session.send('Network.enable');
				},
				onLoadingFailed: (listener) => {
					session.on('Network.loadingFailed', listener);
					return () => session.off('Network.loadingFailed', listener);
				},
				onWebSocketClosed: (listener) => {
					session.on('Network.webSocketClosed', listener);
					return () => session.off('Network.webSocketClosed', listener);
				},
				onWebSocketCreated: (listener) => {
					session.on('Network.webSocketCreated', listener);
					return () => session.off('Network.webSocketCreated', listener);
				},
				onWebSocketFrameError: (listener) => {
					session.on('Network.webSocketFrameError', listener);
					return () => session.off('Network.webSocketFrameError', listener);
				}
			},
			sessionId,
			write
		);
	}
};

export function instrumentBrowserRunnerProvider<
	TPage extends object,
	TProvider extends BrowserRunnerProviderLike<TPage>
>(
	provider: TProvider,
	hooks: BrowserRunnerPageHooks<TPage>,
	write: BrowserRunnerDiagnosticWriter = report,
	network?: BrowserRunnerNetworkHooks<TPage>
): TProvider {
	const instrumented = new WeakSet<TPage>();
	const expectedClose = new WeakMap<TPage, BrowserRunnerExpectedClose>();
	const networkCleanups = new Map<TPage, Promise<() => Promise<void>>>();
	const openPage = provider.openPage.bind(provider);
	const close = provider.close.bind(provider);

	async function cleanupNetwork(page: TPage): Promise<void> {
		const pending = networkCleanups.get(page);
		if (!pending) return;
		networkCleanups.delete(page);
		try {
			const cleanup = await pending;
			await cleanup();
		} catch (error) {
			write('network-diagnostic-cleanup-error', {
				message: sanitizeBrowserRunnerMessage(
					error instanceof Error ? error.message : String(error)
				)
			});
		}
	}

	function setupNetwork(page: TPage, sessionId: string): Promise<() => Promise<void>> {
		if (!network) return Promise.resolve(async () => undefined);
		return network.setup(page, sessionId, write).catch((error) => {
			write('network-diagnostic-setup-error', {
				message: sanitizeBrowserRunnerMessage(
					error instanceof Error ? error.message : String(error)
				),
				sessionId
			});
			return async () => undefined;
		});
	}

	function closeReason(page: TPage): BrowserRunnerExpectedClose | 'unexpected' {
		return browserRunnerCloseReason(expectedClose.get(page));
	}

	function instrument(page: TPage, sessionId: string): void {
		if (instrumented.has(page)) return;
		instrumented.add(page);
		let currentPathname = browserRunnerPathname(hooks.url(page));
		write('page-ready', { pathname: currentPathname, sessionId });
		hooks.observe(page, {
			mainFrameNavigation(url) {
				const nextPathname = browserRunnerPathname(url);
				write('main-frame-navigation', {
					closeReason: closeReason(page),
					fromPathname: currentPathname,
					sessionId,
					toPathname: nextPathname
				});
				currentPathname = nextPathname;
			},
			close: () => {
				write('page-close', {
					closeReason: closeReason(page),
					pathname: currentPathname,
					sessionId
				});
				void cleanupNetwork(page);
			},
			crash: () =>
				write('page-crash', {
					closeReason: closeReason(page),
					pathname: currentPathname,
					sessionId
				}),
			pageError: (message) =>
				write('page-error', {
					message: sanitizeBrowserRunnerMessage(message),
					pathname: currentPathname,
					sessionId
				}),
			console(level, message) {
				if (!relevantConsole(level, message)) return;
				write('page-console', {
					level,
					message: sanitizeBrowserRunnerMessage(message),
					pathname: currentPathname,
					sessionId
				});
			},
			websocket(socket) {
				const kind = websocketKind(socket.url);
				const path = browserRunnerPathname(socket.url);
				socket.onClose(() =>
					write('websocket-close', {
						// A tester's sockets close normally on each isolated file, even while its Page lives.
						pageState: expectedClose.get(page) ?? 'active',
						kind,
						pathname: path,
						sessionId
					})
				);
				socket.onError((message) =>
					write('websocket-error', {
						kind,
						message: sanitizeBrowserRunnerMessage(message),
						pathname: path,
						sessionId
					})
				);
			}
		});
	}

	provider.openPage = async (sessionId, url, options): Promise<void> => {
		const previous = provider.pages.get(sessionId);
		if (previous) expectedClose.set(previous, 'session-replaced');
		const opening = openPage(sessionId, url, options);
		if (previous) void cleanupNetwork(previous);
		await opening;
		const page = provider.getPage(sessionId);
		instrument(page, sessionId);
		if (network) {
			const setup = setupNetwork(page, sessionId);
			networkCleanups.set(page, setup);
			await setup;
		}
	};
	provider.close = async (): Promise<void> => {
		const pages = [...provider.pages.values()];
		for (const page of pages) expectedClose.set(page, 'provider-teardown');
		write('provider-close-requested', { browser: provider.browserName });
		const closing = close();
		for (const page of pages) void cleanupNetwork(page);
		await closing;
	};
	return provider;
}

export function instrumentPlaywrightBrowserProvider(
	provider: BrowserProvider,
	networkEnabled = process.env.ZUI_BROWSER_NETWORK_DIAGNOSTICS === '1'
): PlaywrightBrowserProvider {
	if (!(provider instanceof PlaywrightBrowserProvider))
		throw new TypeError('ZUI browser diagnostics require PlaywrightBrowserProvider.');
	return instrumentBrowserRunnerProvider(
		provider,
		playwrightPageHooks,
		report,
		shouldEnableBrowserRunnerNetwork(provider.browserName, networkEnabled)
			? playwrightNetworkHooks
			: undefined
	);
}

export function wrapSynchronousBrowserRunnerFactory<TProject, TProvider>(
	factory: (project: TProject) => TProvider,
	instrument: (provider: TProvider) => TProvider
): (project: TProject) => TProvider {
	return (project) => instrument(factory(project));
}

export function withBrowserRunnerDiagnostics(
	descriptor: BrowserProviderOption<PlaywrightProviderOptions>,
	enabled = process.env.ZUI_BROWSER_DIAGNOSTICS === '1'
): BrowserProviderOption<PlaywrightProviderOptions> {
	if (!enabled) return descriptor;
	return {
		...descriptor,
		providerFactory: wrapSynchronousBrowserRunnerFactory(descriptor.providerFactory, (provider) =>
			instrumentPlaywrightBrowserProvider(provider)
		)
	};
}

/** Adds observer-only Playwright lifecycle diagnostics when explicitly enabled. */
export function diagnosticPlaywright(
	options?: PlaywrightProviderOptions
): BrowserProviderOption<PlaywrightProviderOptions> {
	return withBrowserRunnerDiagnostics(
		playwright(options),
		process.env.ZUI_BROWSER_DIAGNOSTICS === '1' ||
			process.env.ZUI_BROWSER_NETWORK_DIAGNOSTICS === '1'
	);
}
