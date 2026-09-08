import { playwright } from '@vitest/browser-playwright';
import { describe, expect, it, vi } from 'vitest';
import type { BrowserProvider } from 'vitest/node';

import {
	browserRunnerCloseReason,
	browserRunnerPathname,
	instrumentBrowserRunnerProvider,
	instrumentPlaywrightBrowserProvider,
	observeBrowserRunnerNetwork,
	sanitizeBrowserRunnerMessage,
	shouldEnableBrowserRunnerNetwork,
	withBrowserRunnerDiagnostics,
	wrapSynchronousBrowserRunnerFactory,
	type BrowserRunnerPageHooks,
	type BrowserRunnerPageObserver,
	type BrowserRunnerProviderLike,
	type BrowserRunnerNetworkSession
} from '../scripts/browser-runner-diagnostics.js';

interface TestPage {
	observer?: BrowserRunnerPageObserver;
	readonly url: string;
}

class TestSocket {
	readonly url: string;
	#close: (() => void) | undefined;
	#error: ((message: string) => void) | undefined;

	constructor(url: string) {
		this.url = url;
	}

	onClose(listener: () => void): void {
		this.#close = listener;
	}

	onError(listener: (message: string) => void): void {
		this.#error = listener;
	}

	close(): void {
		this.#close?.();
	}

	error(message: string): void {
		this.#error?.(message);
	}
}

class TestProvider implements BrowserRunnerProviderLike<TestPage> {
	readonly browserName = 'chromium';
	readonly pages = new Map<string, TestPage>();
	closeCount = 0;
	readonly openCalls: {
		readonly parallel: boolean;
		readonly sessionId: string;
		readonly url: string;
	}[] = [];
	#nextPage: TestPage | undefined;

	queue(page: TestPage): void {
		this.#nextPage = page;
	}

	async openPage(
		sessionId: string,
		url: string,
		options: { readonly parallel: boolean }
	): Promise<void> {
		this.openCalls.push({ parallel: options.parallel, sessionId, url });
		this.pages.get(sessionId)?.observer?.close();
		if (!this.#nextPage) throw new Error('Test provider needs a queued page.');
		this.pages.set(sessionId, this.#nextPage);
		this.#nextPage = undefined;
	}

	getPage(sessionId: string): TestPage {
		const page = this.pages.get(sessionId);
		if (!page) throw new Error(`Missing test page ${sessionId}.`);
		return page;
	}

	async close(): Promise<void> {
		this.closeCount += 1;
		for (const page of this.pages.values()) page.observer?.close();
		this.pages.clear();
	}
}

const testPageHooks: BrowserRunnerPageHooks<TestPage> = {
	observe(page, observer) {
		page.observer = observer;
	},
	url: (page) => page.url
};

interface DiagnosticEntry {
	readonly detail: Readonly<Record<string, boolean | string | undefined>>;
	readonly event: string;
}

class TestNetworkSession implements BrowserRunnerNetworkSession {
	detachCount = 0;
	enableCount = 0;
	unsubscribeCount = 0;
	loadingFailed:
		((event: { errorText: string; requestId: string; type: string }) => void) | undefined;
	webSocketClosed: ((event: { requestId: string }) => void) | undefined;
	webSocketCreated: ((event: { requestId: string; url: string }) => void) | undefined;
	webSocketFrameError: ((event: { errorMessage: string; requestId: string }) => void) | undefined;
	failEnable = false;
	failFrameRegistration = false;
	failUnsubscribeAt: number | undefined;

	async detach(): Promise<void> {
		this.detachCount += 1;
	}

	async enable(): Promise<void> {
		this.enableCount += 1;
		if (this.failEnable)
			throw new Error('enable https://secret.example/network?credential=hidden#private');
	}

	onLoadingFailed(listener: NonNullable<TestNetworkSession['loadingFailed']>): () => void {
		this.loadingFailed = listener;
		return () => {
			this.unsubscribeCount += 1;
			if (this.loadingFailed === listener) this.loadingFailed = undefined;
			if (this.unsubscribeCount === this.failUnsubscribeAt) throw new Error('unsubscribe failed');
		};
	}

	onWebSocketClosed(listener: NonNullable<TestNetworkSession['webSocketClosed']>): () => void {
		this.webSocketClosed = listener;
		return () => {
			this.unsubscribeCount += 1;
			if (this.webSocketClosed === listener) this.webSocketClosed = undefined;
			if (this.unsubscribeCount === this.failUnsubscribeAt) throw new Error('unsubscribe failed');
		};
	}

	onWebSocketCreated(listener: NonNullable<TestNetworkSession['webSocketCreated']>): () => void {
		this.webSocketCreated = listener;
		return () => {
			this.unsubscribeCount += 1;
			if (this.webSocketCreated === listener) this.webSocketCreated = undefined;
			if (this.unsubscribeCount === this.failUnsubscribeAt) throw new Error('unsubscribe failed');
		};
	}

	onWebSocketFrameError(
		listener: NonNullable<TestNetworkSession['webSocketFrameError']>
	): () => void {
		if (this.failFrameRegistration) throw new Error('frame registration failed');
		this.webSocketFrameError = listener;
		return () => {
			this.unsubscribeCount += 1;
			if (this.webSocketFrameError === listener) this.webSocketFrameError = undefined;
			if (this.unsubscribeCount === this.failUnsubscribeAt) throw new Error('unsubscribe failed');
		};
	}
}

describe('browser runner diagnostics', () => {
	it('leaves the Playwright descriptor identity untouched while diagnostics are disabled', () => {
		const descriptor = playwright({ launchOptions: { channel: 'chromium' } });
		expect(withBrowserRunnerDiagnostics(descriptor, false)).toBe(descriptor);
	});

	it('keeps provider factories synchronous and rejects a non-Playwright provider identity', () => {
		const descriptor = playwright({ launchOptions: { channel: 'chromium' } });
		const enabled = withBrowserRunnerDiagnostics(descriptor, true);
		expect(enabled).not.toBe(descriptor);
		expect(enabled.name).toBe(descriptor.name);
		expect(enabled.options).toBe(descriptor.options);
		expect(enabled.prewarm).toBe(descriptor.prewarm);
		expect(enabled.serverFactory).toBe(descriptor.serverFactory);
		expect(enabled.providerFactory).not.toBe(descriptor.providerFactory);

		const project = Object.freeze({ name: 'project' });
		interface FactoryProvider {
			readonly instrumented: boolean;
			readonly name: string;
		}
		const provider: FactoryProvider = Object.freeze({ instrumented: false, name: 'provider' });
		const instrumented: FactoryProvider = Object.freeze({ instrumented: true, name: 'provider' });
		const factory = vi.fn((candidate: typeof project) => {
			expect(candidate).toBe(project);
			return provider;
		});
		const instrument = vi.fn((candidate: typeof provider) => {
			expect(candidate).toBe(provider);
			return instrumented;
		});
		const wrapped = wrapSynchronousBrowserRunnerFactory(factory, instrument);
		const result = wrapped(project);
		expect(result).toBe(instrumented);
		expect(result).not.toBeInstanceOf(Promise);
		expect(factory).toHaveBeenCalledWith(project);
		expect(instrument).toHaveBeenCalledWith(provider);

		const invalidProvider = {
			close: async () => undefined,
			getCommandsContext: () => ({}),
			name: 'not-playwright',
			openPage: async () => undefined,
			supportsParallelism: false
		} satisfies BrowserProvider;
		expect(() => instrumentPlaywrightBrowserProvider(invalidProvider)).toThrow(
			/require PlaywrightBrowserProvider/u
		);
	});

	it('redacts URL authority, query and hash while normalizing and bounding diagnostics', () => {
		expect(
			browserRunnerPathname('https://user:password@example.test/private/runner?token=secret#hash')
		).toBe('/private/runner');
		expect(browserRunnerPathname('not a url')).toBe('[invalid-url]');
		const message = sanitizeBrowserRunnerMessage(
			'failed\r\nhttps://user:password@example.test/private/runner?token=secret#hash\tnext'
		);
		expect(message).toBe('failed /private/runner next');
		expect(message).not.toMatch(/example|password|secret|hash/u);
		expect(
			sanitizeBrowserRunnerMessage('HTTPS://user:password@example.test/private?token=secret#hash')
		).toBe('/private');
		expect(sanitizeBrowserRunnerMessage('x'.repeat(700))).toHaveLength(500);
	});

	it('distinguishes replacement and teardown from an unexpected page close', () => {
		expect(browserRunnerCloseReason()).toBe('unexpected');
		expect(browserRunnerCloseReason('session-replaced')).toBe('session-replaced');
		expect(browserRunnerCloseReason('provider-teardown')).toBe('provider-teardown');
		expect(shouldEnableBrowserRunnerNetwork('chromium', true)).toBe(true);
		expect(shouldEnableBrowserRunnerNetwork('firefox', true)).toBe(false);
		expect(shouldEnableBrowserRunnerNetwork('chromium', false)).toBe(false);
	});

	it('observes real wrapper page, socket and console branches with replacement and teardown leases', async () => {
		const entries: DiagnosticEntry[] = [];
		const firstNetworkCleanup = vi.fn(async () => undefined);
		const secondNetworkCleanup = vi.fn(async () => undefined);
		const networkCleanups = [firstNetworkCleanup, secondNetworkCleanup];
		let networkSetupIndex = 0;
		const networkSetup = vi.fn(async () => networkCleanups[networkSetupIndex++]!);
		const provider = instrumentBrowserRunnerProvider(
			new TestProvider(),
			testPageHooks,
			(event, detail) => entries.push({ detail, event }),
			{ setup: networkSetup }
		);
		const first: TestPage = {
			url: 'https://runner.test/__vitest_test__/?token=first#hash'
		};
		provider.queue(first);
		await provider.openPage('session-1', 'https://ignored.test', { parallel: false });
		expect(provider.openCalls).toEqual([
			{ parallel: false, sessionId: 'session-1', url: 'https://ignored.test' }
		]);
		expect(entries[0]).toEqual({
			detail: { pathname: '/__vitest_test__/', sessionId: 'session-1' },
			event: 'page-ready'
		});

		first.observer!.mainFrameNavigation(
			'https://secret.example/next/page?credential=hidden#private'
		);
		first.observer!.pageError('failed at https://secret.example/source?credential=hidden#private');
		first.observer!.crash();
		first.observer!.console('log', 'ignored Vite text');
		first.observer!.console('warning', 'ordinary warning');
		first.observer!.console(
			'warning',
			'Vite reload https://secret.example/reload?credential=hidden#private'
		);
		first.observer!.console(
			'error',
			'failed https://secret.example/error?credential=hidden#private'
		);
		const control = new TestSocket(
			'wss://runner.test/__vitest_browser_api__?token=control#private'
		);
		first.observer!.websocket(control);
		control.error('socket https://secret.example/socket?credential=hidden#private');
		control.close();
		const vite = new TestSocket('wss://runner.test/@vite/client?token=vite#private');
		first.observer!.websocket(vite);
		vite.close();
		const other = new TestSocket('wss://runner.test/socket?token=other#private');
		first.observer!.websocket(other);
		other.close();

		const second: TestPage = { url: 'https://runner.test/__vitest_test__/?token=second' };
		provider.queue(second);
		await provider.openPage('session-1', 'https://ignored.test', { parallel: true });
		await provider.close();

		const eventNames = entries.map(({ event }) => event);
		expect(eventNames).toEqual([
			'page-ready',
			'main-frame-navigation',
			'page-error',
			'page-crash',
			'page-console',
			'page-console',
			'websocket-error',
			'websocket-close',
			'websocket-close',
			'websocket-close',
			'page-close',
			'page-ready',
			'provider-close-requested',
			'page-close'
		]);
		expect(entries[1]?.detail).toEqual({
			closeReason: 'unexpected',
			fromPathname: '/__vitest_test__/',
			sessionId: 'session-1',
			toPathname: '/next/page'
		});
		expect(entries[2]?.detail.message).toBe('failed at /source');
		expect(entries[3]?.detail.closeReason).toBe('unexpected');
		expect(entries[4]?.detail.message).toBe('Vite reload /reload');
		expect(entries[5]?.detail.message).toBe('failed /error');
		expect(entries[6]?.detail).toMatchObject({
			kind: 'vitest-control',
			message: 'socket /socket',
			pathname: '/__vitest_browser_api__'
		});
		expect(entries[7]?.detail.pageState).toBe('active');
		expect(entries[8]?.detail.kind).toBe('vite');
		expect(entries[9]?.detail.kind).toBe('other');
		expect(entries[10]?.detail.closeReason).toBe('session-replaced');
		expect(entries[13]?.detail.closeReason).toBe('provider-teardown');
		expect(networkSetup).toHaveBeenCalledTimes(2);
		expect(firstNetworkCleanup).toHaveBeenCalledOnce();
		expect(secondNetworkCleanup).toHaveBeenCalledOnce();
		expect(JSON.stringify(entries)).not.toMatch(/secret|credential|hidden|private|token=/u);
	});

	it('records only mapped CDP websocket failures and releases every hook exactly once', async () => {
		const entries: DiagnosticEntry[] = [];
		const session = new TestNetworkSession();
		const cleanup = await observeBrowserRunnerNetwork(session, 'network-session', (event, detail) =>
			entries.push({ detail, event })
		);
		expect(session.enableCount).toBe(1);

		session.webSocketCreated?.({
			requestId: 'control',
			url: 'wss://runner.test/__vitest_browser_api__?token=secret#private'
		});
		session.webSocketFrameError?.({
			errorMessage:
				'net::ERR_INSUFFICIENT_RESOURCES https://secret.example/socket?credential=hidden#private',
			requestId: 'control'
		});
		session.loadingFailed?.({
			errorText: 'net::ERR_CONNECTION_FAILED',
			requestId: 'control',
			type: 'WebSocket'
		});
		session.loadingFailed?.({
			errorText: 'ignored',
			requestId: 'ordinary-resource',
			type: 'Image'
		});
		session.webSocketClosed?.({ requestId: 'control' });
		session.webSocketFrameError?.({ errorMessage: 'ignored after close', requestId: 'control' });

		expect(entries).toEqual([
			{
				detail: { sessionId: 'network-session' },
				event: 'network-ready'
			},
			{
				detail: {
					message: 'net::ERR_INSUFFICIENT_RESOURCES /socket',
					pathname: '/__vitest_browser_api__',
					sessionId: 'network-session'
				},
				event: 'network-websocket-frame-error'
			},
			{
				detail: {
					message: 'net::ERR_CONNECTION_FAILED',
					pathname: '/__vitest_browser_api__',
					resourceType: 'WebSocket',
					sessionId: 'network-session'
				},
				event: 'network-loading-failed'
			}
		]);
		expect(JSON.stringify(entries)).not.toMatch(/secret|credential|hidden|private|token=/u);
		await cleanup();
		await cleanup();
		expect(session.unsubscribeCount).toBe(4);
		expect(session.detachCount).toBe(1);

		const partial = new TestNetworkSession();
		partial.failFrameRegistration = true;
		await expect(observeBrowserRunnerNetwork(partial, 'partial', () => undefined)).rejects.toThrow(
			/frame registration failed/u
		);
		expect(partial.enableCount).toBe(0);
		expect(partial.unsubscribeCount).toBe(1);
		expect(partial.detachCount).toBe(1);

		const enableFailure = new TestNetworkSession();
		enableFailure.failEnable = true;
		await expect(
			observeBrowserRunnerNetwork(enableFailure, 'enable-failure', () => undefined)
		).rejects.toThrow(/enable/u);
		expect(enableFailure.unsubscribeCount).toBe(4);
		expect(enableFailure.detachCount).toBe(1);

		const unsubscribeFailure = new TestNetworkSession();
		unsubscribeFailure.failUnsubscribeAt = 2;
		const failingCleanup = await observeBrowserRunnerNetwork(
			unsubscribeFailure,
			'unsubscribe-failure',
			() => undefined
		);
		await expect(failingCleanup()).rejects.toThrow(/release browser network diagnostics/u);
		expect(unsubscribeFailure.unsubscribeCount).toBe(4);
		expect(unsubscribeFailure.detachCount).toBe(1);
	});

	it('contains async CDP setup races and reports diagnostic failures without rejecting openPage', async () => {
		const entries: DiagnosticEntry[] = [];
		const provider = new TestProvider();
		const page: TestPage = { url: 'https://runner.test/__vitest_test__/' };
		let resolveSetup: ((cleanup: () => Promise<void>) => void) | undefined;
		const cleanup = vi.fn(async () => undefined);
		const setup = vi.fn(
			() =>
				new Promise<() => Promise<void>>((resolve) => {
					resolveSetup = resolve;
				})
		);
		const instrumented = instrumentBrowserRunnerProvider(
			provider,
			testPageHooks,
			(event, detail) => entries.push({ detail, event }),
			{ setup }
		);
		provider.queue(page);
		const opening = instrumented.openPage('race', 'https://ignored.test', { parallel: false });
		await vi.waitFor(() => expect(page.observer).toBeDefined());
		const closing = instrumented.close();
		await expect(closing).resolves.toBeUndefined();
		expect(provider.closeCount).toBe(1);
		expect(cleanup).not.toHaveBeenCalled();
		resolveSetup?.(cleanup);
		await opening;
		await vi.waitFor(() => expect(cleanup).toHaveBeenCalledOnce());
		expect(cleanup).toHaveBeenCalledOnce();

		const failedProvider = new TestProvider();
		failedProvider.queue({ url: 'https://runner.test/__vitest_test__/' });
		const failed = instrumentBrowserRunnerProvider(
			failedProvider,
			testPageHooks,
			(event, detail) => entries.push({ detail, event }),
			{
				setup: async () => {
					throw new Error('setup https://secret.example/network?credential=hidden#private failed');
				}
			}
		);
		await expect(
			failed.openPage('failed', 'https://ignored.test', { parallel: false })
		).resolves.toBeUndefined();
		expect(entries.at(-1)).toEqual({
			detail: { message: 'setup /network failed', sessionId: 'failed' },
			event: 'network-diagnostic-setup-error'
		});

		const cleanupFailureProvider = new TestProvider();
		cleanupFailureProvider.queue({ url: 'https://runner.test/__vitest_test__/' });
		const cleanupFailure = instrumentBrowserRunnerProvider(
			cleanupFailureProvider,
			testPageHooks,
			(event, detail) => entries.push({ detail, event }),
			{
				setup: async () => async () => {
					throw new Error(
						'cleanup https://secret.example/network?credential=hidden#private failed'
					);
				}
			}
		);
		await cleanupFailure.openPage('cleanup-failed', 'https://ignored.test', { parallel: false });
		await expect(cleanupFailure.close()).resolves.toBeUndefined();
		await vi.waitFor(() =>
			expect(entries.find(({ event }) => event === 'network-diagnostic-cleanup-error')).toEqual({
				detail: { message: 'cleanup /network failed' },
				event: 'network-diagnostic-cleanup-error'
			})
		);
	});
});
