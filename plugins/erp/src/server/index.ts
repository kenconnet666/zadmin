import { definePlugin, inject, injectOptional, type PluginContext } from '@zadmin/core';

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

export const erpPlugin = definePlugin({
	id: '@zadmin/erp',
	dependencies: {
		approval: injectOptional<Approval>('@zadmin/approval'),
		auth: inject<Auth>('@zadmin/auth'),
		database: inject<Database>('@zadmin/postgres'),
		web: inject<Web>('@zadmin/sveltekit')
	},
	setup(context, dependencies) {
		dependencies.web.routes.register(context, {
			path: '/erp/api/status',
			handler: () =>
				Response.json({
					plugin: '@zadmin/erp',
					status: 'active',
					approval: dependencies.approval?.start('erp-check').id
				})
		});

		return Object.freeze({ domain: 'erp' as const });
	}
});

export default erpPlugin;
