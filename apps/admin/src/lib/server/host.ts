import {
	defineApp,
	PluginManager,
	PluginRuntime,
	WorkspacePluginArtifactProvider,
	type PluginDisposer
} from '@zadmin/core';
import { createAuth } from '@zadmin/auth';
import { createOss } from '@zadmin/oss';
import { createPostgres } from '@zadmin/postgres';
import { createRedis } from '@zadmin/redis';
import { createSvelteKitHost } from '@zadmin/sveltekit';
import { fileURLToPath } from 'node:url';
import { AdminPluginBridge } from './plugins.ts';

export async function createAdminHost() {
	const web = createSvelteKitHost();
	const database = createPostgres();
	const cache = createRedis();
	const storage = createOss();
	const auth = createAuth({ database, cache, web });
	const runtime = new PluginRuntime();
	const removeProviders: PluginDisposer[] = [
		runtime.provide({ id: '@zadmin/sveltekit', version: '0.0.0', value: web }),
		runtime.provide({ id: '@zadmin/postgres', version: '0.0.0', value: database }),
		runtime.provide({ id: '@zadmin/redis', version: '0.0.0', value: cache }),
		runtime.provide({ id: '@zadmin/oss', version: '0.0.0', value: storage }),
		runtime.provide({ id: '@zadmin/auth', version: '0.0.0', value: auth })
	];
	await runtime.reconcile(defineApp({ id: 'admin', plugins: [] }));
	const plugins = new PluginManager(runtime, 'admin', {
		hostVersions: {
			'@zadmin/core': '0.0.0',
			'@zadmin/sveltekit': '0.0.0'
		}
	});
	const bridge = new AdminPluginBridge(plugins);
	let stopWorkspaceProvider: PluginDisposer | undefined;
	if (import.meta.env.MODE === 'development') {
		const provider = new WorkspacePluginArtifactProvider({
			roots: [fileURLToPath(new URL('../../../../../plugins/', import.meta.url))]
		});
		await plugins.reconcile(await provider.scan());
		stopWorkspaceProvider = provider.watch(
			(artifacts) => plugins.reconcile(artifacts),
			(error) => console.error('Workspace plugin reload failed.', error)
		);
	}

	let disposed = false;
	return Object.freeze({
		web,
		runtime,
		plugins,
		bridge,
		async dispose() {
			if (disposed) return;
			disposed = true;
			await stopWorkspaceProvider?.();
			bridge.dispose();
			await plugins.dispose();
			await runtime.dispose();
			for (const removeProvider of removeProviders.reverse()) await removeProvider();
			auth.dispose();
			await cache.close();
			await database.close();
		}
	});
}

export const adminHost = await createAdminHost();

if (import.meta.hot) {
	import.meta.hot.accept();
	import.meta.hot.dispose(() => {
		void adminHost.dispose();
	});
} else {
	process.once('sveltekit:shutdown', () => adminHost.dispose());
}
