import { PluginRuntime } from './runtime.ts';
import type { AppDefinition } from './types.ts';

export const CORE_HMR_TOKEN = Object.freeze({});

interface RetainedRuntime {
	readonly runtime: PluginRuntime;
	readonly coreToken: object;
}

const RUNTIME_STORE = Symbol.for('@zadmin/core/runtimes');

function runtimeStore(): Map<string, RetainedRuntime> {
	const scope = globalThis as typeof globalThis & {
		[RUNTIME_STORE]?: Map<string, RetainedRuntime>;
	};
	return (scope[RUNTIME_STORE] ??= new Map());
}

export async function runApp(
	app: AppDefinition,
	coreToken: object = CORE_HMR_TOKEN
): Promise<PluginRuntime> {
	const store = runtimeStore();
	const retained = store.get(app.id);
	let runtime: PluginRuntime;

	if (retained?.coreToken === coreToken && retained.runtime instanceof PluginRuntime) {
		runtime = retained.runtime;
	} else {
		await retained?.runtime.dispose();
		runtime = new PluginRuntime();
		store.set(app.id, { runtime, coreToken });
	}

	await runtime.reconcile(app);
	return runtime;
}

export async function disposeApp(appId: string): Promise<void> {
	const store = runtimeStore();
	const retained = store.get(appId);
	if (!retained) return;
	store.delete(appId);
	await retained.runtime.dispose();
}
