import type { ApprovalRecord } from '@zadmin/approval';

export interface ErpApi {
	readonly domain: 'erp';
	startApproval(subjectId: string): ApprovalRecord | undefined;
}
