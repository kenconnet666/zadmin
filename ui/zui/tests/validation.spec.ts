import { describe, expect, it } from 'vitest';

import {
	errorsToMap,
	formDataToObject,
	issuesToFormErrors
} from '../src/runtime/form/validation.js';

describe('form validation adapters', () => {
	it('converts repeated FormData without losing File values', () => {
		const data = new FormData();
		data.append('tag', 'one');
		data.append('tag', 'two');
		data.append('name', 'alice');
		expect(formDataToObject(data)).toEqual({ name: 'alice', tag: ['one', 'two'] });
	});

	it('groups Standard Schema issues by the first property path and deduplicates messages', () => {
		const errors = issuesToFormErrors([
			{ message: 'Required', path: ['account'] },
			{ message: 'Required', path: [{ key: 'account' }] },
			{ message: 'Invalid', path: ['email'] },
			{ message: 'Form invalid' }
		]);
		expect(errors).toEqual({ '': ['Form invalid'], account: ['Required'], email: ['Invalid'] });
		expect(errorsToMap(errors).get('account')).toEqual(['Required']);
	});
});
