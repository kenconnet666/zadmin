import { definePlugin } from '@zadmin/core';
import { ossPlugin } from '@zadmin/oss';
import { postgresPlugin } from '@zadmin/postgres';
import { redisPlugin } from '@zadmin/redis';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const etlPlugin = definePlugin({
	id: 'etl',
	dependencies: {
		sveltekit: sveltekitPlugin,
		postgres: postgresPlugin,
		redis: redisPlugin,
		oss: ossPlugin
	},
	setup(context, dependencies) {
		dependencies.sveltekit.routes.register(context, {
			path: '/etl/api/status',
			handler: () => Response.json({ plugin: 'etl', status: 'active' })
		});
		return {
			framework: dependencies.sveltekit.framework,
			database: dependencies.postgres.driver,
			cache: dependencies.redis.driver,
			storage: dependencies.oss.protocol
		} as const;
	}
});
