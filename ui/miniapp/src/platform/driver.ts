import Taro from '@tarojs/taro';

import type {
	PlatformDriver,
	PlatformDriverEnvironment,
	TaroMethodName,
	TaroMethodParameters,
	TaroMethodResult
} from './types.ts';

type Callable = (...args: readonly unknown[]) => unknown;

function callable(raw: Taro.TaroStatic, method: TaroMethodName): Callable {
	const candidate = raw[method] as unknown;
	if (typeof candidate !== 'function') throw new TypeError(`Taro.${method} is unavailable.`);
	return candidate as Callable;
}

function callbackOptions(
	options: unknown,
	resolve: (value: unknown) => void,
	reject: (reason: unknown) => void
): unknown {
	if (options !== undefined && (typeof options !== 'object' || options === null)) return options;
	return { ...(options ?? {}), fail: reject, success: resolve };
}

export function createTaroPlatformDriver(
	environment: Partial<PlatformDriverEnvironment> = {}
): PlatformDriver {
	const resolvedEnvironment: PlatformDriverEnvironment = {
		realDevice: false,
		...environment
	};
	return {
		environment: resolvedEnvironment,
		raw: Taro,
		call<TKey extends TaroMethodName>(
			method: TKey,
			...args: TaroMethodParameters<TKey>
		): Promise<TaroMethodResult<TKey>> {
			return new Promise<TaroMethodResult<TKey>>((resolve, reject) => {
				let settled = false;
				const succeed = (value: unknown) => {
					if (settled) return;
					settled = true;
					resolve(value as TaroMethodResult<TKey>);
				};
				const fail = (error: unknown) => {
					if (settled) return;
					settled = true;
					reject(error);
				};
				try {
					const input = [...args] as unknown[];
					input[0] = callbackOptions(input[0], succeed, fail);
					const result = callable(Taro, method).apply(Taro, input);
					if (result instanceof Promise) void result.then(succeed, fail);
					else if (result !== undefined) succeed(result);
				} catch (error) {
					fail(error);
				}
			});
		},
		canIUse(schema: string): boolean {
			return typeof Taro.canIUse === 'function' && Taro.canIUse(schema);
		},
		create<TKey extends TaroMethodName>(
			method: TKey,
			...args: TaroMethodParameters<TKey>
		): TaroMethodResult<TKey> {
			return callable(Taro, method).apply(Taro, args) as TaroMethodResult<TKey>;
		},
		listen<TValue>(
			onMethod: TaroMethodName,
			offMethod: TaroMethodName,
			listener: (value: TValue) => void
		): () => void {
			callable(Taro, onMethod).call(Taro, listener);
			return () => callable(Taro, offMethod).call(Taro, listener);
		}
	};
}
