export type MaybePromise<T> = T | Promise<T>;

export type PluginDisposer = () => MaybePromise<void>;

export interface PluginContext {
	readonly id: string;
	readonly signal: AbortSignal;

	onDispose(disposer: PluginDisposer): void;
	effect(setup: () => MaybePromise<void | PluginDisposer>): Promise<void>;
}

export type PluginDependencyMap = Readonly<Record<string, AnyPluginDefinition>>;

export type PluginApi<TPlugin> =
	TPlugin extends PluginDefinition<string, infer Api, unknown, PluginDependencyMap> ? Api : never;

export type PluginConfig<TPlugin> =
	TPlugin extends PluginDefinition<string, unknown, infer Config, PluginDependencyMap>
		? Config
		: never;

export type PluginDependencyApis<TDependencies extends PluginDependencyMap> = {
	readonly [Key in keyof TDependencies]: PluginApi<TDependencies[Key]>;
};

export interface PluginDefinition<
	Id extends string,
	Api,
	Config,
	Dependencies extends PluginDependencyMap
> {
	readonly id: Id;
	readonly dependencies: Dependencies;
	readonly defaultConfig: Config;
	setup(
		context: PluginContext,
		dependencies: PluginDependencyApis<Dependencies>,
		config: Config
	): MaybePromise<Api>;

	configure(config: Config): ConfiguredPlugin<this>;
}

export type AnyPluginDefinition = PluginDefinition<string, unknown, unknown, PluginDependencyMap>;

export interface ConfiguredPlugin<TPlugin extends AnyPluginDefinition = AnyPluginDefinition> {
	readonly plugin: TPlugin;
	readonly config: PluginConfig<TPlugin>;
}

export type PluginUse = AnyPluginDefinition | ConfiguredPlugin;

export interface AppDefinition<Id extends string = string> {
	readonly id: Id;
	readonly plugins: readonly PluginUse[];
}

export type PluginState =
	'registered' | 'waiting' | 'starting' | 'active' | 'stopping' | 'stopped' | 'failed';

export interface PluginSnapshot {
	readonly id: string;
	readonly state: PluginState;
	readonly dependencies: readonly string[];
	readonly waitingFor: readonly string[];
	readonly revision: number;
	readonly error?: unknown;
}

export interface RuntimeSnapshot {
	readonly instanceId: string;
	readonly appId?: string;
	readonly plugins: readonly PluginSnapshot[];
}

export interface LifecycleEvent {
	readonly pluginId: string;
	readonly previous: PluginState;
	readonly current: PluginState;
	readonly timestamp: number;
	readonly reason?: string;
	readonly error?: unknown;
}
