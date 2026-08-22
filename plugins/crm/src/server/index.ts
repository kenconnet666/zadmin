import { definePlugin } from '@zadmin/core/plugin';
import { CRM, CRM_ID, crmProvider } from './service.ts';

export type { CrmApi } from './contract.ts';

export const crmPlugin = definePlugin({
	id: CRM_ID,
	primary: CRM,
	providers: [crmProvider]
});

export type CrmPlugin = typeof crmPlugin;

export default crmPlugin;
