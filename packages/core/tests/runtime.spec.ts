import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { defineApp, definePlugin } from '../src/definition.ts';
import {
	DuplicatePluginError,
	DuplicateProviderError,
	PluginCycleError,
	PluginNotActiveError,
	ProviderNotActiveError
} from '../src/errors.ts';
import { inject, injectOptional } from '../src/injection.ts';
import { PluginRuntime } from '../src/runtime.ts';
import type { AnyPluginDefinition, PluginState } from '../src/types.ts';

function state(runtime: PluginRuntime, id: string): PluginState | undefined {
	return runtime.snapshot.plugins.find((plugin) => plugin.id === id)?.state;
}

describe('PluginRuntime', () => {
	it('starts dependencies first and injects their typed APIs', async () => {
		const order: string[] = [];
		const database = definePlugin({
			id: 'database',
			setup() {
				order.push('database');
				return { query: () => 'ok' as const };
			}
		});
		const auth = definePlugin({
			id: 'auth',
			dependencies: { database: inject<{ query: () => 'ok' }>('database') },
			setup(_context, dependencies) {
				expectTypeOf(dependencies.database.query).toEqualTypeOf<() => 'ok'>();
				order.push(`auth:${dependencies.database.query()}`);
				return { authenticated: true };
			}
		});
		const runtime = new PluginRuntime();

		await runtime.reconcile(defineApp({ id: 'admin', plugins: [auth, database] }));

		expect(order).toEqual(['database', 'auth:ok']);
		expect(runtime.get(auth)).toEqual({ authenticated: true });
		expect(runtime.snapshot.plugins.every((plugin) => plugin.state === 'active')).toBe(true);
	});

	it('disposes effects in reverse order and aborts the plugin signal', async () => {
		const events: string[] = [];
		let signal: AbortSignal | undefined;
		const plugin = definePlugin({
			id: 'effects',
			async setup(context) {
				signal = context.signal;
				await context.effect(() => {
					events.push('first:start');
					return () => {
						events.push('first:stop');
					};
				});
				context.onDispose(() => {
					events.push('second:stop');
				});
			}
		});
		const runtime = new PluginRuntime();
		await runtime.reconcile(defineApp({ id: 'effects', plugins: [plugin] }));

		await runtime.stop(plugin.id);

		expect(signal?.aborted).toBe(true);
		expect(events).toEqual(['first:start', 'second:stop', 'first:stop']);
		expect(state(runtime, plugin.id)).toBe('stopped');
	});

	it('keeps plugins waiting while required dependencies are absent', async () => {
		const consumer = definePlugin({
			id: 'consumer',
			dependencies: { missing: inject<unknown>('missing') }
		});
		const runtime = new PluginRuntime();

		await runtime.reconcile(defineApp({ id: 'waiting', plugins: [consumer] }));

		expect(state(runtime, consumer.id)).toBe('waiting');
		expect(runtime.snapshot.plugins[0]?.waitingFor).toEqual(['missing']);
	});

	it('rejects duplicate plugin ids and dependency cycles', async () => {
		const duplicateA = definePlugin({ id: 'duplicate' });
		const duplicateB = definePlugin({ id: 'duplicate' });
		const runtime = new PluginRuntime();

		await expect(
			runtime.reconcile(defineApp({ id: 'duplicate', plugins: [duplicateA, duplicateB] }))
		).rejects.toBeInstanceOf(DuplicatePluginError);

		const a = unsafePlugin('a');
		const b = unsafePlugin('b');
		a.dependencies.b = inject('b');
		b.dependencies.a = inject('a');

		await expect(
			runtime.reconcile(defineApp({ id: 'cycle', plugins: [a, b] }))
		).rejects.toBeInstanceOf(PluginCycleError);
	});

	it('cleans failed setup and leaves dependents waiting', async () => {
		const cleanup = vi.fn();
		const provider = definePlugin({
			id: 'provider',
			async setup(context) {
				context.onDispose(cleanup);
				throw new Error('boom');
			}
		});
		const consumer = definePlugin({
			id: 'consumer',
			dependencies: { provider: inject<unknown>('provider') }
		});
		const runtime = new PluginRuntime();

		await runtime.reconcile(defineApp({ id: 'failure', plugins: [provider, consumer] }));

		expect(cleanup).toHaveBeenCalledOnce();
		expect(state(runtime, provider.id)).toBe('failed');
		expect(state(runtime, consumer.id)).toBe('waiting');
		expect(() => runtime.get(provider)).toThrow(PluginNotActiveError);
	});

	it('stops dependents before providers', async () => {
		const order: string[] = [];
		const provider = definePlugin({
			id: 'provider',
			setup(context) {
				context.onDispose(() => {
					order.push('provider');
				});
			}
		});
		const consumer = definePlugin({
			id: 'consumer',
			dependencies: { provider: inject<unknown>('provider') },
			setup(context) {
				context.onDispose(() => {
					order.push('consumer');
				});
			}
		});
		const runtime = new PluginRuntime();
		await runtime.reconcile(defineApp({ id: 'stop-order', plugins: [provider, consumer] }));

		await runtime.stop(provider.id);

		expect(order).toEqual(['consumer', 'provider']);
	});

	it('reloads a changed plugin and its dependents without touching unrelated plugins', async () => {
		const events: string[] = [];
		const providerV1 = definePlugin({
			id: 'provider',
			setup(context) {
				events.push('provider:v1:start');
				context.onDispose(() => {
					events.push('provider:v1:stop');
				});
				return { version: 1 };
			}
		});
		const consumerV1 = definePlugin({
			id: 'consumer',
			dependencies: { provider: inject<{ version: number }>('provider') },
			setup(context, { provider }) {
				events.push(`consumer:${provider.version}:start`);
				context.onDispose(() => {
					events.push('consumer:stop');
				});
			}
		});
		const unrelated = definePlugin({
			id: 'unrelated',
			setup(context) {
				events.push('unrelated:start');
				context.onDispose(() => {
					events.push('unrelated:stop');
				});
			}
		});
		const runtime = new PluginRuntime();
		await runtime.reconcile(
			defineApp({ id: 'reload', plugins: [providerV1, consumerV1, unrelated] })
		);

		const providerV2 = definePlugin({
			id: 'provider',
			setup(context) {
				events.push('provider:v2:start');
				context.onDispose(() => {
					events.push('provider:v2:stop');
				});
				return { version: 2 };
			}
		});
		const consumerV2 = definePlugin({
			id: 'consumer',
			dependencies: { provider: inject<{ version: number }>('provider') },
			setup(_context, { provider }) {
				events.push(`consumer:${provider.version}:start`);
			}
		});

		await runtime.reconcile(
			defineApp({ id: 'reload', plugins: [providerV2, consumerV2, unrelated] })
		);

		expect(events).toEqual([
			'provider:v1:start',
			'consumer:1:start',
			'unrelated:start',
			'consumer:stop',
			'provider:v1:stop',
			'provider:v2:start',
			'consumer:2:start'
		]);
		expect(runtime.snapshot.plugins.find((plugin) => plugin.id === 'unrelated')?.revision).toBe(0);
		expect(runtime.snapshot.plugins.find((plugin) => plugin.id === 'consumer')?.revision).toBe(1);
	});

	it('emits lifecycle transitions', async () => {
		const plugin = definePlugin({ id: 'observed' });
		const runtime = new PluginRuntime();
		const states: PluginState[] = [];
		runtime.onLifecycle((event) => states.push(event.current));

		await runtime.reconcile(defineApp({ id: 'events', plugins: [plugin] }));
		await runtime.stop(plugin.id);

		expect(states).toEqual(['starting', 'active', 'stopping', 'stopped']);
	});

	it('supports an explicit reload without replacing the definition', async () => {
		let starts = 0;
		let stops = 0;
		const plugin = definePlugin({
			id: 'reloadable',
			setup(context) {
				starts += 1;
				context.onDispose(() => {
					stops += 1;
				});
			}
		});
		const runtime = new PluginRuntime();
		await runtime.reconcile(defineApp({ id: 'reloadable', plugins: [plugin] }));

		await runtime.reload(plugin.id);

		expect({ starts, stops }).toEqual({ starts: 2, stops: 1 });
		expect(state(runtime, plugin.id)).toBe('active');
	});

	it('reloads a configured plugin when its app configuration changes', async () => {
		const values: number[] = [];
		const plugin = definePlugin({
			id: 'configured',
			config: { value: 1 },
			setup(_context, _dependencies, config) {
				values.push(config.value);
				return config;
			}
		});
		const runtime = new PluginRuntime();
		await runtime.reconcile(
			defineApp({ id: 'configured', plugins: [plugin.configure({ value: 1 })] })
		);

		await runtime.reconcile(
			defineApp({ id: 'configured', plugins: [plugin.configure({ value: 2 })] })
		);

		expect(values).toEqual([1, 2]);
		expect(runtime.get(plugin)).toEqual({ value: 2 });
	});

	it('starts waiting plugins when a missing dependency is later installed', async () => {
		const provider = definePlugin({
			id: 'late-provider',
			setup() {
				return { value: 42 };
			}
		});
		const consumer = definePlugin({
			id: 'late-consumer',
			dependencies: { provider: inject<{ value: number }>('late-provider') },
			setup(_context, { provider }) {
				return { value: provider.value };
			}
		});
		const runtime = new PluginRuntime();
		await runtime.reconcile(defineApp({ id: 'late', plugins: [consumer] }));
		expect(state(runtime, consumer.id)).toBe('waiting');

		await runtime.reconcile(defineApp({ id: 'late', plugins: [provider, consumer] }));

		expect(state(runtime, provider.id)).toBe('active');
		expect(state(runtime, consumer.id)).toBe('active');
		expect(runtime.get(consumer)).toEqual({ value: 42 });
	});

	it('injects host providers and exposes them through the same container', async () => {
		const database = inject<{ query: () => string }>('@zadmin/postgres');
		const runtime = new PluginRuntime();
		const dispose = runtime.provide({
			id: database.id,
			version: '1.0.0',
			value: { query: () => 'host' }
		});
		const consumer = definePlugin({
			id: 'consumer',
			dependencies: { database },
			setup(_context, { database }) {
				return database.query();
			}
		});

		await runtime.reconcile(defineApp({ id: 'host-provider', plugins: [consumer] }));

		expect(runtime.get(consumer)).toBe('host');
		expect(runtime.resolve(database).query()).toBe('host');
		expect(runtime.snapshot.providers).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: '@zadmin/postgres', owner: 'host', version: '1.0.0' })
			])
		);
		await runtime.dispose();
		await dispose();
		expect(() => runtime.resolve(database)).toThrow(ProviderNotActiveError);
	});

	it('injects undefined for optional providers and reloads when one is installed', async () => {
		const values: string[] = [];
		const approvalV1 = definePlugin({
			id: 'approval',
			setup() {
				return { version: 'v1' };
			}
		});
		const consumer = definePlugin({
			id: 'consumer',
			dependencies: {
				approval: injectOptional<{ version: string }>('approval')
			},
			setup(_context, { approval }) {
				values.push(approval?.version ?? 'none');
			}
		});
		const runtime = new PluginRuntime();

		await runtime.reconcile(defineApp({ id: 'optional', plugins: [consumer] }));
		await runtime.reconcile(defineApp({ id: 'optional', plugins: [consumer, approvalV1] }));
		await runtime.reconcile(defineApp({ id: 'optional', plugins: [consumer] }));

		expect(values).toEqual(['none', 'v1', 'none']);
	});

	it('rejects providers that collide with a host capability', async () => {
		const runtime = new PluginRuntime();
		runtime.provide({ id: 'collision', version: '1.0.0', value: {} });
		const plugin = definePlugin({ id: 'collision' });

		await runtime.reconcile(defineApp({ id: 'collision', plugins: [plugin] }));

		expect(state(runtime, plugin.id)).toBe('failed');
		expect(runtime.snapshot.plugins[0]?.error).toBeInstanceOf(DuplicateProviderError);
		expect(runtime.snapshot.providers).toEqual([
			expect.objectContaining({ id: 'collision', owner: 'host' })
		]);
	});
});

function unsafePlugin(id: string): AnyPluginDefinition & {
	dependencies: Record<string, ReturnType<typeof inject>>;
} {
	return {
		id,
		dependencies: {},
		defaultConfig: undefined,
		setup: () => undefined,
		configure(config: unknown) {
			return { plugin: this, config };
		}
	};
}
