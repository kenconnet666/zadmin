/** Framework-agnostic latest-wins orchestration for externally owned async collections. */

export type AsyncCollectionQueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncCollectionQueryState<TData> {
	readonly data: TData | undefined;
	readonly error: unknown;
	readonly generation: number;
	readonly loading: boolean;
	readonly status: AsyncCollectionQueryStatus;
}

export interface AsyncCollectionQueryContext {
	readonly generation: number;
	readonly signal: AbortSignal;
}

export type AsyncCollectionQueryLoader<TQuery, TData> = (
	query: TQuery,
	context: AsyncCollectionQueryContext
) => TData | PromiseLike<TData>;

export type AsyncCollectionQueryListener<TData> = (state: AsyncCollectionQueryState<TData>) => void;

const INITIAL_STATE: AsyncCollectionQueryState<never> = Object.freeze({
	data: undefined,
	error: undefined,
	generation: 0,
	loading: false,
	status: 'idle'
});

function freezeState<TData>(
	state: AsyncCollectionQueryState<TData>
): AsyncCollectionQueryState<TData> {
	return Object.freeze({ ...state });
}

/**
 * Owns only request lifecycle state. It has no implicit cache or global store, and leaves value,
 * open, active descendant, and rendered options ownership to the caller (for example ZCombobox).
 */
export class AsyncCollectionQuery<TQuery, TData> {
	readonly #loader: AsyncCollectionQueryLoader<TQuery, TData>;
	#state: AsyncCollectionQueryState<TData> = INITIAL_STATE;
	#controller: AbortController | undefined;
	#generation = 0;
	#disposed = false;
	readonly #listeners = new Set<AsyncCollectionQueryListener<TData>>();

	constructor(loader: AsyncCollectionQueryLoader<TQuery, TData>) {
		if (typeof loader !== 'function')
			throw new TypeError('Async collection query loader must be a function.');
		this.#loader = loader;
	}

	get state(): AsyncCollectionQueryState<TData> {
		return this.#state;
	}

	subscribe(listener: AsyncCollectionQueryListener<TData>): () => void {
		if (this.#disposed) throw new Error('Async collection query has been disposed.');
		if (typeof listener !== 'function')
			throw new TypeError('Async collection query listener must be a function.');
		this.#listeners.add(listener);
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			this.#listeners.delete(listener);
		};
	}

	async load(query: TQuery): Promise<TData | undefined> {
		if (this.#disposed) throw new Error('Async collection query has been disposed.');
		this.#controller?.abort();
		const controller = new AbortController();
		const generation = ++this.#generation;
		this.#controller = controller;
		this.#publish({
			...this.#state,
			error: undefined,
			generation,
			loading: true,
			status: 'loading'
		});
		if (!this.#isCurrent(generation, controller)) return undefined;
		try {
			const data = await this.#loader(query, { generation, signal: controller.signal });
			if (!this.#isCurrent(generation, controller)) return undefined;
			this.#controller = undefined;
			this.#publish({ data, error: undefined, generation, loading: false, status: 'success' });
			return data;
		} catch (error) {
			if (!this.#isCurrent(generation, controller)) return undefined;
			this.#controller = undefined;
			this.#publish({ ...this.#state, error, generation, loading: false, status: 'error' });
			return undefined;
		}
	}

	cancel(): void {
		if (this.#disposed || this.#controller === undefined) return;
		this.#controller?.abort();
		this.#controller = undefined;
		this.#generation += 1;
		this.#publish({
			...this.#state,
			error: undefined,
			generation: this.#generation,
			loading: false,
			status: 'idle'
		});
	}

	dispose(): void {
		if (this.#disposed) return;
		this.#disposed = true;
		this.#controller?.abort();
		this.#controller = undefined;
		this.#generation += 1;
		this.#state = freezeState({
			...this.#state,
			error: undefined,
			generation: this.#generation,
			loading: false,
			status: 'idle'
		});
		this.#listeners.clear();
	}

	#isCurrent(generation: number, controller: AbortController): boolean {
		return (
			!this.#disposed &&
			this.#generation === generation &&
			this.#controller === controller &&
			!controller.signal.aborted
		);
	}

	#publish(next: AsyncCollectionQueryState<TData>): void {
		this.#state = freezeState(next);
		for (const listener of [...this.#listeners]) {
			try {
				listener(this.#state);
			} catch {
				// Consumer observers cannot break request lifecycle or sibling observers.
			}
		}
	}
}
