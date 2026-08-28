type WeChatApi = WechatMiniprogram.Wx;

export interface WeChatMiniappPlatform {
	readonly kind: 'wechat';
	readonly raw: WeChatApi;
	canIUse(schema: string): boolean;
}

export function requireWechatApi(
	raw = (globalThis as typeof globalThis & { readonly wx?: WeChatApi }).wx
): WeChatApi {
	if (raw === undefined) throw new Error('The WeChat Mini Program wx API is unavailable.');
	return raw;
}

export function createWechatMiniappPlatform(raw = requireWechatApi()): WeChatMiniappPlatform {
	return Object.freeze({
		canIUse: (schema: string) => raw.canIUse(schema),
		kind: 'wechat' as const,
		raw
	});
}
