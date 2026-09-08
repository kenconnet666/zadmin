import { playwright } from '@vitest/browser-playwright';
import { describe, expect, it } from 'vitest';

import {
	browserRunnerCloseReason,
	browserRunnerPathname,
	sanitizeBrowserRunnerMessage,
	withBrowserRunnerDiagnostics
} from '../scripts/browser-runner-diagnostics.js';

describe('browser runner diagnostics', () => {
	it('leaves the Playwright descriptor identity untouched while diagnostics are disabled', () => {
		const descriptor = playwright({ launchOptions: { channel: 'chromium' } });
		expect(withBrowserRunnerDiagnostics(descriptor, false)).toBe(descriptor);
	});

	it('redacts URL authority, query and hash while normalizing and bounding diagnostics', () => {
		expect(
			browserRunnerPathname('https://user:password@example.test/private/runner?token=secret#hash')
		).toBe('/private/runner');
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
	});
});
