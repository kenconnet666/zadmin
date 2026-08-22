import type { AuthService } from '@zadmin/auth';
import type { ApprovalPlugin } from '@zadmin/approval';
import { inject, injectOptionalPlugin, provideFactory, token } from '@zadmin/core/plugin';
import type { PostgresService } from '@zadmin/postgres';
import type { SvelteKitHost } from '@zadmin/sveltekit';
import type { CrmApi } from './contract.ts';

export const CRM_ID = '@zadmin/crm' as const;
export const CRM = token<CrmApi>(CRM_ID);

export const crmProvider = provideFactory({
	token: CRM,
	dependencies: {
		approval: injectOptionalPlugin<ApprovalPlugin>('@zadmin/approval'),
		auth: inject<AuthService>('@zadmin/auth'),
		database: inject<PostgresService>('@zadmin/postgres'),
		web: inject<SvelteKitHost>('@zadmin/sveltekit')
	},
	create(context, services) {
		services.web.routes.register(context, {
			path: '/crm/api/status',
			handler: () =>
				Response.json({
					plugin: CRM.id,
					status: 'active',
					approval: services.approval?.start('crm-check').id
				})
		});
		return Object.freeze({
			domain: 'crm' as const,
			startApproval(subjectId: string) {
				return services.approval?.start(subjectId).id;
			}
		});
	}
});
