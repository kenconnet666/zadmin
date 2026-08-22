import type { ApprovalRecord } from '@zadmin/approval';

export interface CrmApi {
	readonly domain: 'crm';
	startApproval(subjectId: string): ApprovalRecord | undefined;
}
