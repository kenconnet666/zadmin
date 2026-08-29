import { getMiniappRuntimeContext } from '../runtime/context.ts';
import type { WeChatPlatform } from './service.ts';

export function getWeChatPlatform(): WeChatPlatform {
	const platform = getMiniappRuntimeContext().platform;
	if (platform === undefined) {
		throw new Error('The WeChat platform service is unavailable outside a Miniapp App/Page.');
	}
	return platform;
}
