import { getContext } from 'svelte';

import type { ResourceScope } from './scope.ts';

export const SVELTE_TARO_CONTEXT = Symbol.for('@zadmin/svelte-taro/runtime-context');

export interface SvelteTaroRuntimeContext {
	readonly appScope: ResourceScope;
	readonly pageId?: string;
	readonly scope: ResourceScope;
}

export function getSvelteTaroContext(): SvelteTaroRuntimeContext {
	const context = getContext<SvelteTaroRuntimeContext>(SVELTE_TARO_CONTEXT);
	if (context === undefined) {
		throw new Error('Svelte Taro runtime context is unavailable outside an App/Page mount.');
	}
	return context;
}
