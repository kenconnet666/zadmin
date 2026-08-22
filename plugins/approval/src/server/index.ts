import { definePlugin, inject, type PluginContext } from '@zadmin/core/plugin';

interface Auth {
	readonly provider: 'auth';
}

interface Database {
	readonly driver: 'postgres';
}

interface Web {
	readonly routes: {
		register(
			context: PluginContext,
			route: { readonly path: string; readonly handler: () => Response }
		): void;
	};
}

export const approvalPlugin = definePlugin({
	id: '@zadmin/approval',
	dependencies: {
		auth: inject<Auth>('@zadmin/auth'),
		database: inject<Database>('@zadmin/postgres'),
		web: inject<Web>('@zadmin/sveltekit')
	},
	setup(context, dependencies) {
		dependencies.web.routes.register(context, {
			path: '/approval/api/status',
			handler: () =>
				Response.json({
					plugin: '@zadmin/approval',
					status: 'active',
					auth: dependencies.auth.provider,
					database: dependencies.database.driver
				})
		});

		return Object.freeze({
			start(subjectId: string) {
				return Object.freeze({ id: `approval:${subjectId}`, status: 'pending' as const });
			}
		});
	}
});

export default approvalPlugin;
