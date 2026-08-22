import type { Disposer } from './context.ts';
import { ServiceScope } from './context.ts';
import {
	type ContainerEvent,
	type ContainerSnapshot,
	type ContainerState,
	type GenerationState,
	type ModuleSnapshot,
	type ProviderSnapshot,
	type ProviderState,
	serializeError
} from './diagnostics.ts';
import { ContainerError, LeakedGenerationError, ServiceNotActiveError } from './errors.ts';
import {
	collectModuleDependents,
	createContainerPlan,
	type ContainerPlan,
	type ProviderNode
} from './graph.ts';
import type { Injection } from './injection.ts';
import type { ModuleRegistration } from './module.ts';
import type { ServiceHealth } from './provider.ts';
import type { ServiceToken } from './token.ts';

interface ServiceInstance {
	readonly node: ProviderNode;
	readonly generation: ModuleGeneration;
	readonly createdAt: number;
	created: boolean;
	value: unknown;
	state: ProviderState;
	activatedAt?: number;
	health?: ServiceHealth;
	error?: unknown;
}

interface ModuleGeneration {
	readonly id: string;
	readonly registration: ModuleRegistration;
	readonly scope: ServiceScope;
	readonly instances: Map<string, ServiceInstance>;
	readonly createdAt: number;
	state: GenerationState;
	error?: unknown;
}

export class ServiceContainer {
	readonly instanceId = globalThis.crypto.randomUUID();
	readonly #listeners = new Set<(event: ContainerEvent) => void>();
	readonly #generations = new Map<string, ModuleGeneration>();
	readonly #leaks = new Map<string, ModuleGeneration[]>();
	#registry = new Map<string, ServiceInstance>();
	#plan?: ContainerPlan;
	#operation: Promise<unknown> = Promise.resolve();
	#state: ContainerState = 'active';
	#degraded = false;

	get snapshot(): ContainerSnapshot {
		return this.#snapshot();
	}

	onEvent(listener: (event: ContainerEvent) => void): Disposer {
		this.#listeners.add(listener);
		return () => {
			this.#listeners.delete(listener);
		};
	}

	resolve<T>(reference: ServiceToken<T> | Injection<T, boolean>): T {
		const instance = this.#registry.get(reference.id);
		if (!instance || instance.state !== 'active') {
			throw new ServiceNotActiveError(reference.id);
		}
		return instance.value as T;
	}

	reconcile(registrations: readonly ModuleRegistration[]): Promise<void> {
		const snapshot = Object.freeze([...registrations]);
		return this.#enqueue(() => this.#reconcile(snapshot));
	}

	checkHealth(): Promise<ContainerSnapshot> {
		return this.#enqueue(async () => {
			this.#assertRunning();
			let unhealthy = false;
			for (const id of this.#plan?.order ?? []) {
				const instance = this.#registry.get(id);
				if (!instance?.node.definition.health) continue;
				try {
					instance.health = await instance.node.definition.health(
						instance.value as never,
						instance.generation.scope
					);
					instance.error = undefined;
					unhealthy ||= instance.health.status !== 'healthy';
				} catch (error) {
					instance.error = error;
					instance.health = Object.freeze({
						status: 'unhealthy' as const,
						message: error instanceof Error ? error.message : String(error)
					});
					unhealthy = true;
				}
			}
			this.#state = this.#degraded || unhealthy || this.#leaks.size ? 'degraded' : 'active';
			return this.#snapshot();
		});
	}

	dispose(): Promise<void> {
		return this.#enqueue(async () => {
			if (this.#state === 'disposed') return;
			const errors: unknown[] = [...this.#leaks.keys()].map(
				(moduleId) => new LeakedGenerationError(moduleId)
			);
			const generations = new Map(this.#generations);
			try {
				await this.#deactivateGenerations(generations, this.#plan);
			} catch (error) {
				errors.push(error);
			}
			this.#registry = new Map();
			errors.push(...(await this.#disposeGenerations(generations, this.#plan)));
			this.#generations.clear();
			this.#plan = undefined;
			this.#state = 'disposed';
			this.#emit(
				'state-changed',
				errors.length ? aggregate(errors, 'Container disposal failed.') : undefined
			);
			this.#listeners.clear();
			if (errors.length) throw aggregate(errors, 'Container disposal failed.');
		});
	}

	async #reconcile(registrations: readonly ModuleRegistration[]): Promise<void> {
		this.#assertRunning();
		this.#state = 'reconciling';
		const previousPlan = this.#plan;
		let nextPlan: ContainerPlan;
		try {
			nextPlan = createContainerPlan(registrations);
		} catch (error) {
			this.#state = this.#degraded || this.#leaks.size ? 'degraded' : 'active';
			this.#emit('reconcile-failed', error);
			throw error;
		}

		const affected = this.#affectedModules(nextPlan);
		if (!affected.size) {
			this.#plan = nextPlan;
			this.#state = this.#degraded || this.#leaks.size ? 'degraded' : 'active';
			return;
		}
		for (const id of affected) {
			if (this.#leaks.get(id)?.length) {
				const error = new LeakedGenerationError(id);
				this.#state = 'degraded';
				this.#emit('reconcile-failed', error);
				throw error;
			}
		}

		const candidates = this.#createCandidates(nextPlan, affected);
		try {
			await this.#prepareCandidates(candidates, nextPlan);
		} catch (error) {
			const cleanup = await this.#disposeGenerations(candidates, nextPlan);
			const failure = cleanup.length
				? aggregate([error, ...cleanup], 'Candidate preparation and cleanup failed.')
				: error;
			this.#state = this.#degraded || this.#leaks.size ? 'degraded' : 'active';
			this.#emit('reconcile-failed', failure);
			throw failure;
		}

		const previous = new Map([...this.#generations].filter(([moduleId]) => affected.has(moduleId)));
		try {
			await this.#deactivateGenerations(previous, previousPlan);
		} catch (error) {
			const recovery: unknown[] = [];
			try {
				await this.#activateGenerations(previous, previousPlan);
			} catch (recoveryError) {
				recovery.push(recoveryError);
				this.#degraded = true;
			}
			recovery.push(...(await this.#disposeGenerations(candidates, nextPlan)));
			const failure = aggregate([error, ...recovery], 'Old generation deactivation failed.');
			this.#state = this.#degraded || this.#leaks.size ? 'degraded' : 'active';
			this.#emit('reconcile-failed', failure);
			throw failure;
		}

		const previousRegistry = this.#registry;
		this.#registry = this.#candidateRegistry(affected, candidates);
		try {
			await this.#activateGenerations(candidates, nextPlan);
		} catch (error) {
			const recovery: unknown[] = [];
			try {
				await this.#deactivateGenerations(candidates, nextPlan);
			} catch (deactivateError) {
				recovery.push(deactivateError);
			}
			this.#registry = previousRegistry;
			try {
				await this.#activateGenerations(previous, previousPlan);
			} catch (reactivateError) {
				recovery.push(reactivateError);
				this.#degraded = true;
			}
			recovery.push(...(await this.#disposeGenerations(candidates, nextPlan)));
			const failure = aggregate([error, ...recovery], 'Candidate activation rollback failed.');
			this.#state = this.#degraded || this.#leaks.size ? 'degraded' : 'active';
			this.#emit('reconcile-failed', failure);
			throw failure;
		}

		for (const id of affected) this.#generations.delete(id);
		for (const [id, generation] of candidates) this.#generations.set(id, generation);
		this.#plan = nextPlan;

		const disposalErrors = await this.#disposeGenerations(previous, previousPlan);
		if (disposalErrors.length) this.#degraded = true;
		this.#state = this.#degraded || this.#leaks.size ? 'degraded' : 'active';
		this.#emit(
			'reconciled',
			disposalErrors.length
				? aggregate(disposalErrors, 'Old generation cleanup failed.')
				: undefined
		);
	}

	#affectedModules(next: ContainerPlan): Set<string> {
		const changed = new Set<string>();
		for (const id of new Set([...(this.#plan?.modules.keys() ?? []), ...next.modules.keys()])) {
			const previous = this.#plan?.modules.get(id);
			const candidate = next.modules.get(id);
			if (!previous || !candidate || !sameRegistration(previous, candidate)) {
				changed.add(id);
				continue;
			}
			if (!sameStrings(this.#plan?.waiting.get(id) ?? [], next.waiting.get(id) ?? [])) {
				changed.add(id);
			}
		}

		const affected = new Set<string>();
		for (const id of collectModuleDependents(this.#plan, changed)) affected.add(id);
		for (const id of collectModuleDependents(next, changed)) affected.add(id);
		return affected;
	}

	#createCandidates(
		plan: ContainerPlan,
		affected: ReadonlySet<string>
	): Map<string, ModuleGeneration> {
		const result = new Map<string, ModuleGeneration>();
		for (const id of affected) {
			const registration = plan.modules.get(id);
			if (!registration || plan.waiting.get(id)?.length) continue;
			const generationId = `${registration.revision.slice(0, 12)}-${globalThis.crypto.randomUUID()}`;
			result.set(id, {
				id: generationId,
				registration,
				scope: new ServiceScope({
					moduleId: id,
					generation: generationId,
					kind: registration.kind,
					config: registration.config
				}),
				instances: new Map(),
				createdAt: Date.now(),
				state: 'candidate'
			});
		}
		return result;
	}

	async #prepareCandidates(
		candidates: ReadonlyMap<string, ModuleGeneration>,
		plan: ContainerPlan
	): Promise<void> {
		for (const generation of candidates.values()) generation.state = 'preparing';
		for (const id of plan.order) {
			const node = plan.providers.get(id);
			if (!node) continue;
			const generation = candidates.get(node.module.definition.id);
			if (!generation) continue;
			const dependencies: Record<string, unknown> = {};
			for (const [key, injection] of Object.entries(node.definition.dependencies)) {
				const targetNode = plan.providers.get(injection.id);
				const target = targetNode
					? (candidates.get(targetNode.module.definition.id)?.instances.get(injection.id) ??
						this.#registry.get(injection.id))
					: undefined;
				if (!target || target.state === 'failed' || target.state === 'disposed') {
					if (injection.optional) dependencies[key] = undefined;
					else {
						throw new ContainerError(
							`Cannot prepare "${id}"; required service "${injection.id}" is unavailable.`
						);
					}
				} else dependencies[key] = target.value;
			}

			const instance: ServiceInstance = {
				node,
				generation,
				createdAt: Date.now(),
				created: false,
				value: undefined,
				state: 'creating'
			};
			generation.instances.set(id, instance);
			try {
				instance.value = await node.definition.create(generation.scope, dependencies as never);
				instance.created = true;
				instance.state = 'preparing';
				await node.definition.prepare?.(instance.value as never, generation.scope);
				instance.state = 'prepared';
			} catch (error) {
				instance.error = error;
				instance.state = 'failed';
				generation.error = error;
				generation.state = 'failed';
				throw new ContainerError(`Failed to prepare service "${id}".`, { cause: error });
			}
		}

		for (const id of plan.order) {
			const node = plan.providers.get(id);
			if (!node) continue;
			const instance = candidates.get(node.module.definition.id)?.instances.get(id);
			if (!instance?.node.definition.health) continue;
			try {
				instance.health = await instance.node.definition.health(
					instance.value as never,
					instance.generation.scope
				);
				if (instance.health.status !== 'healthy') {
					throw new Error(instance.health.message || `${id} is ${instance.health.status}.`);
				}
			} catch (error) {
				instance.error = error;
				instance.health = Object.freeze({
					status: 'unhealthy' as const,
					message: error instanceof Error ? error.message : String(error)
				});
				instance.state = 'failed';
				instance.generation.error = error;
				instance.generation.state = 'failed';
				throw new ContainerError(`Health check failed for service "${id}".`, { cause: error });
			}
		}
		for (const generation of candidates.values()) generation.state = 'candidate';
	}

	async #activateGenerations(
		generations: ReadonlyMap<string, ModuleGeneration>,
		plan: ContainerPlan | undefined
	): Promise<void> {
		if (!plan || !generations.size) return;
		for (const generation of generations.values()) generation.state = 'activating';
		for (const id of plan.order) {
			const instance = this.#instanceIn(generations, id);
			if (!instance || instance.state === 'active') continue;
			try {
				instance.state = 'activating';
				instance.error = undefined;
				await instance.node.definition.activate?.(
					instance.value as never,
					instance.generation.scope
				);
				instance.state = 'active';
				instance.activatedAt = Date.now();
			} catch (error) {
				instance.error = error;
				instance.state = 'failed';
				instance.generation.error = error;
				instance.generation.state = 'failed';
				throw new ContainerError(`Failed to activate service "${id}".`, { cause: error });
			}
		}
		for (const generation of orderedGenerations(plan, generations)) {
			try {
				generation.error = undefined;
				await generation.scope.activate();
				generation.state = 'active';
			} catch (error) {
				generation.error = error;
				generation.state = 'failed';
				throw new ContainerError(
					`Failed to activate module "${generation.registration.definition.id}".`,
					{ cause: error }
				);
			}
		}
	}

	async #deactivateGenerations(
		generations: ReadonlyMap<string, ModuleGeneration>,
		plan: ContainerPlan | undefined
	): Promise<void> {
		if (!plan || !generations.size) return;
		const errors: unknown[] = [];
		for (const generation of [...orderedGenerations(plan, generations)].reverse()) {
			generation.state = 'deactivating';
			try {
				await generation.scope.deactivate();
			} catch (error) {
				errors.push(error);
				generation.error = error;
			}
		}
		for (const id of [...plan.order].reverse()) {
			const instance = this.#instanceIn(generations, id);
			if (!instance || !['active', 'activating', 'failed'].includes(instance.state)) continue;
			try {
				instance.state = 'deactivating';
				await instance.node.definition.deactivate?.(
					instance.value as never,
					instance.generation.scope
				);
				instance.state = 'prepared';
			} catch (error) {
				errors.push(error);
				instance.error = error;
				instance.state = 'failed';
			}
		}
		for (const generation of generations.values()) {
			generation.state = generation.error ? 'failed' : 'candidate';
		}
		if (errors.length) throw aggregate(errors, 'Generation deactivation failed.');
	}

	async #disposeGenerations(
		generations: ReadonlyMap<string, ModuleGeneration>,
		plan: ContainerPlan | undefined
	): Promise<unknown[]> {
		if (!generations.size) return [];
		const errors: unknown[] = [];
		const ids = [
			...(plan?.order ?? []),
			...[...generations.values()].flatMap(({ instances }) => [...instances.keys()])
		];
		const visited = new Set<string>();
		for (const id of [...ids].reverse()) {
			const instance = this.#instanceIn(generations, id);
			if (!instance || visited.has(id) || instance.state === 'disposed') continue;
			visited.add(id);
			if (!instance.created) {
				instance.state = 'disposed';
				continue;
			}
			try {
				instance.state = 'disposing';
				await instance.node.definition.dispose?.(
					instance.value as never,
					instance.generation.scope
				);
				instance.state = 'disposed';
			} catch (error) {
				errors.push(error);
				instance.error = error;
				instance.state = 'failed';
				instance.generation.error = error;
			}
		}
		for (const generation of generations.values()) {
			let leaked = [...generation.instances.values()].some(({ state }) => state === 'failed');
			generation.state = 'disposing';
			try {
				await generation.scope.dispose();
			} catch (error) {
				errors.push(error);
				generation.error = error;
				leaked = true;
			}
			if (leaked) {
				generation.state = 'leaked';
				const moduleId = generation.registration.definition.id;
				const leaks = this.#leaks.get(moduleId) ?? [];
				if (!leaks.includes(generation)) leaks.push(generation);
				this.#leaks.set(moduleId, leaks);
				this.#degraded = true;
			} else generation.state = 'disposed';
		}
		return errors;
	}

	#candidateRegistry(
		affected: ReadonlySet<string>,
		candidates: ReadonlyMap<string, ModuleGeneration>
	): Map<string, ServiceInstance> {
		const registry = new Map(
			[...this.#registry].filter(
				([, instance]) => !affected.has(instance.node.module.definition.id)
			)
		);
		for (const generation of candidates.values()) {
			for (const [id, instance] of generation.instances) registry.set(id, instance);
		}
		return registry;
	}

	#instanceIn(
		generations: ReadonlyMap<string, ModuleGeneration>,
		providerId: string
	): ServiceInstance | undefined {
		for (const generation of generations.values()) {
			const instance = generation.instances.get(providerId);
			if (instance) return instance;
		}
		return undefined;
	}

	#snapshot(): ContainerSnapshot {
		const plan = this.#plan;
		const modules: ModuleSnapshot[] = [];
		const moduleIds = new Set([...(plan?.modules.keys() ?? []), ...this.#leaks.keys()]);
		for (const id of moduleIds) {
			const registration = plan?.modules.get(id) ?? this.#leaks.get(id)?.at(-1)?.registration;
			if (!registration) continue;
			const generation = this.#generations.get(id);
			modules.push(
				Object.freeze({
					id,
					kind: registration.kind,
					version: registration.version,
					revision: registration.revision,
					...(generation ? { generation: generation.id, createdAt: generation.createdAt } : {}),
					state: generation
						? ('active' as const)
						: plan?.modules.has(id)
							? ('waiting' as const)
							: ('leaked' as const),
					providers: Object.freeze(registration.definition.providers.map(({ token }) => token.id)),
					dependencies: plan?.moduleDependencies.get(id) ?? Object.freeze([]),
					dependents: plan?.moduleDependents.get(id) ?? Object.freeze([]),
					waitingFor: plan?.waiting.get(id) ?? Object.freeze([]),
					leakedGenerations: Object.freeze(
						(this.#leaks.get(id) ?? []).map(({ id: generationId }) => generationId)
					)
				})
			);
		}
		modules.sort((left, right) => left.id.localeCompare(right.id));

		const active = [...this.#registry.values()];
		const leaked = [...this.#leaks.values()].flatMap((generations) =>
			generations.flatMap(({ instances }) => [...instances.values()])
		);
		const providers = [...active, ...leaked]
			.map((instance): ProviderSnapshot =>
				Object.freeze({
					id: instance.node.definition.token.id,
					moduleId: instance.node.module.definition.id,
					generation: instance.generation.id,
					source: instance.node.definition.source,
					state: instance.state,
					dependencies: Object.freeze(
						Object.values(instance.node.definition.dependencies).map(({ id }) => id)
					),
					dependents: plan?.dependents.get(instance.node.definition.token.id) ?? Object.freeze([]),
					createdAt: instance.createdAt,
					...(instance.activatedAt ? { activatedAt: instance.activatedAt } : {}),
					...(instance.health ? { health: instance.health } : {}),
					...(instance.error ? { error: serializeError(instance.error) } : {})
				})
			)
			.sort(
				(left, right) =>
					left.id.localeCompare(right.id) || left.generation.localeCompare(right.generation)
			);

		return Object.freeze({
			instanceId: this.instanceId,
			state: this.#state,
			modules: Object.freeze(modules),
			providers: Object.freeze(providers)
		});
	}

	#emit(type: ContainerEvent['type'], error?: unknown): void {
		const event: ContainerEvent = Object.freeze({
			type,
			timestamp: Date.now(),
			snapshot: this.#snapshot(),
			...(error === undefined ? {} : { error: serializeError(error) })
		});
		for (const listener of this.#listeners) {
			try {
				listener(event);
			} catch {
				// Diagnostics observers must not change a committed lifecycle transaction.
			}
		}
	}

	#assertRunning(): void {
		if (this.#state === 'disposed') throw new ContainerError('Service container is disposed.');
	}

	#enqueue<T>(operation: () => Promise<T>): Promise<T> {
		const next = this.#operation.then(operation, operation);
		this.#operation = next.catch(() => undefined);
		return next;
	}
}

function orderedGenerations(
	plan: ContainerPlan,
	generations: ReadonlyMap<string, ModuleGeneration>
): ModuleGeneration[] {
	const result: ModuleGeneration[] = [];
	const seen = new Set<string>();
	for (const providerId of plan.order) {
		const moduleId = plan.providers.get(providerId)?.module.definition.id;
		if (!moduleId || seen.has(moduleId)) continue;
		const generation = generations.get(moduleId);
		if (!generation) continue;
		seen.add(moduleId);
		result.push(generation);
	}
	for (const [moduleId, generation] of [...generations].sort(([left], [right]) =>
		left.localeCompare(right)
	)) {
		if (!seen.has(moduleId)) result.push(generation);
	}
	return result;
}

function sameRegistration(left: ModuleRegistration, right: ModuleRegistration): boolean {
	return (
		left.definition === right.definition &&
		Object.is(left.config, right.config) &&
		left.kind === right.kind &&
		left.version === right.version &&
		left.revision === right.revision
	);
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
	return left.length === right.length && left.every((value, index) => value === right[index]);
}

function aggregate(errors: readonly unknown[], message: string): unknown {
	const filtered = errors.filter((error) => error !== undefined);
	return filtered.length === 1 ? filtered[0] : new AggregateError(filtered, message);
}
