import { defineApp, disposeApp, runApp } from '@zadmin/core';
import { etlPlugin } from '@zadmin/etl';
import { ossPlugin } from '@zadmin/oss';
import { postgresPlugin } from '@zadmin/postgres';
import { redisPlugin } from '@zadmin/redis';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const etlApp = defineApp({
	id: 'etl',
	plugins: [sveltekitPlugin, postgresPlugin, redisPlugin, ossPlugin, etlPlugin]
});

export const etlRuntime = await runApp(etlApp);

if (import.meta.hot) {
	import.meta.hot.accept();
	import.meta.hot.prune(() => {
		void disposeApp(etlApp.id);
	});
} else {
	process.once('sveltekit:shutdown', () => etlRuntime.dispose());
}
