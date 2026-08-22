import {
	DuplicateProviderError,
	PluginNotActiveError,
	PluginNotFoundError,
	PluginRuntimeError,
	ProviderNotActiveError
} from './errors.ts';
import {
	collectDependents,
	createPluginGraph,
	type NormalizedPlugin,
	type PluginGraph
} from './graph.ts';
import type { Injection } from './injection.ts';
import { PluginScope } from './scope.ts';
import type {
	AnyPluginDefinition,
	AppDefinition,
	HostProvider,
	LifecycleEvent,
	PluginApi,
	PluginDisposer,
	PluginSnapshot,
	PluginState,
	ProviderSnapshot,
	RuntimeSnapshot
} from './types.ts';

interface PluginRecord extends NormalizedPlugin {
	state: PluginState;
	revision: number;
	waitingFor: readonly string[];
	api?: unknown;
	scope?: PluginScope;
	error?: unknown;
}

interface ProviderRecord {
	readonly id: string;
	readonly version: string;
	readonly owner: 'host' | string;
	readonly value: unknown;
}

type LifecycleListener = (event: LifecycleEvent) => void;

export class PluginRuntime {
	readonly instanceId = globalThis.crypto.randomUUID();
	readonly #records = new Map<string, PluginRecord>();
	readonly #providers = new Map<string, ProviderRecord>();
	readonly #listeners = new Set<LifecycleListener>();
	#graph?: PluginGraph;
	#appId?: string;
	#operation: Promise<unknown> = Promise.resolve();

	get snapshot(): RuntimeSnapshot {
		return Object.freeze({
			instanceId: this.instanceId,
			appId: this.#appId,
			providers: Object.freeze(
				[...this.#providers.values()]
					.map((provider) => this.#providerSnapshot(provider))
					.sort((left, right) => left.id.localeCompare(right.id))
			),
			plugins: Object.freeze(
				[...this.#records.values()]
					.map((record) => this.#pluginSnapshot(record))
					.sort((left, right) => left.id.localeCompare(right.id))
			)
		});
	}

	provide<T>(provider: HostProvider<T>): PluginDisposer {
		const existing = this.#providers.get(provider.id);
		if (existing) throw new DuplicateProviderError(provider.id, existing.owner);
		const record = Object.freeze({ ...provider, owner: 'host' as const });
		this.#providers.set(record.id, record);
		let active = true;
		return () => {
			if (!active) return;
			active = false;
			if (this.#providers.get(record.id) === record) this.#providers.delete(record.id);
		};
	}

	resolve<T>(injection: Injection<T, boolean>): T {
		const provider = this.#providers.get(injection.id);
		if (!provider) throw new ProviderNotActiveError(injection.id);
		return provider.value as T;
	}

	onLifecycle(listener: LifecycleListener): () => void {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	get<TPlugin extends AnyPluginDefinition>(plugin: TPlugin): PluginApi<TPlugin> {
		const record = this.#records.get(plugin.id);
		if (!record || record.state !== 'active') throw new PluginNotActiveError(plugin.id);
		return record.api as PluginApi<TPlugin>;
	}

	async reconcile(app: AppDefinition): Promise<void> {
		await this.#enqueue(() => this.#reconcile(app));
	}

	async start(id: string): Promise<void> {
		await this.#enqueue(async () => {
			const graph = this.#requireGraph();
			if (!graph.plugins.has(id)) throw new PluginNotFoundError(id);
			for (const pluginId of graph.order) {
				if (pluginId === id || this.#dependsOn(graph, id, pluginId)) {
					await this.#startRecord(pluginId);
				}
			}
		});
	}

	async stop(id: string): Promise<void> {
		await this.#enqueue(async () => {
			const graph = this.#requireGraph();
			if (!graph.plugins.has(id)) throw new PluginNotFoundError(id);
			await this.#stopIds(collectDependents(graph, [id]), 'manual stop');
		});
	}

	async reload(id: string, replacement?: AnyPluginDefinition): Promise<void> {
		await this.#enqueue(async () => {
			const graph = this.#requireGraph();
			if (!graph.plugins.has(id)) throw new PluginNotFoundError(id);
			if (!replacement) {
				const affected = collectDependents(graph, [id]);
				await this.#stopIds(affected, 'manual reload');
				for (const pluginId of graph.order) {
					if (affected.has(pluginId)) await this.#startRecord(pluginId);
				}
				return;
			}
			if (replacement.id !== id) {
				throw new PluginRuntimeError(
					`Replacement plugin id "${replacement.id}" does not match "${id}".`
				);
			}

			const plugins = [...graph.plugins.values()].map((plugin) => ({
				plugin: plugin.definition.id === id ? replacement : plugin.definition,
				config: plugin.config
			}));
			await this.#reconcile({ id: this.#appId ?? 'app', plugins });
		});
	}

	async dispose(): Promise<void> {
		await this.#enqueue(async () => {
			if (this.#graph) await this.#stopIds(new Set(this.#graph.order), 'runtime dispose');
			this.#records.clear();
			this.#graph = undefined;
			this.#appId = undefined;
		});
	}

	async #reconcile(app: AppDefinition): Promise<void> {
		const nextGraph = createPluginGraph(app);
		const previousGraph = this.#graph;
		const changed = new Set<string>();

		if (previousGraph) {
			for (const [id, previous] of previousGraph.plugins) {
				const next = nextGraph.plugins.get(id);
				if (
					!next ||
					next.definition !== previous.definition ||
					!Object.is(next.config, previous.config)
				) {
					changed.add(id);
				}
			}
		}
		for (const id of nextGraph.plugins.keys()) {
			if (!previousGraph?.plugins.has(id)) changed.add(id);
		}

		if (previousGraph && changed.size) {
			const affected = new Set<string>();
			for (const id of collectDependents(previousGraph, changed)) affected.add(id);
			for (const id of collectDependents(nextGraph, changed)) affected.add(id);
			await this.#stopIds(affected, 'reconcile');
		}

		for (const id of [...this.#records.keys()]) {
			if (!nextGraph.plugins.has(id)) this.#records.delete(id);
		}
		for (const [id, plugin] of nextGraph.plugins) {
			const existing = this.#records.get(id);
			if (existing) {
				existing.definition = plugin.definition;
				existing.config = plugin.config;
				existing.revision += changed.has(id) ? 1 : 0;
				existing.error = undefined;
			} else {
				this.#records.set(id, {
					...plugin,
					state: 'registered',
					revision: 0,
					waitingFor: Object.freeze([])
				});
			}
		}

		this.#graph = nextGraph;
		this.#appId = app.id;
		for (const id of nextGraph.order) await this.#startRecord(id);
	}

	async #startRecord(id: string): Promise<void> {
		const graph = this.#requireGraph();
		const record = this.#records.get(id);
		if (!record || record.state === 'active' || record.state === 'starting') return;

		const dependencyEntries = Object.entries(record.definition.dependencies);
		const waitingFor = dependencyEntries
			.map(([, dependency]) => dependency)
			.filter((dependency) => !dependency.optional && !this.#providers.has(dependency.id))
			.map((dependency) => dependency.id);
		if (waitingFor.length) {
			record.waitingFor = Object.freeze(waitingFor);
			this.#transition(record, 'waiting', 'dependencies unavailable');
			return;
		}

		record.waitingFor = Object.freeze([]);
		record.error = undefined;
		this.#transition(record, 'starting');
		const scope = new PluginScope(id);
		record.scope = scope;
		let started = false;

		try {
			const dependencies = Object.fromEntries(
				dependencyEntries.map(([key, dependency]) => [
					key,
					this.#providers.get(dependency.id)?.value
				])
			);
			const api = await record.definition.setup(scope, dependencies, record.config);
			const existingProvider = this.#providers.get(id);
			if (existingProvider) throw new DuplicateProviderError(id, existingProvider.owner);
			record.api = api;
			this.#providers.set(id, Object.freeze({ id, version: '0.0.0', owner: id, value: api }));
			this.#transition(record, 'active');
			started = true;
		} catch (caught) {
			let error = caught;
			try {
				await scope.dispose();
			} catch (disposeError) {
				error = new AggregateError(
					[caught, disposeError],
					`Plugin "${id}" failed to start and clean up.`
				);
			}
			this.#removePluginProvider(id);
			record.api = undefined;
			record.scope = undefined;
			record.error = error;
			this.#transition(record, 'failed', 'setup failed', error);
		}

		for (const dependent of graph.dependents.get(id) ?? []) {
			if (started) await this.#startRecord(dependent);
		}
	}

	async #stopIds(ids: Set<string>, reason: string): Promise<void> {
		const graph = this.#requireGraph();
		for (const id of [...graph.order].reverse()) {
			if (!ids.has(id)) continue;
			const record = this.#records.get(id);
			if (!record || !['active', 'failed', 'waiting', 'registered'].includes(record.state)) {
				continue;
			}

			this.#removePluginProvider(id);
			if (record.state === 'active') {
				this.#transition(record, 'stopping', reason);
				try {
					await record.scope?.dispose();
					this.#transition(record, 'stopped', reason);
				} catch (error) {
					record.error = error;
					this.#transition(record, 'failed', 'dispose failed', error);
				}
			} else {
				this.#transition(record, 'stopped', reason);
			}

			record.api = undefined;
			record.scope = undefined;
			record.waitingFor = Object.freeze([]);
		}
	}

	#transition(record: PluginRecord, current: PluginState, reason?: string, error?: unknown): void {
		if (record.state === current) return;
		const previous = record.state;
		record.state = current;
		const event: LifecycleEvent = Object.freeze({
			pluginId: record.definition.id,
			previous,
			current,
			timestamp: Date.now(),
			reason,
			error
		});
		for (const listener of this.#listeners) listener(event);
	}

	#dependsOn(graph: PluginGraph, pluginId: string, dependencyId: string): boolean {
		const visited = new Set<string>();
		const visit = (id: string): boolean => {
			if (visited.has(id)) return false;
			visited.add(id);
			for (const candidate of graph.dependencies.get(id) ?? []) {
				if (candidate === dependencyId || visit(candidate)) return true;
			}
			return false;
		};
		return visit(pluginId);
	}

	#requireGraph(): PluginGraph {
		if (!this.#graph) throw new PluginRuntimeError('Plugin runtime has no app definition.');
		return this.#graph;
	}

	#pluginSnapshot(record: PluginRecord): PluginSnapshot {
		return Object.freeze({
			id: record.definition.id,
			state: record.state,
			dependencies: Object.freeze(
				Object.values(record.definition.dependencies).map((dependency) => dependency.id)
			),
			waitingFor: record.waitingFor,
			revision: record.revision,
			error: record.error
		});
	}

	#providerSnapshot(provider: ProviderRecord): ProviderSnapshot {
		return Object.freeze({
			id: provider.id,
			version: provider.version,
			owner: provider.owner
		});
	}

	#removePluginProvider(id: string): void {
		if (this.#providers.get(id)?.owner === id) this.#providers.delete(id);
	}

	#enqueue<T>(operation: () => Promise<T>): Promise<T> {
		const next = this.#operation.then(operation, operation);
		this.#operation = next.catch(() => undefined);
		return next;
	}
}
