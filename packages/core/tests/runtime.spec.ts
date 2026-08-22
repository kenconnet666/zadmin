import { describe, expect, it, vi } from 'vitest';
import { defineApp } from '../src/plugin/definition.ts';
import { PluginRuntime } from '../src/plugin/runtime.ts';
import { inject, injectOptionalPlugin, injectPlugin } from '../src/container/injection.ts';
import { defineModule, definePlugin } from '../src/container/module.ts';
import { provideFactory, provideValue } from '../src/container/provider.ts';
import { token } from '../src/container/token.ts';

describe('PluginRuntime', () => {
	it('composes host modules and strongly typed plugin APIs', async () => {
		const hostToken = token<{ readonly value: number }>('@test/runtime-host');
		const host = defineModule({
			id: hostToken.id,
			primary: hostToken,
			exports: [hostToken],
			providers: [provideValue(hostToken, { value: 42 })]
		});
		const pluginToken = token<{ readonly value: number }>('@test/runtime-plugin');
		const plugin = definePlugin({
			id: pluginToken.id,
			primary: pluginToken,
			providers: [
				provideFactory({
					token: pluginToken,
					dependencies: { host: inject(hostToken) },
					create: (_context, services) => ({ value: services.host.value })
				})
			]
		});
		const runtime = new PluginRuntime({ modules: [host] });
		await runtime.reconcile(defineApp({ id: 'runtime', plugins: [plugin] }));

		expect(runtime.get(plugin)).toEqual({ value: 42 });
		expect(runtime.snapshot.modules).toHaveLength(2);
		expect(runtime.snapshot.plugins).toEqual([
			expect.objectContaining({ id: plugin.id, state: 'active' })
		]);
		await runtime.dispose();
	});

	it('reinjects an optional upstream plugin when it becomes available', async () => {
		const upstreamToken = token<{ readonly revision: number }>('@test/upstream-plugin');
		const upstream = definePlugin({
			id: upstreamToken.id,
			primary: upstreamToken,
			providers: [provideValue(upstreamToken, { revision: 1 })]
		});
		const downstreamToken = token<{ readonly upstream?: object }>('@test/downstream-plugin');
		const created = vi.fn();
		const downstream = definePlugin({
			id: downstreamToken.id,
			primary: downstreamToken,
			providers: [
				provideFactory({
					token: downstreamToken,
					dependencies: {
						upstream: injectOptionalPlugin<typeof upstream>('@test/upstream-plugin')
					},
					create: (_context, services) => {
						created();
						return { upstream: services.upstream };
					}
				})
			]
		});
		const runtime = new PluginRuntime();
		await runtime.reconcile(defineApp({ id: 'optional', plugins: [downstream] }));
		expect(runtime.get(downstream).upstream).toBeUndefined();

		await runtime.reconcile(defineApp({ id: 'optional', plugins: [downstream, upstream] }));
		expect(runtime.get(downstream).upstream).toEqual({ revision: 1 });
		expect(created).toHaveBeenCalledTimes(2);
		await runtime.dispose();
	});

	it('stops dependents and restarts them when an upstream plugin returns', async () => {
		const upstreamToken = token<object>('@test/stop-upstream');
		const upstream = definePlugin({
			id: upstreamToken.id,
			primary: upstreamToken,
			providers: [provideValue(upstreamToken, {})]
		});
		const downstreamToken = token<object>('@test/stop-downstream');
		const downstream = definePlugin({
			id: downstreamToken.id,
			primary: downstreamToken,
			providers: [
				provideFactory({
					token: downstreamToken,
					dependencies: { upstream: injectPlugin<typeof upstream>('@test/stop-upstream') },
					create: () => ({})
				})
			]
		});
		const runtime = new PluginRuntime();
		await runtime.reconcile(defineApp({ id: 'stop', plugins: [upstream, downstream] }));
		await runtime.stop(upstream.id);
		expect(runtime.snapshot.plugins).toEqual([
			expect.objectContaining({ id: downstream.id, state: 'waiting' })
		]);

		await runtime.start(upstream.id);
		expect(runtime.snapshot.plugins).toEqual([
			expect.objectContaining({ id: downstream.id, state: 'active' }),
			expect.objectContaining({ id: upstream.id, state: 'active' })
		]);
		await runtime.dispose();
	});

	it('forces a fresh generation on explicit reload', async () => {
		const api = token<object>('@test/manual-reload');
		const disposed = vi.fn();
		const plugin = definePlugin({
			id: api.id,
			primary: api,
			providers: [
				provideFactory({
					token: api,
					create: (context) => {
						context.onDispose(disposed);
						return {};
					}
				})
			]
		});
		const runtime = new PluginRuntime();
		await runtime.reconcile(defineApp({ id: 'reload', plugins: [plugin] }));
		const first = runtime.get(plugin);
		await runtime.reload(plugin.id);
		expect(runtime.get(plugin)).not.toBe(first);
		expect(disposed).toHaveBeenCalledOnce();
		await runtime.dispose();
	});

	it('rejects a different app id in the same runtime', async () => {
		const runtime = new PluginRuntime();
		await runtime.reconcile(defineApp({ id: 'one', plugins: [] }));
		await expect(runtime.reconcile(defineApp({ id: 'two', plugins: [] }))).rejects.toThrow(
			'cannot reconcile'
		);
		await runtime.dispose();
	});
});
