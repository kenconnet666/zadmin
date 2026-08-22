import { definePlugin } from '@zadmin/core/plugin';
import { ERP, ERP_ID, erpProvider } from './service.ts';

export type { ErpApi } from './contract.ts';

export const erpPlugin = definePlugin({
	id: ERP_ID,
	primary: ERP,
	providers: [erpProvider]
});

export type ErpPlugin = typeof erpPlugin;

export default erpPlugin;
