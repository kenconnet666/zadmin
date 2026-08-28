import { AsyncLocalStorage } from 'node:async_hooks';

import {
	createIcssRuntime,
	createServerStyleRegistry,
	type IcssRuntime,
	type StyleRegistry
} from '@zadmin/zui/runtime';
import { __setServerRuntimeResolver } from '@zadmin/zui/internal';

export interface RequestIcssRuntime {
	readonly registry: StyleRegistry;
	readonly runtime: IcssRuntime;
}

const requestRuntime = new AsyncLocalStorage<RequestIcssRuntime>();

__setServerRuntimeResolver(() => requestRuntime.getStore()?.runtime);

export function createRequestIcssRuntime(): RequestIcssRuntime {
	const registry = createServerStyleRegistry();
	return { registry, runtime: createIcssRuntime({ registry }) };
}

export function runWithRequestIcssRuntime<TResult>(
	request: RequestIcssRuntime,
	callback: () => TResult
): TResult {
	return requestRuntime.run(request, callback);
}
