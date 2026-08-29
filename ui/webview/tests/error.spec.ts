import { describe, expect, it } from 'vitest';

import {
	captureDesktop,
	desktopError,
	isConfirmedDesktopAction,
	isDesktopError,
	normalizeDesktopError,
	validateExternalUrl
} from '../src/platform/index.js';

describe('desktop error normalization', () => {
	it('preserves typed errors and classifies transport failures', () => {
		const typed = desktopError('invalid-input', 'test', 'bad');
		expect(isDesktopError(typed)).toBe(true);
		expect(normalizeDesktopError('other', typed)).toBe(typed);
		expect(normalizeDesktopError('test', new Error('WebView transport failed'))).toMatchObject({
			code: 'transport-error',
			retryable: true
		});
		expect(normalizeDesktopError('test', new Error('request timeout'))).toMatchObject({
			code: 'timeout'
		});
		expect(normalizeDesktopError('test', new Error('protocol version mismatch'))).toMatchObject({
			code: 'protocol-error'
		});
		expect(normalizeDesktopError('test', new Error('permission forbidden'))).toMatchObject({
			code: 'permission-denied'
		});
		expect(normalizeDesktopError('test', new Error('other'))).toMatchObject({
			code: 'system-error'
		});
		expect(normalizeDesktopError('test', new DOMException('aborted', 'AbortError'))).toMatchObject({
			code: 'cancelled'
		});
		expect(isDesktopError(null)).toBe(false);
		expect(isConfirmedDesktopAction({ confirmed: true })).toBe(true);
		expect(isConfirmedDesktopAction({ confirmed: false })).toBe(false);
	});

	it('captures thrown operations and invalid URLs', async () => {
		await expect(captureDesktop('test', () => 42)).resolves.toEqual({ ok: true, value: 42 });
		await expect(
			captureDesktop('test', () => {
				throw new Error('failed');
			})
		).resolves.toMatchObject({
			error: { code: 'system-error' },
			ok: false
		});
		expect(validateExternalUrl('not-a-url', [])).toMatchObject({
			error: { code: 'invalid-input' }
		});
	});
});
