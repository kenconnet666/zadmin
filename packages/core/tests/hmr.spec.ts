import { afterEach, describe, expect, it, vi } from 'vitest';
import { disposeApp, runApp } from '../src/app/hmr.ts';
import { provideFactory, provideValue } from '../src/container/provider.ts';
import { definePlugin } from '../src/container/module.ts';
import { token } from '../src/container/token.ts';
import { defineApp } from '../src/plugin/definition.ts';

const appIds = new Set<string>();

afterEach(async () => {
	await Promise.all([...appIds].map((id) => disposeApp(id)));
	appIds.clear();
});

function appId(name: string): string {
	const id = `${name}-${crypto.randomUUID()}`;
	appIds.add(id);
	return id;
}

describe('runApp HMR', () => {
	it('retains the runtime while replacing changed plugin generations', async () => {
		const id = appId('plugin-update');
		const api = token<{ readonly version: number }>('@test/hmr-plugin');
		const stopped = vi.fn();
		const pluginV1 = definePlugin({
			id: api.id,
			primary: api,
			providers: [
				provideFactory({
					token: api,
					create(context) {
						context.onDispose(stopped);
						return { version: 1 };
					}
				})
			]
		});
		const runtimeV1 = await runApp(defineApp({ id, plugins: [pluginV1] }));

		const pluginV2 = definePlugin({
			id: api.id,
			primary: api,
			providers: [provideValue(api, { version: 2 })]
		});
		const runtimeV2 = await runApp(defineApp({ id, plugins: [pluginV2] }));

		expect(runtimeV2).toBe(runtimeV1);
		expect(stopped).toHaveBeenCalledOnce();
		expect(runtimeV2.get(pluginV2)).toEqual({ version: 2 });
	});

	it('disposes and replaces the runtime when the Core token changes', async () => {
		const id = appId('core-update');
		const api = token<object>('@test/hmr-core');
		const stopped = vi.fn();
		const plugin = definePlugin({
			id: api.id,
			primary: api,
			providers: [
				provideFactory({
					token: api,
					create(context) {
						context.onDispose(stopped);
						return {};
					}
				})
			]
		});
		const runtimeV1 = await runApp(defineApp({ id, plugins: [plugin] }), {});
		const runtimeV2 = await runApp(defineApp({ id, plugins: [plugin] }), {});

		expect(runtimeV2).not.toBe(runtimeV1);
		expect(stopped).toHaveBeenCalledOnce();
		expect(runtimeV2.snapshot.plugins[0]?.state).toBe('active');
	});

	it('disposes and removes an app runtime explicitly', async () => {
		const id = appId('dispose');
		const api = token<object>('@test/hmr-dispose');
		const stopped = vi.fn();
		const plugin = definePlugin({
			id: api.id,
			primary: api,
			providers: [
				provideFactory({
					token: api,
					create(context) {
						context.onDispose(stopped);
						return {};
					}
				})
			]
		});
		const runtime = await runApp(defineApp({ id, plugins: [plugin] }));

		await disposeApp(id);

		expect(stopped).toHaveBeenCalledOnce();
		expect(runtime.snapshot.plugins).toEqual([]);
	});
});
