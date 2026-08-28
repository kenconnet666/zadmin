export const WECHAT_ELEMENTS = [
	'button',
	'camera',
	'canvas',
	'image',
	'input',
	'map',
	'scroll-view',
	'swiper',
	'swiper-item',
	'text',
	'view',
	'web-view'
] as const;

export type WeChatElementName = (typeof WECHAT_ELEMENTS)[number];

export type WeChatSnapshot =
	| { readonly children: readonly WeChatSnapshot[]; readonly kind: 'fragment' }
	| {
			readonly attributes: Readonly<Record<string, unknown>>;
			readonly children: readonly WeChatSnapshot[];
			readonly id: string;
			readonly kind: 'element';
			readonly name: string;
	  }
	| { readonly kind: 'text'; readonly value: string };

export function assertWeChatElement(name: string): asserts name is WeChatElementName {
	if (!(WECHAT_ELEMENTS as readonly string[]).includes(name)) {
		throw new TypeError(`Native element "${name}" is not supported by the WeChat target.`);
	}
}
