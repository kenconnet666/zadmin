import type { AuthService } from '@zadmin/auth';
import {
	inject,
	provideClass,
	service,
	token,
	type ResolveInjections,
	type ServiceContext
} from '@zadmin/core/plugin';
import type { PostgresService } from '@zadmin/postgres';
import type { SvelteKitHost } from '@zadmin/sveltekit';
import type { ApprovalApi } from './contract.ts';

export const APPROVAL_ID = '@zadmin/approval' as const;
export const APPROVAL = token<ApprovalApi>(APPROVAL_ID);

const dependencies = {
	auth: inject<AuthService>('@zadmin/auth'),
	database: inject<PostgresService>('@zadmin/postgres'),
	web: inject<SvelteKitHost>('@zadmin/sveltekit')
} as const;

@service({ token: APPROVAL, dependencies })
export class ApprovalService implements ApprovalApi {
	constructor(
		private readonly services: ResolveInjections<typeof dependencies>,
		context: ServiceContext
	) {
		services.web.routes.register(context, {
			path: '/approval/api/status',
			handler: () =>
				Response.json({
					plugin: APPROVAL.id,
					status: 'active',
					auth: services.auth.provider,
					database: services.database.driver
				})
		});
	}

	start(subjectId: string) {
		return Object.freeze({ id: `approval:${subjectId}`, status: 'pending' as const });
	}
}

export const approvalProvider = provideClass(ApprovalService);
