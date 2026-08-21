import { PluginNotActiveError, PluginNotFoundError, PluginRuntimeError } from './errors.ts';
import {
	collectDependents,
	createPluginGraph,
	type NormalizedPlugin,
	type PluginGraph
} from './graph.ts';
import { PluginScope } from './scope.ts';
import type {
	AnyPluginDefinition,
	AppDefinition,
	LifecycleEvent,
	PluginApi,
	PluginSnapshot,
	PluginState,
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

type LifecycleListener = (event: LifecycleEvent) => void;

export class PluginRuntime {
	readonly instanceId = globalThis.crypto.randomUUID();
	readonly #records = new Map<string, PluginRecord>();
	readonly #listeners = new Set<LifecycleListener>();
	#graph?: PluginGraph;
	#appId?: string;
	#operation: Promise<unknown> = Promise.resolve();

	get snapshot(): RuntimeSnapshot {
		return Object.freeze({
			instanceId: this.instanceId,
			appId: this.#appId,
			plugins: Object.freeze(
				[...this.#records.values()]
					.map((record) => this.#snapshot(record))
					.sort((left, right) => left.id.localeCompare(right.id))
			)
		});
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
			if (replacement && replacement.id !== id) {
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
			const previousAffected = collectDependents(
				previousGraph,
				[...changed].filter((id) => previousGraph.plugins.has(id))
			);
			await this.#stopIds(previousAffected, 'reconcile');
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
			.map(([, dependency]) => dependency.id)
			.filter((dependencyId) => this.#records.get(dependencyId)?.state !== 'active');
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
				dependencyEntries.map(([key, dependency]) => [key, this.#records.get(dependency.id)?.api])
			);
			record.api = await record.definition.setup(scope, dependencies, record.config);
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
			if (!record || !['active', 'failed', 'waiting', 'registered'].includes(record.state))
				continue;

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

	#snapshot(record: PluginRecord): PluginSnapshot {
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

	#enqueue<T>(operation: () => Promise<T>): Promise<T> {
		const next = this.#operation.then(operation, operation);
		this.#operation = next.catch(() => undefined);
		return next;
	}
}
