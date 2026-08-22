import type {
	ClientPageRegistry,
	ClientPluginContext,
	ClientPluginModule,
	ClientPluginPage
} from './pages.ts';
import type { PluginDisposer } from '@zadmin/core';

export interface ClientPluginArtifact {
	readonly id: string;
	readonly revision: string;
	readonly url: string;
}

export interface ClientPluginRuntimeOptions {
	readonly importModule?: (artifact: ClientPluginArtifact) => Promise<ClientPluginModule>;
}

interface ActiveClientPlugin {
	readonly artifact: ClientPluginArtifact;
	readonly module: ClientPluginModule;
	readonly dispose: PluginDisposer;
}

interface OwnedPage {
	readonly owner: string;
	readonly page: ClientPluginPage;
}

export class ClientPageStore {
	readonly #pages = new Map<string, OwnedPage>();
	readonly #listeners = new Set<() => void>();
	#batchDepth = 0;
	#changed = false;

	get paths(): readonly string[] {
		return Object.freeze([...this.#pages.keys()].sort());
	}

	match(pathname: string): ClientPluginPage | undefined {
		return this.#pages.get(normalizePath(pathname))?.page;
	}

	forOwner(owner: string): ClientPageRegistry {
		return Object.freeze({
			register: (page: ClientPluginPage) => this.#register(owner, page)
		});
	}

	subscribe(listener: () => void): PluginDisposer {
		this.#listeners.add(listener);
		return () => {
			this.#listeners.delete(listener);
		};
	}

	async batch<T>(operation: () => T | Promise<T>): Promise<T> {
		this.#batchDepth += 1;
		try {
			return await operation();
		} finally {
			this.#batchDepth -= 1;
			if (this.#batchDepth === 0 && this.#changed) {
				this.#changed = false;
				this.#notify();
			}
		}
	}

	#register(owner: string, page: ClientPluginPage): PluginDisposer {
		const path = normalizePath(page.path);
		const existing = this.#pages.get(path);
		if (existing) throw new Error(`Client page ${path} is already owned by ${existing.owner}.`);
		const entry = Object.freeze({ owner, page: Object.freeze({ ...page, path }) });
		this.#pages.set(path, entry);
		this.#markChanged();
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			if (this.#pages.get(path) === entry) {
				this.#pages.delete(path);
				this.#markChanged();
			}
		};
	}

	#markChanged(): void {
		if (this.#batchDepth) this.#changed = true;
		else this.#notify();
	}

	#notify(): void {
		for (const listener of this.#listeners) listener();
	}
}

export class ClientPluginRuntime {
	readonly pages = new ClientPageStore();
	readonly #active = new Map<string, ActiveClientPlugin>();
	readonly #importModule: (artifact: ClientPluginArtifact) => Promise<ClientPluginModule>;
	#operation: Promise<void> = Promise.resolve();

	constructor(options: ClientPluginRuntimeOptions = {}) {
		this.#importModule = options.importModule ?? importClientPlugin;
	}

	get artifacts(): readonly ClientPluginArtifact[] {
		return Object.freeze([...this.#active.values()].map(({ artifact }) => artifact));
	}

	reconcile(artifacts: readonly ClientPluginArtifact[]): Promise<void> {
		const snapshot = Object.freeze([...artifacts]);
		const next = this.#operation.then(() => this.#reconcile(snapshot));
		this.#operation = next.catch(() => undefined);
		return next;
	}

	async dispose(): Promise<void> {
		await this.reconcile([]);
	}

	async #reconcile(artifacts: readonly ClientPluginArtifact[]): Promise<void> {
		const nextById = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
		if (nextById.size !== artifacts.length) throw new Error('Duplicate client plugin artifact id.');
		const changed = artifacts.filter(
			(artifact) => this.#active.get(artifact.id)?.artifact.revision !== artifact.revision
		);
		const removed = [...this.#active.values()].filter(({ artifact }) => !nextById.has(artifact.id));
		const modules = new Map<string, ClientPluginModule>();
		for (const artifact of changed) modules.set(artifact.id, await this.#importModule(artifact));

		const disposedPrevious: ActiveClientPlugin[] = [];
		const activated: ActiveClientPlugin[] = [];
		try {
			await this.#batchPages(async () => {
				for (const plugin of [...removed, ...changed.map(({ id }) => this.#active.get(id))]) {
					if (!plugin) continue;
					await plugin.dispose();
					this.#active.delete(plugin.artifact.id);
					disposedPrevious.push(plugin);
				}
				for (const artifact of changed) {
					const module = modules.get(artifact.id)!;
					const dispose = await module.activate(this.#context(artifact.id));
					const plugin = Object.freeze({ artifact, module, dispose });
					this.#active.set(artifact.id, plugin);
					activated.push(plugin);
				}
			});
		} catch (error) {
			await this.#batchPages(async () => {
				for (const plugin of activated.reverse()) await plugin.dispose();
				for (const plugin of disposedPrevious) {
					const dispose = await plugin.module.activate(this.#context(plugin.artifact.id));
					this.#active.set(plugin.artifact.id, Object.freeze({ ...plugin, dispose }));
				}
			});
			throw error;
		}
	}

	#context(owner: string): ClientPluginContext {
		return Object.freeze({ pages: this.pages.forOwner(owner) });
	}

	async #batchPages(operation: () => Promise<void>): Promise<void> {
		await this.pages.batch(operation);
	}
}

async function importClientPlugin(artifact: ClientPluginArtifact): Promise<ClientPluginModule> {
	const url = new URL(artifact.url, globalThis.location?.href);
	url.searchParams.set('revision', artifact.revision);
	const module = (await import(/* @vite-ignore */ url.href)) as Record<string, unknown>;
	if (typeof module.activate !== 'function') {
		throw new Error(`${artifact.id}: client entry must export activate(context).`);
	}
	return module as unknown as ClientPluginModule;
}

function normalizePath(path: string): string {
	if (!path.startsWith('/')) throw new Error(`Client page path must start with "/": ${path}`);
	const normalized = path.replace(/\/{2,}/g, '/').replace(/\/$/, '');
	return normalized || '/';
}
