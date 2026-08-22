import type { AnyInjection, Injection } from './injection.ts';

export type MaybePromise<T> = T | Promise<T>;

export type PluginDisposer = () => MaybePromise<void>;

export interface PluginContext {
	readonly id: string;
	readonly signal: AbortSignal;

	onDispose(disposer: PluginDisposer): void;
	effect(setup: () => MaybePromise<void | PluginDisposer>): Promise<void>;
}

export type PluginDependencyMap = Readonly<Record<string, AnyInjection>>;

export type ResolveInjection<TInjection> =
	TInjection extends Injection<infer Value, infer Optional>
		? Optional extends true
			? Value | undefined
			: Value
		: never;

export type ResolveInjections<TDependencies extends PluginDependencyMap> = {
	readonly [Key in keyof TDependencies]: ResolveInjection<TDependencies[Key]>;
};

export type PluginApi<TPlugin> =
	TPlugin extends PluginDefinition<string, infer Api, unknown, PluginDependencyMap> ? Api : never;

export type PluginConfig<TPlugin> =
	TPlugin extends PluginDefinition<string, unknown, infer Config, PluginDependencyMap>
		? Config
		: never;

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
		dependencies: ResolveInjections<Dependencies>,
		config: Config
	): MaybePromise<Api>;

	configure(config: Config): ConfiguredPlugin<this>;
}

export type AnyPluginDefinition = PluginDefinition<string, unknown, unknown, PluginDependencyMap>;

export interface ConfiguredPlugin<TPlugin extends AnyPluginDefinition = AnyPluginDefinition> {
	readonly plugin: TPlugin;
	readonly config: PluginConfig<TPlugin>;
}

export interface LoadedPlugin<TPlugin extends AnyPluginDefinition = AnyPluginDefinition> {
	readonly plugin: TPlugin;
	readonly config: PluginConfig<TPlugin>;
	readonly version: string;
	readonly artifactRevision: string;
}

export type PluginUse = AnyPluginDefinition | ConfiguredPlugin | LoadedPlugin;

export interface AppDefinition<Id extends string = string> {
	readonly id: Id;
	readonly plugins: readonly PluginUse[];
}

export interface HostProvider<T> {
	readonly id: string;
	readonly version: string;
	readonly value: T;
}

export interface ProviderSnapshot {
	readonly id: string;
	readonly version: string;
	readonly owner: 'host' | string;
}

export type PluginState =
	'active' | 'failed' | 'registered' | 'starting' | 'stopped' | 'stopping' | 'waiting';

export interface PluginSnapshot {
	readonly id: string;
	readonly version: string;
	readonly artifactRevision?: string;
	readonly state: PluginState;
	readonly dependencies: readonly string[];
	readonly waitingFor: readonly string[];
	readonly revision: number;
	readonly error?: unknown;
}

export interface RuntimeSnapshot {
	readonly instanceId: string;
	readonly appId?: string;
	readonly providers: readonly ProviderSnapshot[];
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
