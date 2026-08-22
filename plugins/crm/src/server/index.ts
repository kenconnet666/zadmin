import { definePlugin, inject, injectOptional, type PluginContext } from '@zadmin/core/plugin';

interface Approval {
	start(subjectId: string): { readonly id: string; readonly status: string };
}

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

export const crmPlugin = definePlugin({
	id: '@zadmin/crm',
	dependencies: {
		approval: injectOptional<Approval>('@zadmin/approval'),
		auth: inject<Auth>('@zadmin/auth'),
		database: inject<Database>('@zadmin/postgres'),
		web: inject<Web>('@zadmin/sveltekit')
	},
	setup(context, dependencies) {
		dependencies.web.routes.register(context, {
			path: '/crm/api/status',
			handler: () =>
				Response.json({
					plugin: '@zadmin/crm',
					status: 'active',
					approval: dependencies.approval?.start('crm-check').id
				})
		});

		return Object.freeze({ domain: 'crm' as const });
	}
});

export default crmPlugin;
