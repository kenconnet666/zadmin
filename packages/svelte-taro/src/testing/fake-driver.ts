import type Taro from '@tarojs/taro';

import type {
	PlatformDriver,
	PlatformDriverEnvironment,
	TaroMethodName,
	TaroMethodParameters,
	TaroMethodResult
} from '../platform/types.ts';

type FakeHandler = (...args: readonly unknown[]) => unknown | Promise<unknown>;

export class FakePlatformDriver implements PlatformDriver {
	readonly #handlers = new Map<string, FakeHandler>();
	readonly #listeners = new Map<string, Set<(value: unknown) => void>>();
	readonly #supported = new Map<string, boolean>();
	readonly calls: string[] = [];
	readonly environment: PlatformDriverEnvironment;
	readonly raw: Taro.TaroStatic;

	constructor(environment: Partial<PlatformDriverEnvironment> = {}) {
		this.environment = { realDevice: false, ...environment };
		this.raw = new Proxy({} as Taro.TaroStatic, {
			get:
				(_target, key) =>
				(...args: readonly unknown[]) =>
					this.run(String(key), args)
		});
	}

	setSupported(schema: string, supported: boolean): this {
		this.#supported.set(schema, supported);
		return this;
	}

	setResult<TKey extends TaroMethodName>(method: TKey, value: TaroMethodResult<TKey>): this {
		this.#handlers.set(method, () => value);
		return this;
	}

	setHandler<TKey extends TaroMethodName>(
		method: TKey,
		handler: (...args: TaroMethodParameters<TKey>) => unknown | Promise<unknown>
	): this {
		this.#handlers.set(method, handler as FakeHandler);
		return this;
	}

	emit<TValue>(onMethod: TaroMethodName, value: TValue): void {
		for (const listener of this.#listeners.get(onMethod) ?? []) listener(value);
	}

	listenerCount(onMethod?: TaroMethodName): number {
		if (onMethod !== undefined) return this.#listeners.get(onMethod)?.size ?? 0;
		return [...this.#listeners.values()].reduce((count, listeners) => count + listeners.size, 0);
	}

	async call<TKey extends TaroMethodName>(
		method: TKey,
		...args: TaroMethodParameters<TKey>
	): Promise<TaroMethodResult<TKey>> {
		return (await this.run(method, args)) as TaroMethodResult<TKey>;
	}

	canIUse(schema: string): boolean {
		return this.#supported.get(schema) ?? true;
	}

	create<TKey extends TaroMethodName>(
		method: TKey,
		...args: TaroMethodParameters<TKey>
	): TaroMethodResult<TKey> {
		const result = this.run(method, args);
		if (result instanceof Promise)
			throw new TypeError(`Fake handler for ${method} must be synchronous.`);
		return result as TaroMethodResult<TKey>;
	}

	listen<TValue>(
		onMethod: TaroMethodName,
		_offMethod: TaroMethodName,
		listener: (value: TValue) => void
	): () => void {
		this.calls.push(onMethod);
		const listeners = this.#listeners.get(onMethod) ?? new Set();
		const rawListener = listener as (value: unknown) => void;
		listeners.add(rawListener);
		this.#listeners.set(onMethod, listeners);
		return () => {
			this.calls.push(_offMethod);
			listeners.delete(rawListener);
		};
	}

	private run(method: string, args: readonly unknown[]): unknown | Promise<unknown> {
		this.calls.push(method);
		const handler = this.#handlers.get(method);
		if (handler === undefined) return {};
		return handler(...args);
	}
}
