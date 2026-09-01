import { describe, expect, it } from 'vitest';

import {
	errorsToMap,
	formDataToObject,
	issuesToFormErrors
} from '../src/runtime/form/validation.js';
import {
	fieldPathKey,
	fieldPathToString,
	normalizeFieldPath
} from '../src/runtime/form/field-path.js';

describe('form validation adapters', () => {
	it('converts repeated FormData without losing File values', () => {
		const data = new FormData();
		data.append('tag', 'one');
		data.append('tag', 'two');
		data.append('name', 'alice');
		expect(formDataToObject(data)).toEqual({ name: 'alice', tag: ['one', 'two'] });
	});

	it('builds nested Standard Schema input from registered typed paths', () => {
		const data = new FormData();
		data.append('users[0].email', 'alice@example.com');
		data.append('roles', 'admin');
		data.append('roles', 'editor');
		expect(
			formDataToObject(
				data,
				new Map([
					['users[0].email', ['users', 0, 'email']],
					['roles', ['roles']]
				])
			)
		).toEqual({ roles: ['admin', 'editor'], users: [{ email: 'alice@example.com' }] });
	});

	it('groups Standard Schema issues by the complete property path and deduplicates messages', () => {
		const errors = issuesToFormErrors([
			{ message: 'Required', path: ['users', 0, 'account'] },
			{ message: 'Required', path: [{ key: 'users' }, { key: 0 }, { key: 'account' }] },
			{ message: 'Invalid', path: ['email'] },
			{ message: 'Form invalid' }
		]);
		expect(errors).toEqual({
			'': ['Form invalid'],
			email: ['Invalid'],
			'users[0].account': ['Required']
		});
		expect(errorsToMap(errors).get('users[0].account')).toEqual(['Required']);
	});

	it('keeps scalar punctuation and typed numeric segments collision-free', () => {
		expect(fieldPathToString(normalizeFieldPath(['users', 0, 'email']))).toBe('users[0].email');
		expect(fieldPathToString(normalizeFieldPath('users[0].email'))).toBe('["users[0].email"]');
		expect(fieldPathKey(['1'])).not.toBe(fieldPathKey([1]));
		expect(() => normalizeFieldPath([])).toThrow(/cannot be empty/u);
		expect(() => normalizeFieldPath(['users', -1])).toThrow(/non-negative/u);
	});
});
