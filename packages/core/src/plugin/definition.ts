import type {
	AnyPluginDefinition,
	ConfiguredPlugin,
	ModuleRegistration
} from '../container/module.ts';

export interface LoadedPlugin<Plugin extends AnyPluginDefinition = AnyPluginDefinition> {
	readonly plugin: Plugin;
	readonly config: Plugin['defaultConfig'];
	readonly version: string;
	readonly artifactRevision: string;
}

export type PluginUse = AnyPluginDefinition | ConfiguredPlugin | LoadedPlugin;

export interface AppDefinition<Id extends string = string> {
	readonly id: Id;
	readonly plugins: readonly PluginUse[];
}

export function defineApp<const Id extends string>(definition: {
	readonly id: Id;
	readonly plugins: readonly PluginUse[];
}): AppDefinition<Id> {
	return Object.freeze({
		id: definition.id,
		plugins: Object.freeze([...definition.plugins])
	});
}

export function pluginDefinition(use: PluginUse): AnyPluginDefinition {
	return use.plugin === true ? use : use.plugin;
}

export function pluginRegistration(use: PluginUse, revisionSuffix = ''): ModuleRegistration {
	const definition = pluginDefinition(use);
	const configured = use.plugin === true ? undefined : use;
	const loaded = isLoadedPlugin(use) ? use : undefined;
	const revision = loaded?.artifactRevision ?? `local:${definition.id}`;
	return Object.freeze({
		definition,
		config: configured?.config ?? definition.defaultConfig,
		kind: 'plugin' as const,
		version: loaded?.version ?? definition.version,
		revision: revisionSuffix ? `${revision}:${revisionSuffix}` : revision
	});
}

function isLoadedPlugin(use: PluginUse): use is LoadedPlugin {
	return (
		use.plugin !== true &&
		'artifactRevision' in use &&
		typeof use.artifactRevision === 'string' &&
		typeof use.version === 'string'
	);
}
