import { describe, expect, it, vi } from 'vitest';

import { FormRegistry } from '../src/runtime/form/form-registry.svelte.js';

describe('FormRegistry', () => {
	it('tracks every field state and restores the immutable initial snapshot', () => {
		const registry = new FormRegistry();
		expect(registry.state('missing')).toEqual({
			dirty: false,
			errors: [],
			touched: false,
			validating: false
		});
		registry.markDirty('missing');
		const unregisterA = registry.register('a', () => null);
		const unregisterB = registry.register('b', () => null);
		expect(() => registry.register('a', () => null)).toThrow(/Duplicate/u);
		registry.markDirty('a');
		registry.markTouched('a');
		registry.markAllTouched();
		registry.setValidating(true);
		registry.setErrors(new Map([['a', ['Invalid']]]));
		expect(registry.state('a')).toMatchObject({
			dirty: true,
			errors: ['Invalid'],
			touched: true,
			validating: false
		});
		expect(registry.state('b')).toMatchObject({ errors: [], touched: true });
		registry.reset();
		expect(registry.state('a').dirty).toBe(false);
		unregisterA();
		unregisterB();
		expect(registry.state('a').errors).toEqual([]);
	});

	it('focuses the first invalid candidate or its registered root', () => {
		const candidateFocus = vi.fn();
		const rootFocus = vi.fn();
		const candidate = { focus: candidateFocus } as unknown as HTMLElement;
		const root = {
			focus: rootFocus,
			querySelector: () => candidate
		} as unknown as HTMLElement;
		const registry = new FormRegistry();
		registry.register('first', () => root);
		registry.register('second', () => null);
		registry.setErrors(
			new Map([
				['first', ['Invalid']],
				['second', ['Also invalid']]
			])
		);
		expect(registry.focusFirstInvalid()).toBe(true);
		expect(candidateFocus).toHaveBeenCalledOnce();

		const fallback = new FormRegistry();
		fallback.register('root', () => ({ focus: rootFocus, querySelector: () => null }) as never);
		fallback.setErrors(new Map([['root', ['Invalid']]]));
		expect(fallback.focusFirstInvalid()).toBe(true);
		expect(rootFocus).toHaveBeenCalled();
		expect(new FormRegistry().focusFirstInvalid()).toBe(false);
	});
});
