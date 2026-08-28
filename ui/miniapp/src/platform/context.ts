import { getSvelteTaroContext } from '../runtime/context.ts';
import type { WeChatPlatform } from './service.ts';

export function getWeChatPlatform(): WeChatPlatform {
	const platform = getSvelteTaroContext().platform;
	if (platform === undefined) {
		throw new Error('The WeChat platform service is unavailable outside a Svelte Taro App/Page.');
	}
	return platform;
}
