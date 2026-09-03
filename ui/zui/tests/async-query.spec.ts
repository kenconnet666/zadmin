import { describe, expect, it, vi } from 'vitest';

import { AsyncCollectionQuery } from '../src/runtime/collection/async-query.js';

function deferred<T>(): {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (error: unknown) => void;
} {
	let resolve!: (value: T) => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<T>((nextResolve, nextReject) => {
		resolve = nextResolve;
		reject = nextReject;
	});
	return { promise, resolve, reject };
}

describe('AsyncCollectionQuery', () => {
	it('publishes explicit loading/success state and latest-wins aborts stale requests', async () => {
		const first = deferred<readonly string[]>();
		const second = deferred<readonly string[]>();
		const signals: AbortSignal[] = [];
		const loader = vi.fn((query: string, context: { signal: AbortSignal }) => {
			signals.push(context.signal);
			return query === 'old' ? first.promise : second.promise;
		});
		const query = new AsyncCollectionQuery(loader);
		const states: string[] = [];
		query.subscribe((state) => states.push(`${state.status}:${state.loading}:${state.generation}`));

		const oldResult = query.load('old');
		expect(query.state).toMatchObject({ loading: true, status: 'loading', generation: 1 });
		const latestResult = query.load('new');
		expect(signals[0].aborted).toBe(true);
		second.resolve(['latest']);
		first.reject(new Error('stale'));

		expect(await latestResult).toEqual(['latest']);
		expect(await oldResult).toBeUndefined();
		expect(query.state).toMatchObject({
			data: ['latest'],
			loading: false,
			status: 'success',
			generation: 2
		});
		expect(states).toEqual(['loading:true:1', 'loading:true:2', 'success:false:2']);
	});

	it('publishes current errors, preserves prior data, and isolates observers', async () => {
		const loader = vi
			.fn()
			.mockResolvedValueOnce(['good'])
			.mockRejectedValueOnce(new Error('network'));
		const query = new AsyncCollectionQuery(loader);
		const broken = vi.fn(() => {
			throw new Error('observer');
		});
		const healthy = vi.fn();
		query.subscribe(broken);
		query.subscribe(healthy);
		await query.load('first');
		await query.load('second');

		expect(query.state).toMatchObject({ data: ['good'], loading: false, status: 'error' });
		expect(query.state.error).toBeInstanceOf(Error);
		expect(broken).toHaveBeenCalledTimes(4);
		expect(healthy).toHaveBeenCalledTimes(4);
	});

	it('cancel and dispose abort work, invalidate late results, and do not cache', async () => {
		const pending = deferred<readonly string[]>();
		let signal!: AbortSignal;
		const query = new AsyncCollectionQuery((_query: string, context) => {
			signal = context.signal;
			return pending.promise;
		});
		const observed = vi.fn();
		query.subscribe(observed);
		const result = query.load('query');
		query.cancel();
		expect(signal.aborted).toBe(true);
		expect(query.state).toMatchObject({ loading: false, status: 'idle', generation: 2 });
		pending.resolve(['late']);
		expect(await result).toBeUndefined();
		query.dispose();
		expect(query.state).toMatchObject({ loading: false, status: 'idle', generation: 3 });
		await expect(query.load('after-dispose')).rejects.toThrow(/disposed/u);
		const count = observed.mock.calls.length;
		query.cancel();
		expect(observed).toHaveBeenCalledTimes(count);
	});

	it('does not invoke a loader superseded by a loading-state observer', async () => {
		const loader = vi.fn((value: string) => value);
		const query = new AsyncCollectionQuery(loader);
		let latest: Promise<string | undefined> | undefined;
		query.subscribe((state) => {
			if (state.generation === 1) latest = query.load('latest');
		});

		await expect(query.load('stale')).resolves.toBeUndefined();
		await expect(latest).resolves.toBe('latest');
		expect(loader).toHaveBeenCalledTimes(1);
		expect(loader).toHaveBeenCalledWith('latest', expect.objectContaining({ generation: 2 }));
	});

	it('keeps a re-entrant latest load alive when publishing success or error', async () => {
		const second = deferred<string>();
		const loader = vi.fn((query: string) => (query === 'first' ? 'first' : second.promise));
		const query = new AsyncCollectionQuery(loader);
		let reentered = false;
		query.subscribe((state) => {
			if (state.status === 'success' && !reentered) {
				reentered = true;
				void query.load('reentrant-success');
			}
		});
		await query.load('first');
		expect(query.state).toMatchObject({ loading: true, status: 'loading', generation: 2 });
		second.resolve('second');
		await Promise.resolve();
		expect(query.state).toMatchObject({ data: 'second', status: 'success', generation: 2 });

		const errorSecond = deferred<string>();
		const errorQuery = new AsyncCollectionQuery(async (kind: string) => {
			if (kind === 'error-reentrant') return errorSecond.promise;
			throw new Error('second failure');
		});
		let errorReentered = false;
		errorQuery.subscribe((state) => {
			if (state.status === 'error' && !errorReentered) {
				errorReentered = true;
				void errorQuery.load('error-reentrant');
			}
		});
		await errorQuery.load('error');
		await Promise.resolve();
		expect(errorQuery.state).toMatchObject({ loading: true, status: 'loading', generation: 2 });
		errorSecond.resolve('reentrant error path');
		await Promise.resolve();
		await Promise.resolve();
		expect(errorQuery.state).toMatchObject({
			data: 'reentrant error path',
			status: 'success',
			generation: 2
		});
	});

	it('makes cancel without active work idempotent and rejects subscriptions after dispose', () => {
		expect(() => new AsyncCollectionQuery(null as never)).toThrow(/loader/u);
		const query = new AsyncCollectionQuery(() => 'value');
		const listener = vi.fn();
		expect(() => query.subscribe(null as never)).toThrow(/listener/u);
		const unsubscribe = query.subscribe(listener);
		unsubscribe();
		unsubscribe();
		query.cancel();
		query.cancel();
		expect(query.state.generation).toBe(0);
		query.dispose();
		expect(() => query.subscribe(listener)).toThrow(/disposed/u);
		query.dispose();
	});
});
