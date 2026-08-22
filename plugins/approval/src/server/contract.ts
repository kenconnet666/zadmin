export interface ApprovalRecord {
	readonly id: string;
	readonly status: 'pending';
}

export interface ApprovalApi {
	start(subjectId: string): ApprovalRecord;
}
