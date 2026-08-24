import type { ResourceScope } from '../runtime/scope.ts';
import type { DisposableHandle } from './types.ts';

export class ScopedHandle<TValue = undefined> implements DisposableHandle<TValue> {
	#closed = false;
	readonly #close: () => unknown | Promise<unknown>;
	readonly value: TValue;

	constructor(scope: ResourceScope, value: TValue, close: () => unknown | Promise<unknown>) {
		this.value = value;
		this.#close = close;
		scope.add(this);
	}

	get closed(): boolean {
		return this.#closed;
	}

	async close(): Promise<void> {
		if (this.#closed) return;
		this.#closed = true;
		await this.#close();
	}

	dispose(): Promise<void> {
		return this.close();
	}
}

export function scopedListener<TValue>(
	scope: ResourceScope,
	subscribe: (listener: (value: TValue) => void) => () => void,
	listener: (value: TValue) => void
): ScopedHandle {
	return new ScopedHandle(scope, undefined, subscribe(listener));
}
