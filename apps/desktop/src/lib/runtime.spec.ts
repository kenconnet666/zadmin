import { describe, expect, it } from 'vitest';

import { desktopError, desktopFail, desktopOk } from '@zadmin/tauri';

import { resultMessage } from './runtime.js';

describe('desktop capability lab result formatting', () => {
	it('formats success and failure without dropping error codes', () => {
		expect(resultMessage(desktopOk(2), String)).toBe('2');
		expect(
			resultMessage(desktopFail(desktopError('permission-denied', 'probe', 'denied')), String)
		).toBe('permission-denied: denied');
	});
});
