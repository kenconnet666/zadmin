export interface ErpApi {
	readonly domain: 'erp';
	startApproval(subjectId: string): string | undefined;
}
