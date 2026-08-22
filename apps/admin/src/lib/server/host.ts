import { defineApp, PluginRuntime, type PluginDisposer } from '@zadmin/core';
import { createAuth } from '@zadmin/auth';
import { createOss } from '@zadmin/oss';
import { createPostgres } from '@zadmin/postgres';
import { createRedis } from '@zadmin/redis';
import { createSvelteKitHost } from '@zadmin/sveltekit';

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

	let disposed = false;
	return Object.freeze({
		web,
		runtime,
		async dispose() {
			if (disposed) return;
			disposed = true;
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
	import.meta.hot.prune(() => {
		void adminHost.dispose();
	});
} else {
	process.once('sveltekit:shutdown', () => adminHost.dispose());
}
