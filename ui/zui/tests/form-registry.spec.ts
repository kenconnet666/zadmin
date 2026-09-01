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
});
