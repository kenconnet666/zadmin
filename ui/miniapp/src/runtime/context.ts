import { getContext } from 'svelte';

import type { WeChatPlatform } from '../platform/service.ts';
import type { ResourceScope } from './scope.ts';

export const MINIAPP_RUNTIME_CONTEXT = Symbol.for('@zadmin/miniapp/runtime-context');

export interface MiniappRuntimeContext {
	readonly appScope: ResourceScope;
	readonly pageId?: string;
	readonly platform?: WeChatPlatform;
	readonly scope: ResourceScope;
}

export function getMiniappRuntimeContext(): MiniappRuntimeContext {
	const context = getContext<MiniappRuntimeContext>(MINIAPP_RUNTIME_CONTEXT);
	if (context === undefined) {
		throw new Error('Miniapp runtime context is unavailable outside an App/Page mount.');
	}
	return context;
}
