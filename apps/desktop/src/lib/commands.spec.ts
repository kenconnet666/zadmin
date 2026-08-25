import { describe, expect, it } from 'vitest';

import { isDesktopCommandError, normalizeCommandResult } from './commands.js';

describe('tauri-specta command boundary', () => {
	it('keeps generated domain errors discriminated', () => {
		expect(
			normalizeCommandResult({
				error: { code: 'invalid-request', details: { message: 'invalid' } },
				status: 'error'
			})
		).toMatchObject({ error: { code: 'invalid-input' }, ok: false });
		expect(
			normalizeCommandResult({
				error: { code: 'unsupported', details: { capability: 'camera' } },
				status: 'error'
			})
		).toMatchObject({ error: { code: 'unsupported' }, ok: false });
	});

	it('does not miscast transport strings as Rust domain errors', () => {
		expect(isDesktopCommandError('missing argument')).toBe(false);
		expect(normalizeCommandResult({ error: 'missing argument', status: 'error' })).toMatchObject({
			error: { code: 'transport-error' },
			ok: false
		});
	});

	it('passes successful generated results through', () => {
		expect(normalizeCommandResult({ data: 2, status: 'ok' })).toEqual({ ok: true, value: 2 });
	});
});
