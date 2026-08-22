import type { ModuleKind } from './context.ts';
import type { ProviderDefinition } from './provider.ts';
import type { AnyServiceToken, ServiceOf } from './token.ts';

const pluginApiType: unique symbol = Symbol('zadmin.plugin.api');

export interface PluginType<Id extends string = string, Api = unknown> {
	readonly id: Id;
	readonly [pluginApiType]?: (value: Api) => Api;
}

export interface PluginTypeLike {
	readonly id: string;
}

export type PluginApi<Plugin extends PluginTypeLike> =
	Plugin extends PluginType<string, infer Api> ? Api : never;

export interface ServiceModuleDefinition<
	Id extends string = string,
	Primary extends AnyServiceToken | undefined = AnyServiceToken | undefined,
	Config = unknown
> {
	readonly id: Id;
	readonly primary: Primary;
	readonly providers: readonly ProviderDefinition[];
	readonly exports: readonly AnyServiceToken[];
	readonly defaultConfig: Config;
}

export interface PluginDefinition<
	Id extends string = string,
	Primary extends AnyServiceToken = AnyServiceToken,
	Config = unknown
>
	extends ServiceModuleDefinition<Id, Primary, Config>, PluginType<Id, ServiceOf<Primary>> {
	readonly plugin: true;
	configure(config: Config): ConfiguredPlugin<this>;
}

export type AnyModuleDefinition = ServiceModuleDefinition<
	string,
	AnyServiceToken | undefined,
	unknown
>;
export type AnyPluginDefinition = PluginDefinition<string, AnyServiceToken, unknown>;

export interface ConfiguredModule<Definition extends AnyModuleDefinition = AnyModuleDefinition> {
	readonly definition: Definition;
	readonly config: Definition['defaultConfig'];
}

export interface ConfiguredPlugin<Definition extends AnyPluginDefinition = AnyPluginDefinition> {
	readonly plugin: Definition;
	readonly config: Definition['defaultConfig'];
}

export interface ModuleRegistration {
	readonly definition: AnyModuleDefinition;
	readonly config: unknown;
	readonly kind: ModuleKind;
	readonly version: string;
	readonly revision: string;
}

export function defineModule<
	const Id extends string,
	const Primary extends AnyServiceToken | undefined = undefined,
	Config = undefined
>(definition: {
	readonly id: Id;
	readonly primary?: Primary;
	readonly providers: readonly ProviderDefinition[];
	readonly exports?: readonly AnyServiceToken[];
	readonly config?: Config;
}): ServiceModuleDefinition<Id, Primary, Config> {
	const primary = definition.primary as Primary;
	const exported = new Map<string, AnyServiceToken>();
	if (primary) exported.set(primary.id, primary);
	for (const serviceToken of definition.exports ?? []) exported.set(serviceToken.id, serviceToken);
	return Object.freeze({
		id: definition.id,
		primary,
		providers: Object.freeze([...definition.providers]),
		exports: Object.freeze([...exported.values()]),
		defaultConfig: definition.config as Config
	});
}

export function definePlugin<
	const Id extends string,
	const Primary extends AnyServiceToken,
	Config = undefined
>(definition: {
	readonly id: Id;
	readonly primary: Primary;
	readonly providers: readonly ProviderDefinition[];
	readonly config?: Config;
}): PluginDefinition<Id, Primary, Config> {
	const module = defineModule({
		id: definition.id,
		primary: definition.primary,
		providers: definition.providers,
		exports: [definition.primary],
		config: definition.config as Config
	});
	if (module.primary?.id !== module.id) {
		throw new TypeError(`Plugin primary token "${module.primary?.id}" must match "${module.id}".`);
	}
	const plugin: PluginDefinition<Id, Primary, Config> = {
		...module,
		plugin: true,
		configure(config: Config) {
			return Object.freeze({ plugin: this, config }) as ConfiguredPlugin<typeof this>;
		}
	};
	return Object.freeze(plugin);
}
