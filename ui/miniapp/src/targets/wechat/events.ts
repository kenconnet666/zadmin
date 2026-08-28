export function toWeChatEventType(type: string): string {
	return type === 'click' ? 'tap' : type;
}

export function eventMethod(type: string): string {
	return `__zadmin_${type.replace(/[^a-z0-9]/giu, '_')}`;
}

export interface WeChatRuntimeEvent<TDetail = unknown> {
	readonly currentTarget: { readonly dataset: { readonly zid?: string } };
	readonly detail: TDetail;
	readonly target: { readonly dataset?: { readonly zid?: string } };
	readonly timeStamp: number;
	readonly type: string;
}
