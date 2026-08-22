export interface CrmApi {
	readonly domain: 'crm';
	startApproval(subjectId: string): string | undefined;
}
