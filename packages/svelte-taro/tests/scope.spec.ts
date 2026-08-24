import { describe, expect, it, vi } from 'vitest';

import { ResourceScope } from '../src/runtime/index.ts';

describe('ResourceScope', () => {
	it('disposes children and resources once in reverse order', async () => {
		const scope = new ResourceScope();
		const child = scope.child();
		const calls: string[] = [];
		scope.add(() => calls.push('parent'));
		child.add(() => calls.push('child'));
		await scope.dispose();
		await scope.dispose();
		expect(calls).toEqual(['parent', 'child']);
		expect(scope.closed).toBe(true);
		expect(child.closed).toBe(true);
	});

	it('supports disposable objects and aggregates cleanup errors', async () => {
		const dispose = vi.fn();
		const scope = new ResourceScope();
		scope.add({ dispose });
		scope.add(() => {
			throw new Error('cleanup failed');
		});
		await expect(scope.dispose()).rejects.toThrow(AggregateError);
		expect(dispose).toHaveBeenCalledOnce();
		expect(() => scope.add(() => undefined)).toThrow(/disposed scope/);
	});
});
