import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
	ControllableState,
	sameStateValue
} from '../src/runtime/foundation/controllable-state.svelte.js';
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

	it('distinguishes sparse array holes from own undefined slots in both directions', () => {
		const sparse = new Array<number>(1);
		const dense = [undefined] as unknown as number[];
		let sparseExternal: number[] | undefined;
		let sparseNotifications = 0;
		const sparseState = new ControllableState<number[]>({
			defaultValue: () => sparse,
			onChange: () => () => (sparseNotifications += 1),
			read: () => sparseExternal,
			write: (value) => (sparseExternal = value)
		});

		sparseState.setFromUser(new Array<number>(1));
		expect(sparseNotifications).toBe(0);
		sparseState.setFromUser(dense);
		expect(sparseNotifications).toBe(1);

		let denseExternal: number[] | undefined;
		let denseNotifications = 0;
		const denseState = new ControllableState<number[]>({
			defaultValue: () => dense,
			onChange: () => () => (denseNotifications += 1),
			read: () => denseExternal,
			write: (value) => (denseExternal = value)
		});
		denseState.setFromUser(new Array<number>(1));
		expect(denseNotifications).toBe(1);
	});

	it('keeps nested and circular arrays structurally stable', () => {
		const sparseNested = [new Array<number>(1)];
		const sameSparseNested = [new Array<number>(1)];
		let external: unknown[] | undefined;
		let notifications = 0;
		const nestedState = new ControllableState<unknown[]>({
			defaultValue: () => sparseNested,
			onChange: () => () => (notifications += 1),
			read: () => external,
			write: (value) => (external = value)
		});

		nestedState.setFromUser(sameSparseNested);
		expect(notifications).toBe(0);

		const circularA: unknown[] = [];
		circularA.push(circularA);
		const circularB: unknown[] = [];
		circularB.push(circularB);
		nestedState.setFromUser(circularA);
		expect(notifications).toBe(1);
		nestedState.setFromUser(circularB);
		expect(notifications).toBe(1);
	});

	it('terminates for different cycle lengths without conflating unequal nested contents', () => {
		const one: unknown[] = [];
		one.push(one, 'same');
		const first: unknown[] = [];
		const second: unknown[] = [];
		first.push(second, 'same');
		second.push(first, 'same');
		expect(sameStateValue(one, first)).toBe(true);
		expect(sameStateValue(first, one)).toBe(true);
		second[1] = 'different';
		expect(sameStateValue(one, first)).toBe(false);
		expect(sameStateValue(first, one)).toBe(false);

		interface Node {
			next?: Node;
			value: string;
		}
		const left: Node = { value: 'same' };
		left.next = left;
		const right: Node = { value: 'same' };
		const tail: Node = { next: right, value: 'same' };
		right.next = tail;
		expect(sameStateValue(left, right)).toBe(true);
		expect(sameStateValue(right, left)).toBe(true);
		tail.value = 'different';
		expect(sameStateValue(left, right)).toBe(false);
		expect(sameStateValue(right, left)).toBe(false);

		const shared = { value: 1 };
		expect(sameStateValue([shared, shared], [{ value: 1 }, { value: 1 }])).toBe(true);
		expect(sameStateValue([{ value: 1 }, { value: 1 }], [shared, shared])).toBe(true);
		expect(sameStateValue({}, { value: undefined })).toBe(false);
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
		expect(normalizeFieldMessages([' ', '\t\n', ' Keep spaces '])).toEqual([' Keep spaces ']);
		expect(mergeFieldMessages('Required', ['Required', 'Try again'])).toEqual([
			'Required',
			'Try again'
		]);
		expect(mergeAriaIds('help error', 'error extra', undefined)).toBe('help error extra');
	});
});
