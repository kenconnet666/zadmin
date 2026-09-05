import { describe, expect, it, vi } from 'vitest';

import { fieldPathToString } from '../src/runtime/form/field-path.js';
import { FormRegistry } from '../src/runtime/form/form-registry.svelte.js';

function register(
	registry: FormRegistry,
	instanceId: string,
	path: string | readonly (string | number)[],
	control: () => HTMLElement | null = () => null,
	dependencies: readonly (string | readonly (string | number)[])[] = []
) {
	return registry.register({
		control,
		dependencies,
		htmlName: fieldPathToString(Array.isArray(path) ? path : [path]),
		instanceId,
		path
	});
}

describe('FormRegistry', () => {
	it('tracks path state, permits repeated instances and restores the immutable initial snapshot', async () => {
		const unmounted: string[] = [];
		const registry = new FormRegistry((path) => unmounted.push(fieldPathToString(path)));
		expect(registry.state('missing')).toEqual({
			dirty: false,
			errors: [],
			success: undefined,
			touched: false,
			validating: false,
			warnings: []
		});
		const unregisterA = register(registry, 'a-1', ['users', 0, 'account']);
		const unregisterASecond = register(registry, 'a-2', ['users', 0, 'account']);
		const unregisterB = register(registry, 'b', 'email');
		expect(() => register(registry, 'a-1', 'other')).toThrow(/instance/u);
		expect(() =>
			registry.register({
				control: () => null,
				htmlName: 'email',
				instanceId: 'conflict',
				path: 'different'
			})
		).toThrow(/multiple FieldPaths/u);
		expect(() =>
			registry.register({
				control: () => null,
				htmlName: 'users[0].account.email',
				instanceId: 'nested-conflict',
				path: ['users', 0, 'account', 'email']
			})
		).toThrow(/Conflicting ZForm FieldPaths/u);
		expect(() =>
			registry.register({
				control: () => null,
				htmlName: '',
				instanceId: 'empty-html-name',
				path: 'empty'
			})
		).toThrow(/htmlName must not be empty/u);
		const childFirst = new FormRegistry();
		register(childFirst, 'child', ['profile', 'email']);
		expect(() => register(childFirst, 'parent', 'profile')).toThrow(
			/Conflicting ZForm FieldPaths/u
		);

		registry.markDirty('a-1');
		registry.markTouched('a-2');
		registry.markAllTouched();
		registry.setFieldState(['users', 0, 'account'], {
			success: 'Available',
			warnings: ['Public profile']
		});
		registry.syncErrors({ 'users[0].account': ['Invalid'] });
		expect(registry.state(['users', 0, 'account'])).toMatchObject({
			dirty: true,
			errors: ['Invalid'],
			success: undefined,
			touched: true,
			warnings: ['Public profile']
		});
		registry.reset();
		expect(registry.state(['users', 0, 'account']).dirty).toBe(false);
		unregisterA();
		expect(registry.registeredPaths()).toContainEqual(['users', 0, 'account']);
		unregisterASecond();
		unregisterB();
		await Promise.resolve();
		expect(registry.registeredPaths()).toEqual([]);
		expect(unmounted).toEqual(['users[0].account', 'email']);
	});

	it('walks transitive dependency edges and rejects stale validation results per path', () => {
		const registry = new FormRegistry();
		register(registry, 'password', 'password');
		register(registry, 'confirm', 'confirm', () => null, ['password']);
		register(registry, 'summary', 'summary', () => null, ['confirm']);
		expect(registry.affectedPaths('password')).toEqual([['password'], ['confirm'], ['summary']]);

		const stale = registry.beginValidation([['password']]);
		const current = registry.beginValidation([['password']]);
		expect(registry.finishValidation(stale, { password: ['Stale'] })).toEqual([]);
		expect(registry.finishValidation(current, { password: ['Current'] })).toEqual([['password']]);
		expect(registry.state('password')).toMatchObject({
			errors: ['Current'],
			validating: false
		});
	});

	it('preserves state when the same path re-registers during a Svelte effect turn', async () => {
		const unmounted: string[] = [];
		const registry = new FormRegistry((path) => unmounted.push(fieldPathToString(path)));
		const unregister = register(registry, 'before', 'account');
		registry.markDirty('before');
		unregister();
		const unregisterNext = register(registry, 'after', 'account');
		await Promise.resolve();
		expect(registry.state('account').dirty).toBe(true);
		expect(unmounted).toEqual([]);
		unregisterNext();
		await Promise.resolve();
		expect(unmounted).toEqual(['account']);
	});

	it('focuses and scrolls the registered control for a typed path', () => {
		const candidateFocus = vi.fn();
		const rootFocus = vi.fn();
		const scrollIntoView = vi.fn();
		const candidate = { focus: candidateFocus } as unknown as HTMLElement;
		const root = {
			focus: rootFocus,
			isConnected: false,
			querySelector: () => candidate,
			scrollIntoView
		} as unknown as HTMLElement;
		const registry = new FormRegistry();
		register(registry, 'first', ['users', 1, 'email'], () => root);
		registry.syncErrors({ 'users[1].email': ['Invalid'] });
		expect(registry.firstInvalidPath()).toEqual(['users', 1, 'email']);
		expect(registry.focusField(['users', 1, 'email'])).toBe(true);
		expect(candidateFocus).toHaveBeenCalledOnce();
		expect(registry.scrollToField(['users', 1, 'email'])).toBe(true);
		expect(scrollIntoView).toHaveBeenCalledOnce();
		expect(registry.focusField('missing')).toBe(false);
	});

	it('subscribes to real immutable state transitions without an initial emission', async () => {
		const registry = new FormRegistry();
		const unregisterFirst = register(registry, 'first', 'account');
		const unregisterSecond = register(registry, 'second', 'account');
		const listener = vi.fn();
		const unsubscribe = registry.subscribeField('account', listener);

		expect(listener).not.toHaveBeenCalled();
		registry.markDirty('first');
		registry.markDirty('first');
		registry.markTouched('second');
		const validation = registry.beginValidation([['account']]);
		registry.finishValidation(validation, { account: ['Invalid'] });
		registry.syncErrors({ account: ['Invalid'] });
		registry.reset();

		expect(listener).toHaveBeenCalledTimes(5);
		for (const [state] of listener.mock.calls) {
			expect(Object.isFrozen(state)).toBe(true);
			expect(Object.isFrozen(state.errors)).toBe(true);
			expect(Object.isFrozen(state.warnings)).toBe(true);
		}
		expect(listener.mock.calls.map(([state]) => state)).toEqual([
			expect.objectContaining({ dirty: true }),
			expect.objectContaining({ dirty: true, touched: true }),
			expect.objectContaining({ validating: true }),
			expect.objectContaining({ validating: false, errors: ['Invalid'] }),
			expect.objectContaining({ dirty: false, touched: false, errors: [] })
		]);

		unsubscribe();
		unsubscribe();
		registry.markDirty('first');
		expect(listener).toHaveBeenCalledTimes(5);
		unregisterFirst();
		unregisterSecond();
		await Promise.resolve();
		registry.markDirty('first');
		expect(listener).toHaveBeenCalledTimes(5);
	});

	it('isolates listener exceptions and clears all listeners after the last instance unmounts', async () => {
		const registry = new FormRegistry();
		const unregister = register(registry, 'account', 'account');
		const broken = vi.fn(() => {
			throw new Error('consumer failure');
		});
		const healthy = vi.fn();
		registry.subscribeField('account', broken);
		registry.subscribeField('account', healthy);

		registry.markTouched('account');
		expect(broken).toHaveBeenCalledOnce();
		expect(healthy).toHaveBeenCalledOnce();
		expect(registry.state('account').touched).toBe(true);

		unregister();
		await Promise.resolve();
		const fresh = register(registry, 'account-again', 'account');
		registry.markDirty('account-again');
		expect(broken).toHaveBeenCalledOnce();
		expect(healthy).toHaveBeenCalledOnce();
		fresh();
	});

	it('normalizes equivalent paths and rejects non-function listeners', () => {
		const registry = new FormRegistry();
		register(registry, 'account', ['users', 0, 'account']);
		const listener = vi.fn();
		registry.subscribeField(['users', 0, 'account'], listener);
		registry.markDirty('account');
		expect(listener).toHaveBeenCalledOnce();
		expect(() => registry.subscribeField('account', null as never)).toThrow(/listener/u);
	});
});
