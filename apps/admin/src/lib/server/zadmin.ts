import { defineApp, disposeApp, runApp } from '@zadmin/core';
import { authPlugin } from '@zadmin/auth';
import { ossPlugin } from '@zadmin/oss';
import { postgresPlugin } from '@zadmin/postgres';
import { redisPlugin } from '@zadmin/redis';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const adminApp = defineApp({
	id: 'admin',
	plugins: [sveltekitPlugin, postgresPlugin, redisPlugin, ossPlugin, authPlugin]
});

export const adminRuntime = await runApp(adminApp);

if (import.meta.hot) {
	import.meta.hot.accept();
	import.meta.hot.prune(() => {
		void disposeApp(adminApp.id);
	});
} else {
	process.once('sveltekit:shutdown', () => adminRuntime.dispose());
}
