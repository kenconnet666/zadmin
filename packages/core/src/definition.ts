import type {
	AnyPluginDefinition,
	AppDefinition,
	ConfiguredPlugin,
	MaybePromise,
	PluginContext,
	PluginDefinition,
	PluginDependencyApis,
	PluginDependencyMap
} from './types.ts';

const EMPTY_DEPENDENCIES = Object.freeze({}) as PluginDependencyMap;

export function definePlugin<
	const Id extends string,
	const Dependencies extends PluginDependencyMap = Record<never, never>,
	Config = undefined,
	Api = void
>(definition: {
	readonly id: Id;
	readonly dependencies?: Dependencies;
	readonly config?: Config;
	readonly setup?: (
		context: PluginContext,
		dependencies: PluginDependencyApis<Dependencies>,
		config: Config
	) => MaybePromise<Api>;
}): PluginDefinition<Id, Api, Config, Dependencies> {
	const dependencies = Object.freeze({
		...(definition.dependencies ?? EMPTY_DEPENDENCIES)
	}) as Dependencies;
	const setup = definition.setup ?? (() => undefined as Api);

	const plugin: PluginDefinition<Id, Api, Config, Dependencies> = {
		id: definition.id,
		dependencies,
		defaultConfig: definition.config as Config,
		setup,
		configure(config: Config) {
			return Object.freeze({ plugin: this, config }) as ConfiguredPlugin<typeof this>;
		}
	};

	return Object.freeze(plugin);
}

export function defineApp<const Id extends string>(definition: {
	readonly id: Id;
	readonly plugins: readonly (AnyPluginDefinition | ConfiguredPlugin)[];
}): AppDefinition<Id> {
	return Object.freeze({
		id: definition.id,
		plugins: Object.freeze([...definition.plugins])
	});
}
