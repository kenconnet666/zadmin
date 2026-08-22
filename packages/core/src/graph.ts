import { DuplicatePluginError, PluginCycleError } from './errors.ts';
import type { AnyPluginDefinition, AppDefinition, ConfiguredPlugin, PluginUse } from './types.ts';

export interface NormalizedPlugin {
	definition: AnyPluginDefinition;
	config: unknown;
}

export interface PluginGraph {
	readonly plugins: ReadonlyMap<string, NormalizedPlugin>;
	readonly dependencies: ReadonlyMap<string, readonly string[]>;
	readonly dependents: ReadonlyMap<string, readonly string[]>;
	readonly order: readonly string[];
}

function isConfiguredPlugin(use: PluginUse): use is ConfiguredPlugin {
	return 'plugin' in use;
}

export function createPluginGraph(app: AppDefinition): PluginGraph {
	const plugins = new Map<string, NormalizedPlugin>();
	for (const use of app.plugins) {
		const definition = isConfiguredPlugin(use) ? use.plugin : use;
		if (plugins.has(definition.id)) throw new DuplicatePluginError(definition.id);
		plugins.set(definition.id, {
			definition,
			config: isConfiguredPlugin(use) ? use.config : definition.defaultConfig
		});
	}

	const dependencies = new Map<string, readonly string[]>();
	const mutableDependents = new Map<string, string[]>();
	for (const [id, plugin] of plugins) {
		const ids = Object.values(plugin.definition.dependencies)
			.map((dependency) => dependency.id)
			.filter((dependencyId) => plugins.has(dependencyId));
		dependencies.set(id, Object.freeze(ids));
		for (const dependencyId of ids) {
			if (!plugins.has(dependencyId)) continue;
			const dependents = mutableDependents.get(dependencyId) ?? [];
			dependents.push(id);
			mutableDependents.set(dependencyId, dependents);
		}
	}

	const visiting = new Set<string>();
	const visited = new Set<string>();
	const stack: string[] = [];
	const order: string[] = [];

	const visit = (id: string): void => {
		if (visited.has(id)) return;
		if (visiting.has(id)) {
			const start = stack.indexOf(id);
			throw new PluginCycleError([...stack.slice(start), id]);
		}

		visiting.add(id);
		stack.push(id);
		for (const dependencyId of dependencies.get(id) ?? []) {
			if (plugins.has(dependencyId)) visit(dependencyId);
		}
		stack.pop();
		visiting.delete(id);
		visited.add(id);
		order.push(id);
	};

	for (const id of plugins.keys()) visit(id);

	const dependents = new Map<string, readonly string[]>();
	for (const id of plugins.keys()) {
		dependents.set(id, Object.freeze([...(mutableDependents.get(id) ?? [])]));
	}

	return {
		plugins,
		dependencies,
		dependents,
		order: Object.freeze(order)
	};
}

export function collectDependents(graph: PluginGraph, roots: Iterable<string>): Set<string> {
	const result = new Set<string>();
	const visit = (id: string): void => {
		if (result.has(id)) return;
		result.add(id);
		for (const dependent of graph.dependents.get(id) ?? []) visit(dependent);
	};
	for (const root of roots) visit(root);
	return result;
}
