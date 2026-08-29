import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { ControllableState } from '../src/lib/component-runtime/controllable-state.svelte.js';
import {
	mergeAriaIds,
	normalizeFieldMessages
} from '../src/lib/component-runtime/form-control.svelte.js';

describe('component runtime state', () => {
	it('keeps user updates, external updates and reset behavior distinct', () => {
		let external: string | undefined;
		const changes: string[] = [];
		const state = new ControllableState({
			defaultValue: () => 'seed',
			onChange: () => (value) => changes.push(value),
			read: () => external,
			write: (value) => (external = value)
		});

		expect(state.current).toBe('seed');
		state.setFromUser('typed');
		expect(state.current).toBe('typed');
		expect(changes).toEqual(['typed']);

		external = 'outside';
		expect(state.current).toBe('outside');
		expect(changes).toEqual(['typed']);

		state.reset();
		expect(state.current).toBe('seed');
		expect(changes).toEqual(['typed']);
	});

	it('notifies exactly once for each distinct generated user value', () => {
		fc.assert(
			fc.property(fc.array(fc.string(), { maxLength: 100 }), (values) => {
				let external: string | undefined;
				let notifications = 0;
				const state = new ControllableState({
					defaultValue: () => '',
					onChange: () => () => (notifications += 1),
					read: () => external,
					write: (value) => (external = value)
				});
				let previous = '';
				let expected = 0;
				for (const value of values) {
					if (!Object.is(previous, value)) expected += 1;
					state.setFromUser(value);
					previous = value;
				}
				expect(notifications).toBe(expected);
				expect(state.current).toBe(previous);
			})
		);
	});
});

describe('form control helpers', () => {
	it('normalizes messages and merges unique ARIA ids in order', () => {
		expect(normalizeFieldMessages(undefined)).toEqual([]);
		expect(normalizeFieldMessages('Required')).toEqual(['Required']);
		expect(normalizeFieldMessages(['First', '', 'Second'])).toEqual(['First', 'Second']);
		expect(mergeAriaIds('help error', 'error extra', undefined)).toBe('help error extra');
	});
});
