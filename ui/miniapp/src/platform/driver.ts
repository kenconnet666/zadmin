import { requireWechatApi } from '../targets/wechat/api.ts';
import type {
	PlatformDriver,
	PlatformDriverEnvironment,
	WeChatMethodName,
	WeChatMethodParameters,
	WeChatMethodResult,
	WeChatMethodReturn
} from './types.ts';

type WeChatApi = WechatMiniprogram.Wx;
type Callable = (...args: readonly unknown[]) => unknown;

function callable(raw: WeChatApi, method: WeChatMethodName): Callable {
	const candidate = raw[method] as unknown;
	if (typeof candidate !== 'function') throw new TypeError(`wx.${method} is unavailable.`);
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

export function createWechatPlatformDriver(
	raw: WeChatApi = requireWechatApi(),
	environment: Partial<PlatformDriverEnvironment> = {}
): PlatformDriver {
	const resolvedEnvironment: PlatformDriverEnvironment = { realDevice: false, ...environment };
	return {
		environment: resolvedEnvironment,
		raw,
		call<TKey extends WeChatMethodName>(
			method: TKey,
			...args: WeChatMethodParameters<TKey>
		): Promise<WeChatMethodResult<TKey>> {
			return new Promise<WeChatMethodResult<TKey>>((resolve, reject) => {
				let settled = false;
				const succeed = (value: unknown) => {
					if (settled) return;
					settled = true;
					resolve(value as WeChatMethodResult<TKey>);
				};
				const fail = (error: unknown) => {
					if (settled) return;
					settled = true;
					reject(error);
				};
				try {
					const input = [...args] as unknown[];
					input[0] = callbackOptions(input[0], succeed, fail);
					const result = callable(raw, method).apply(raw, input);
					if (result instanceof Promise) void result.then(succeed, fail);
					else if (result !== undefined) succeed(result);
				} catch (error) {
					fail(error);
				}
			});
		},
		canIUse: (schema) => raw.canIUse(schema),
		create<TKey extends WeChatMethodName>(
			method: TKey,
			...args: WeChatMethodParameters<TKey>
		): WeChatMethodReturn<TKey> {
			return callable(raw, method).apply(raw, args) as WeChatMethodReturn<TKey>;
		},
		listen(onMethod, offMethod, listener) {
			callable(raw, onMethod).call(raw, listener);
			return () => callable(raw, offMethod).call(raw, listener);
		}
	};
}
