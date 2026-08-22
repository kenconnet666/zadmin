import type { AuthService } from '@zadmin/auth';
import type { ApprovalPlugin } from '@zadmin/approval';
import { inject, injectOptionalPlugin, provideFactory, token } from '@zadmin/core/plugin';
import type { PostgresService } from '@zadmin/postgres';
import type { SvelteKitHost } from '@zadmin/sveltekit';
import type { ErpApi } from './contract.ts';

export const ERP_ID = '@zadmin/erp' as const;
export const ERP = token<ErpApi>(ERP_ID);

export const erpProvider = provideFactory({
	token: ERP,
	dependencies: {
		approval: injectOptionalPlugin<ApprovalPlugin>('@zadmin/approval'),
		auth: inject<AuthService>('@zadmin/auth'),
		database: inject<PostgresService>('@zadmin/postgres'),
		web: inject<SvelteKitHost>('@zadmin/sveltekit')
	},
	create(context, services) {
		services.web.routes.register(context, {
			path: '/erp/api/status',
			handler: () =>
				Response.json({
					plugin: ERP.id,
					status: 'active',
					approval: services.approval?.start('erp-check').id
				})
		});
		return Object.freeze({
			domain: 'erp' as const,
			startApproval(subjectId: string) {
				return services.approval?.start(subjectId).id;
			}
		});
	}
});
