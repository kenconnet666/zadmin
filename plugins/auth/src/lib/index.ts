import { definePlugin } from '@zadmin/core';
import { postgresPlugin } from '@zadmin/postgres';
import { redisPlugin } from '@zadmin/redis';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const authPlugin = definePlugin({
	id: 'auth',
	dependencies: {
		sveltekit: sveltekitPlugin,
		postgres: postgresPlugin,
		redis: redisPlugin
	},
	setup(context, dependencies) {
		dependencies.sveltekit.routes.register(context, {
			path: '/auth/api/status',
			handler: () => Response.json({ plugin: 'auth', status: 'active' })
		});
		return {
			framework: dependencies.sveltekit.framework,
			database: dependencies.postgres.driver,
			cache: dependencies.redis.driver
		} as const;
	}
});
