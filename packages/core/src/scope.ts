import type { PluginContext, PluginDisposer } from './types.ts';

export class PluginScope implements PluginContext {
	readonly #controller = new AbortController();
	readonly #disposers: PluginDisposer[] = [];
	readonly id: string;
	#disposed = false;

	constructor(id: string) {
		this.id = id;
	}

	get signal(): AbortSignal {
		return this.#controller.signal;
	}

	onDispose(disposer: PluginDisposer): void {
		if (this.#disposed) throw new Error(`Plugin scope "${this.id}" is already disposed.`);
		this.#disposers.push(disposer);
	}

	async effect(setup: () => void | PluginDisposer | Promise<void | PluginDisposer>): Promise<void> {
		if (this.#disposed) throw new Error(`Plugin scope "${this.id}" is already disposed.`);
		const disposer = await setup();
		if (disposer) this.onDispose(disposer);
	}

	async dispose(): Promise<void> {
		if (this.#disposed) return;
		this.#disposed = true;
		this.#controller.abort();

		const errors: unknown[] = [];
		for (const disposer of this.#disposers.reverse()) {
			try {
				await disposer();
			} catch (error) {
				errors.push(error);
			}
		}
		this.#disposers.length = 0;

		if (errors.length) {
			throw new AggregateError(errors, `Failed to dispose plugin "${this.id}" cleanly.`);
		}
	}
}
