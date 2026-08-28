import { AsyncLocalStorage } from 'node:async_hooks';

import { createIcssRuntime, setServerRuntimeResolver, type IcssRuntime } from '../icss/runtime.js';
import { createServerStyleRegistry, type StyleRegistry } from '../icss/registry.js';

export interface RequestIcssRuntime {
	readonly registry: StyleRegistry;
	readonly runtime: IcssRuntime;
}

const requestRuntime = new AsyncLocalStorage<RequestIcssRuntime>();

setServerRuntimeResolver(() => requestRuntime.getStore()?.runtime);

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
