export type MaybePromise<T> = T | Promise<T>;
export type Disposer = () => MaybePromise<void>;
export type Activation = () => MaybePromise<void | Disposer>;

export type ModuleKind = 'host' | 'plugin';
export type ScopeState =
	'active' | 'activating' | 'deactivating' | 'disposed' | 'disposing' | 'prepared';

export interface ServiceContext<Config = unknown> {
	readonly moduleId: string;
	readonly generation: string;
	readonly kind: ModuleKind;
	readonly config: Config;
	readonly signal: AbortSignal;

	onActivate(activation: Activation): void;
	onDeactivate(deactivation: Disposer): void;
	onDispose(disposer: Disposer): void;
	effect(acquire: () => MaybePromise<void | Disposer>): Promise<void>;
}

export class ServiceScope<Config = unknown> implements ServiceContext<Config> {
	readonly #controller = new AbortController();
	readonly #activations: Activation[] = [];
	readonly #deactivations: Disposer[] = [];
	readonly #disposers: Disposer[] = [];
	readonly #activeDisposers: Disposer[] = [];
	readonly moduleId: string;
	readonly generation: string;
	readonly kind: ModuleKind;
	readonly config: Config;
	#state: ScopeState = 'prepared';

	constructor(options: {
		readonly moduleId: string;
		readonly generation: string;
		readonly kind: ModuleKind;
		readonly config: Config;
	}) {
		this.moduleId = options.moduleId;
		this.generation = options.generation;
		this.kind = options.kind;
		this.config = options.config;
	}

	get signal(): AbortSignal {
		return this.#controller.signal;
	}

	get state(): ScopeState {
		return this.#state;
	}

	onActivate(activation: Activation): void {
		this.#assertMutable('register an activation');
		if (this.#state === 'active') {
			throw new Error(`Module "${this.moduleId}" is already active.`);
		}
		this.#activations.push(activation);
	}

	onDeactivate(deactivation: Disposer): void {
		this.#assertMutable('register a deactivation');
		this.#deactivations.push(deactivation);
	}

	onDispose(disposer: Disposer): void {
		this.#assertMutable('register a disposer');
		this.#disposers.push(disposer);
	}

	async effect(acquire: () => MaybePromise<void | Disposer>): Promise<void> {
		this.#assertMutable('acquire a resource');
		const disposer = await acquire();
		if (disposer) this.onDispose(disposer);
	}

	async activate(): Promise<void> {
		if (this.#state === 'active') return;
		if (this.#state !== 'prepared') {
			throw new Error(`Cannot activate module "${this.moduleId}" from ${this.#state}.`);
		}
		this.#state = 'activating';
		const acquired: Disposer[] = [];
		try {
			for (const activation of this.#activations) {
				const disposer = await activation();
				if (disposer) acquired.push(disposer);
			}
			this.#activeDisposers.push(...acquired);
			this.#state = 'active';
		} catch (error) {
			const errors = [error, ...(await runDisposers(acquired))];
			this.#state = 'prepared';
			throw aggregate(errors, `Failed to activate module "${this.moduleId}".`);
		}
	}

	async deactivate(): Promise<void> {
		if (this.#state === 'prepared' || this.#state === 'disposed') return;
		if (this.#state !== 'active') {
			throw new Error(`Cannot deactivate module "${this.moduleId}" from ${this.#state}.`);
		}
		this.#state = 'deactivating';
		const errors = [
			...(await runDisposers(this.#deactivations)),
			...(await runDisposers(this.#activeDisposers))
		];
		this.#activeDisposers.length = 0;
		this.#state = 'prepared';
		if (errors.length) {
			throw aggregate(errors, `Failed to deactivate module "${this.moduleId}".`);
		}
	}

	async dispose(): Promise<void> {
		if (this.#state === 'disposed') return;
		const errors: unknown[] = [];
		if (this.#state === 'active') {
			try {
				await this.deactivate();
			} catch (error) {
				errors.push(error);
			}
		}
		if (this.#state !== 'prepared') {
			throw new Error(`Cannot dispose module "${this.moduleId}" from ${this.#state}.`);
		}
		this.#state = 'disposing';
		this.#controller.abort();
		errors.push(...(await runDisposers(this.#disposers)));
		this.#disposers.length = 0;
		this.#state = 'disposed';
		if (errors.length) throw aggregate(errors, `Failed to dispose module "${this.moduleId}".`);
	}

	#assertMutable(action: string): void {
		if (this.#state === 'disposing' || this.#state === 'disposed') {
			throw new Error(`Cannot ${action}; module "${this.moduleId}" is ${this.#state}.`);
		}
	}
}

export async function runDisposers(disposers: readonly Disposer[]): Promise<unknown[]> {
	const errors: unknown[] = [];
	for (let index = disposers.length - 1; index >= 0; index -= 1) {
		try {
			await disposers[index]?.();
		} catch (error) {
			errors.push(error);
		}
	}
	return errors;
}

function aggregate(errors: readonly unknown[], message: string): unknown {
	return errors.length === 1 ? errors[0] : new AggregateError(errors, message);
}
