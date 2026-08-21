import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineApp, definePlugin } from '../src/definition.ts';
import { disposeApp, runApp } from '../src/hmr.ts';

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
	it('retains the runtime for plugin updates and reconciles changed definitions', async () => {
		const id = appId('plugin-update');
		const stopped = vi.fn();
		const pluginV1 = definePlugin({
			id: 'plugin',
			setup(context) {
				context.onDispose(stopped);
				return { version: 1 };
			}
		});
		const runtimeV1 = await runApp(defineApp({ id, plugins: [pluginV1] }));

		const pluginV2 = definePlugin({
			id: 'plugin',
			setup() {
				return { version: 2 };
			}
		});
		const runtimeV2 = await runApp(defineApp({ id, plugins: [pluginV2] }));

		expect(runtimeV2).toBe(runtimeV1);
		expect(stopped).toHaveBeenCalledOnce();
		expect(runtimeV2.get(pluginV2)).toEqual({ version: 2 });
	});

	it('replaces and disposes the runtime when the Core token changes', async () => {
		const id = appId('core-update');
		const stopped = vi.fn();
		const plugin = definePlugin({
			id: 'plugin',
			setup(context) {
				context.onDispose(stopped);
			}
		});
		const runtimeV1 = await runApp(defineApp({ id, plugins: [plugin] }), {});
		const runtimeV2 = await runApp(defineApp({ id, plugins: [plugin] }), {});

		expect(runtimeV2).not.toBe(runtimeV1);
		expect(stopped).toHaveBeenCalledOnce();
		expect(runtimeV2.snapshot.plugins[0]?.state).toBe('active');
	});

	it('disposes and removes an app runtime explicitly', async () => {
		const id = appId('dispose');
		const stopped = vi.fn();
		const plugin = definePlugin({
			id: 'plugin',
			setup(context) {
				context.onDispose(stopped);
			}
		});
		const runtime = await runApp(defineApp({ id, plugins: [plugin] }));

		await disposeApp(id);

		expect(stopped).toHaveBeenCalledOnce();
		expect(runtime.snapshot.plugins).toEqual([]);
	});
});
