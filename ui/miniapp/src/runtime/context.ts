import { getContext } from 'svelte';

import type { WeChatPlatform } from '../platform/service.ts';
import type { ResourceScope } from './scope.ts';

export const SVELTE_TARO_CONTEXT = Symbol.for('@zadmin/miniapp/runtime-context');

export interface SvelteTaroRuntimeContext {
	readonly appScope: ResourceScope;
	readonly pageId?: string;
	readonly platform?: WeChatPlatform;
	readonly scope: ResourceScope;
}

export function getSvelteTaroContext(): SvelteTaroRuntimeContext {
	const context = getContext<SvelteTaroRuntimeContext>(SVELTE_TARO_CONTEXT);
	if (context === undefined) {
		throw new Error('Svelte Taro runtime context is unavailable outside an App/Page mount.');
	}
	return context;
}
