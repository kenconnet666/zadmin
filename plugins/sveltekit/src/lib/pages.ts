import type { Component } from 'svelte';

export interface PluginPageModule {
	readonly default: Component;
}

export interface PluginPageDefinition {
	readonly path: string;
	readonly load: () => Promise<PluginPageModule>;
}

export function definePluginPage(definition: PluginPageDefinition): PluginPageDefinition {
	if (!definition.path.startsWith('/')) {
		throw new Error(`Plugin page path must start with "/": ${definition.path}`);
	}
	return Object.freeze({ ...definition, path: normalizePagePath(definition.path) });
}

export function matchPluginPage(
	pages: readonly PluginPageDefinition[],
	pathname: string
): PluginPageDefinition | undefined {
	const normalized = normalizePagePath(pathname);
	return pages.find((page) => page.path === normalized);
}

function normalizePagePath(path: string): string {
	const normalized = path.replace(/\/{2,}/g, '/').replace(/\/$/, '');
	return normalized || '/';
}
