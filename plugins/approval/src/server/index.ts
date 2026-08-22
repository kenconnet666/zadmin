import { definePlugin } from '@zadmin/core/plugin';
import { APPROVAL, APPROVAL_ID, approvalProvider } from './service.ts';

export type { ApprovalApi, ApprovalRecord } from './contract.ts';

export const approvalPlugin = definePlugin({
	id: APPROVAL_ID,
	primary: APPROVAL,
	providers: [approvalProvider]
});

export type ApprovalPlugin = typeof approvalPlugin;

export default approvalPlugin;
