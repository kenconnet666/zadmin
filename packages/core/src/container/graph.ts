import {
	ContainerError,
	DuplicateModuleError,
	DuplicateServiceError,
	HostDependsOnPluginError,
	ServiceCycleError,
	ServiceNamespaceError,
	ServiceVisibilityError
} from './errors.ts';
import type { InjectionLike } from './injection.ts';
import type { ModuleRegistration } from './module.ts';
import type { ProviderDefinition } from './provider.ts';

export interface ProviderNode {
	readonly definition: ProviderDefinition;
	readonly module: ModuleRegistration;
}

export interface ContainerPlan {
	readonly modules: ReadonlyMap<string, ModuleRegistration>;
	readonly providers: ReadonlyMap<string, ProviderNode>;
	readonly dependencies: ReadonlyMap<string, readonly string[]>;
	readonly dependents: ReadonlyMap<string, readonly string[]>;
	readonly order: readonly string[];
	readonly moduleDependencies: ReadonlyMap<string, readonly string[]>;
	readonly moduleDependents: ReadonlyMap<string, readonly string[]>;
	readonly waiting: ReadonlyMap<string, readonly string[]>;
}

export function createContainerPlan(registrations: readonly ModuleRegistration[]): ContainerPlan {
	const modules = new Map<string, ModuleRegistration>();
	const providers = new Map<string, ProviderNode>();

	for (const registration of registrations) {
		const id = registration.definition.id;
		if (modules.has(id)) throw new DuplicateModuleError(id);
		modules.set(id, registration);
		for (const definition of registration.definition.providers) {
			assertNamespace(id, definition.token.id);
			const existing = providers.get(definition.token.id);
			if (existing) {
				throw new DuplicateServiceError(definition.token.id, existing.module.definition.id, id);
			}
			providers.set(definition.token.id, { definition, module: registration });
		}
	}

	for (const registration of registrations) validateExports(registration, providers);

	const mutableDependencies = new Map<string, string[]>();
	const mutableDependents = new Map<string, string[]>();
	const mutableModuleDependencies = new Map<string, Set<string>>();
	const mutableModuleDependents = new Map<string, Set<string>>();
	const mutableWaiting = new Map<string, Set<string>>();

	for (const [id, provider] of providers) {
		const dependencies: string[] = [];
		for (const injection of Object.values(provider.definition.dependencies)) {
			const target = providers.get(injection.id);
			if (!target) {
				if (!injection.optional)
					addSet(mutableWaiting, provider.module.definition.id, injection.id);
				continue;
			}
			validateAccess(provider, target, injection);
			dependencies.push(injection.id);
			addArray(mutableDependents, injection.id, id);

			const consumerModule = provider.module.definition.id;
			const targetModule = target.module.definition.id;
			if (consumerModule !== targetModule) {
				addSet(mutableModuleDependencies, consumerModule, targetModule);
				addSet(mutableModuleDependents, targetModule, consumerModule);
			}
		}
		mutableDependencies.set(id, dependencies);
	}

	const order = topologicalOrder(providers.keys(), mutableDependencies);
	propagateWaiting(providers, mutableWaiting);

	return Object.freeze({
		modules,
		providers,
		dependencies: freezeArrays(mutableDependencies, providers.keys()),
		dependents: freezeArrays(mutableDependents, providers.keys()),
		order: Object.freeze(order),
		moduleDependencies: freezeSets(mutableModuleDependencies, modules.keys()),
		moduleDependents: freezeSets(mutableModuleDependents, modules.keys()),
		waiting: freezeSets(mutableWaiting, modules.keys())
	});
}

export function collectModuleDependents(
	plan: ContainerPlan | undefined,
	roots: Iterable<string>
): Set<string> {
	const result = new Set<string>();
	const visit = (id: string): void => {
		if (result.has(id)) return;
		result.add(id);
		for (const dependent of plan?.moduleDependents.get(id) ?? []) visit(dependent);
	};
	for (const root of roots) visit(root);
	return result;
}

function validateExports(
	registration: ModuleRegistration,
	providers: ReadonlyMap<string, ProviderNode>
): void {
	const providerIds = new Set(registration.definition.providers.map(({ token }) => token.id));
	for (const serviceToken of registration.definition.exports) {
		if (!providerIds.has(serviceToken.id)) {
			throw new ContainerError(
				`Module "${registration.definition.id}" exports unknown service "${serviceToken.id}".`
			);
		}
	}
	const primary = registration.definition.primary;
	if (primary && !providers.has(primary.id)) {
		throw new ContainerError(
			`Module "${registration.definition.id}" primary service "${primary.id}" is not provided.`
		);
	}
}

function validateAccess(
	consumer: ProviderNode,
	target: ProviderNode,
	injection: InjectionLike
): void {
	const consumerModule = consumer.module.definition.id;
	const targetModule = target.module.definition.id;
	if (consumerModule === targetModule) return;

	if (consumer.module.kind === 'host' && target.module.kind === 'plugin') {
		throw new HostDependsOnPluginError(consumerModule, targetModule);
	}
	const exported = target.module.definition.exports.some(({ id }) => id === injection.id);
	if (!exported) throw new ServiceVisibilityError(consumerModule, injection.id, targetModule);
	if (
		injection.kind === 'plugin' &&
		(target.module.kind !== 'plugin' || target.module.definition.primary?.id !== injection.id)
	) {
		throw new ContainerError(
			`Plugin injection "${injection.id}" must target a dynamic plugin primary service.`
		);
	}
}

function assertNamespace(moduleId: string, serviceId: string): void {
	if (serviceId !== moduleId && !serviceId.startsWith(`${moduleId}/`)) {
		throw new ServiceNamespaceError(moduleId, serviceId);
	}
}

function topologicalOrder(
	ids: Iterable<string>,
	dependencies: ReadonlyMap<string, readonly string[]>
): string[] {
	const visiting = new Set<string>();
	const visited = new Set<string>();
	const stack: string[] = [];
	const order: string[] = [];

	const visit = (id: string): void => {
		if (visited.has(id)) return;
		if (visiting.has(id)) {
			const start = stack.indexOf(id);
			throw new ServiceCycleError([...stack.slice(start), id]);
		}
		visiting.add(id);
		stack.push(id);
		for (const dependency of dependencies.get(id) ?? []) visit(dependency);
		stack.pop();
		visiting.delete(id);
		visited.add(id);
		order.push(id);
	};

	for (const id of ids) visit(id);
	return order;
}

function propagateWaiting(
	providers: ReadonlyMap<string, ProviderNode>,
	waiting: Map<string, Set<string>>
): void {
	let changed = true;
	while (changed) {
		changed = false;
		for (const provider of providers.values()) {
			const consumerId = provider.module.definition.id;
			for (const injection of Object.values(provider.definition.dependencies)) {
				if (injection.optional) continue;
				const target = providers.get(injection.id);
				if (!target || !waiting.get(target.module.definition.id)?.size) continue;
				const before = waiting.get(consumerId)?.size ?? 0;
				addSet(waiting, consumerId, injection.id);
				if ((waiting.get(consumerId)?.size ?? 0) !== before) changed = true;
			}
		}
	}
}

function addArray<T>(map: Map<string, T[]>, key: string, value: T): void {
	const values = map.get(key);
	if (values) values.push(value);
	else map.set(key, [value]);
}

function addSet<T>(map: Map<string, Set<T>>, key: string, value: T): void {
	const values = map.get(key);
	if (values) values.add(value);
	else map.set(key, new Set([value]));
}

function freezeArrays(
	values: ReadonlyMap<string, readonly string[]>,
	keys: Iterable<string>
): ReadonlyMap<string, readonly string[]> {
	const result = new Map<string, readonly string[]>();
	for (const key of keys) result.set(key, Object.freeze([...(values.get(key) ?? [])]));
	return result;
}

function freezeSets(
	values: ReadonlyMap<string, ReadonlySet<string>>,
	keys: Iterable<string>
): ReadonlyMap<string, readonly string[]> {
	const result = new Map<string, readonly string[]>();
	for (const key of keys) {
		result.set(key, Object.freeze([...(values.get(key) ?? [])].sort()));
	}
	return result;
}
