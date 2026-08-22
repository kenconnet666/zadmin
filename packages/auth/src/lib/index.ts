import { definePlugin, inject, type PluginContext } from '@zadmin/core';

interface SvelteKit {
	readonly framework: 'sveltekit';
	readonly routes: {
		register(
			context: PluginContext,
			route: { readonly path: string; readonly handler: () => Response }
		): void;
	};
}

interface Postgres {
	readonly driver: 'postgres';
}

interface Redis {
	readonly driver: 'redis';
}

export const authPlugin = definePlugin({
	id: '@zadmin/auth',
	dependencies: {
		sveltekit: inject<SvelteKit>('@zadmin/sveltekit'),
		postgres: inject<Postgres>('@zadmin/postgres'),
		redis: inject<Redis>('@zadmin/redis')
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
