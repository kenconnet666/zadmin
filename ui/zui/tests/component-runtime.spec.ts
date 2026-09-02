import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { ControllableState } from '../src/runtime/foundation/controllable-state.svelte.js';
import {
	mergeAriaIds,
	mergeFieldMessages,
	normalizeFieldMessages
} from '../src/runtime/form/form-control.svelte.js';

describe('component runtime state', () => {
	it('keeps user updates, external updates and reset behavior distinct', () => {
		let external: string | undefined;
		const changes: (string | undefined)[] = [];
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

	it('writes through without masking an external owner that rejects the update', () => {
		let external = 'before';
		let written: string | undefined;
		const state = new ControllableState({
			defaultValue: () => 'seed',
			read: () => external,
			write: (value: string) => (written = value)
		});

		state.setFromUser('next');
		expect(written).toBe('next');
		expect(state.current).toBe('before');

		state.setFromUser('accepted');
		external = 'accepted';
		expect(state.current).toBe('accepted');
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

	it('preserves immutable object identity instead of mixing raw values with deep proxies', () => {
		const initial = Object.freeze(['one', 'two'] as const);
		let external: readonly string[] | undefined;
		let notifications = 0;
		const state = new ControllableState<readonly string[]>({
			defaultValue: () => initial,
			onChange: () => () => (notifications += 1),
			read: () => external,
			write: (value) => (external = value)
		});

		expect(state.current).toBe(initial);
		state.setFromUser(initial);
		expect(notifications).toBe(0);
		expect(external).toBeUndefined();
	});

	it('treats equivalent proxy-shaped arrays and records as the same public value', () => {
		let external: readonly string[] | undefined;
		let notifications = 0;
		const state = new ControllableState({
			defaultValue: () => ['one', 'two'] as const,
			onChange: () => () => (notifications += 1),
			read: () => external,
			write: (value: readonly string[]) => (external = value)
		});

		state.setFromUser(['one', 'two']);
		state.setFromUser(['one', 'two']);
		expect(notifications).toBe(0);

		let record: { value: string; nested: { enabled: boolean } } | undefined;
		const recordState = new ControllableState({
			defaultValue: () => ({ value: 'ready', nested: { enabled: true } }),
			onChange: () => () => (notifications += 1),
			read: () => record,
			write: (value: { value: string; nested: { enabled: boolean } }) => (record = value)
		});
		recordState.setFromUser({ value: 'ready', nested: { enabled: true } });
		expect(notifications).toBe(0);
	});

	it('treats null as an explicit empty value instead of an uncontrolled signal', () => {
		let external: string | null | undefined;
		const state = new ControllableState<string | null>({
			defaultValue: () => 'seed',
			read: () => external,
			write: (value) => (external = value)
		});

		external = null;
		expect(state.current).toBeNull();
		external = undefined;
		expect(state.current).toBe('seed');
	});

	it('preserves the undefined fallback by default for non-nullable state', () => {
		let external: string | undefined = 'outside';
		const state = new ControllableState<string>({
			defaultValue: () => 'seed',
			read: () => external,
			write: (value) => (external = value)
		});

		expect(state.current).toBe('outside');
		external = undefined;
		expect(state.current).toBe('seed');
	});

	it('relinquishes the initial fallback after a write-through update and resets explicitly', () => {
		let external: string | undefined;
		const changes: (string | undefined)[] = [];
		const state = new ControllableState<string | undefined>({
			defaultValue: () => 'seed',
			onChange: () => (value) => changes.push(value),
			read: () => external,
			undefinedIsValue: true,
			write: (value) => (external = value)
		});

		expect(state.current).toBe('seed');
		state.setFromUser('typed');
		expect(external).toBe('typed');
		expect(changes).toEqual(['typed']);

		external = undefined;
		expect(state.current).toBeUndefined();

		state.reset();
		expect(external).toBe('seed');
		expect(state.current).toBe('seed');
		expect(changes).toEqual(['typed']);
	});
});

describe('form control helpers', () => {
	it('normalizes messages and merges unique ARIA ids in order', () => {
		expect(normalizeFieldMessages(undefined)).toEqual([]);
		expect(normalizeFieldMessages('Required')).toEqual(['Required']);
		expect(normalizeFieldMessages(['First', '', 'Second'])).toEqual(['First', 'Second']);
		expect(mergeFieldMessages('Required', ['Required', 'Try again'])).toEqual([
			'Required',
			'Try again'
		]);
		expect(mergeAriaIds('help error', 'error extra', undefined)).toBe('help error extra');
	});
});
