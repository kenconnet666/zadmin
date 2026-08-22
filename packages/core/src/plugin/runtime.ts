import { ServiceContainer } from '../container/container.ts';
import type {
	ContainerEvent,
	ContainerSnapshot,
	ModuleSnapshot
} from '../container/diagnostics.ts';
import { ContainerError } from '../container/errors.ts';
import type { Injection } from '../container/injection.ts';
import type { AnyModuleDefinition, AnyPluginDefinition, PluginApi } from '../container/module.ts';
import type { ServiceToken } from '../container/token.ts';
import {
	defineApp,
	pluginDefinition,
	pluginRegistration,
	type AppDefinition,
	type PluginUse
} from './definition.ts';

export interface PluginRuntimeOptions {
	readonly modules?: readonly AnyModuleDefinition[];
}

export interface RuntimeSnapshot extends ContainerSnapshot {
	readonly appId?: string;
	readonly plugins: readonly ModuleSnapshot[];
}

export class PluginRuntime {
	readonly container = new ServiceContainer();
	readonly #hostModules: readonly AnyModuleDefinition[];
	readonly #manualRevisions = new Map<string, number>();
	readonly #stopped = new Set<string>();
	#app?: AppDefinition;

	constructor(options: PluginRuntimeOptions = {}) {
		this.#hostModules = Object.freeze([...(options.modules ?? [])]);
	}

	get instanceId(): string {
		return this.container.instanceId;
	}

	get snapshot(): RuntimeSnapshot {
		const snapshot = this.container.snapshot;
		return Object.freeze({
			...snapshot,
			...(this.#app ? { appId: this.#app.id } : {}),
			plugins: Object.freeze(snapshot.modules.filter(({ kind }) => kind === 'plugin'))
		});
	}

	resolve<T>(reference: ServiceToken<T> | Injection<T, boolean>): T {
		return this.container.resolve(reference);
	}

	get<Plugin extends AnyPluginDefinition>(plugin: Plugin): PluginApi<Plugin> {
		return this.container.resolve(plugin.primary) as PluginApi<Plugin>;
	}

	onEvent(listener: (event: ContainerEvent) => void): () => void {
		const dispose = this.container.onEvent(listener);
		return () => void dispose();
	}

	async reconcile(app: AppDefinition): Promise<void> {
		if (this.#app && this.#app.id !== app.id) {
			throw new ContainerError(
				`Runtime for app "${this.#app.id}" cannot reconcile app "${app.id}".`
			);
		}
		const ids = new Set(app.plugins.map((use) => pluginDefinition(use).id));
		for (const stopped of [...this.#stopped]) if (!ids.has(stopped)) this.#stopped.delete(stopped);
		await this.container.reconcile([
			...this.#hostModules.map((definition) =>
				Object.freeze({
					definition,
					config: definition.defaultConfig,
					kind: 'host' as const,
					version: definition.version,
					revision: `host:${definition.version}`
				})
			),
			...app.plugins
				.filter((use) => !this.#stopped.has(pluginDefinition(use).id))
				.map((use) => {
					const id = pluginDefinition(use).id;
					const manualRevision = this.#manualRevisions.get(id) ?? 0;
					return pluginRegistration(use, manualRevision ? String(manualRevision) : '');
				})
		]);
		this.#app = app;
	}

	async start(id: string): Promise<void> {
		const app = this.#requireApp();
		if (!app.plugins.some((use) => pluginDefinition(use).id === id)) {
			throw new ContainerError(`Plugin "${id}" is not installed.`);
		}
		if (!this.#stopped.delete(id)) return;
		try {
			await this.reconcile(app);
		} catch (error) {
			this.#stopped.add(id);
			throw error;
		}
	}

	async stop(id: string): Promise<void> {
		const app = this.#requireApp();
		if (!app.plugins.some((use) => pluginDefinition(use).id === id)) {
			throw new ContainerError(`Plugin "${id}" is not installed.`);
		}
		if (this.#stopped.has(id)) return;
		this.#stopped.add(id);
		try {
			await this.reconcile(app);
		} catch (error) {
			this.#stopped.delete(id);
			throw error;
		}
	}

	async reload(id: string, replacement?: AnyPluginDefinition): Promise<void> {
		const app = this.#requireApp();
		const index = app.plugins.findIndex((use) => pluginDefinition(use).id === id);
		if (index < 0) throw new ContainerError(`Plugin "${id}" is not installed.`);
		if (replacement && replacement.id !== id) {
			throw new ContainerError(`Replacement plugin id "${replacement.id}" does not match "${id}".`);
		}
		this.#manualRevisions.set(id, (this.#manualRevisions.get(id) ?? 0) + 1);
		const plugins = [...app.plugins];
		if (replacement) plugins[index] = replaceDefinition(plugins[index]!, replacement);
		await this.reconcile(defineApp({ id: app.id, plugins }));
	}

	async dispose(): Promise<void> {
		await this.container.dispose();
		this.#app = undefined;
		this.#stopped.clear();
		this.#manualRevisions.clear();
	}

	#requireApp(): AppDefinition {
		if (!this.#app) throw new ContainerError('Plugin runtime has no app definition.');
		return this.#app;
	}
}

function replaceDefinition(use: PluginUse, replacement: AnyPluginDefinition): PluginUse {
	if (use.plugin === true) return replacement;
	if ('artifactRevision' in use) {
		return Object.freeze({
			plugin: replacement,
			config: use.config,
			version: use.version,
			artifactRevision: use.artifactRevision
		});
	}
	return Object.freeze({ plugin: replacement, config: use.config });
}
