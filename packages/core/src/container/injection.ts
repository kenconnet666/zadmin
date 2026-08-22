import type { PluginApi, PluginTypeLike } from './module.ts';
import { token, type AnyServiceToken, type ServiceOf, type ServiceToken } from './token.ts';

const injectionType: unique symbol = Symbol('zadmin.injection.type');

export type InjectionKind = 'plugin' | 'service';

export interface InjectionLike {
	readonly id: string;
	readonly kind: InjectionKind;
	readonly optional: boolean;
}

export interface Injection<
	T,
	Optional extends boolean = false,
	Kind extends InjectionKind = 'service'
> extends InjectionLike {
	readonly token: ServiceToken<T>;
	readonly optional: Optional;
	readonly kind: Kind;
	readonly [injectionType]?: (value: T) => T;
}

export type DependencyMap = Readonly<Record<string, InjectionLike>>;

export type ResolveInjection<Value> =
	Value extends Injection<infer Service, infer Optional, InjectionKind>
		? Optional extends true
			? Service | undefined
			: Service
		: never;

export type ResolveInjections<Dependencies extends DependencyMap> = {
	readonly [Key in keyof Dependencies]: ResolveInjection<Dependencies[Key]>;
};

export function inject<T>(id: string): Injection<T, false>;
export function inject<Token extends AnyServiceToken>(
	serviceToken: Token
): Injection<ServiceOf<Token>, false>;
export function inject<T>(idOrToken: string | ServiceToken<T>): Injection<T, false> {
	return createInjection(idOrToken, false, 'service');
}

export function injectOptional<T>(id: string): Injection<T, true>;
export function injectOptional<Token extends AnyServiceToken>(
	serviceToken: Token
): Injection<ServiceOf<Token>, true>;
export function injectOptional<T>(idOrToken: string | ServiceToken<T>): Injection<T, true> {
	return createInjection(idOrToken, true, 'service');
}

export function injectPlugin<Plugin extends PluginTypeLike>(
	id: Plugin['id']
): Injection<PluginApi<Plugin>, false, 'plugin'> {
	return createInjection<PluginApi<Plugin>, false, 'plugin'>(id, false, 'plugin');
}

export function injectOptionalPlugin<Plugin extends PluginTypeLike>(
	id: Plugin['id']
): Injection<PluginApi<Plugin>, true, 'plugin'> {
	return createInjection<PluginApi<Plugin>, true, 'plugin'>(id, true, 'plugin');
}

function createInjection<T, const Optional extends boolean, const Kind extends InjectionKind>(
	idOrToken: string | ServiceToken<T>,
	optional: Optional,
	kind: Kind
): Injection<T, Optional, Kind> {
	const serviceToken = typeof idOrToken === 'string' ? token<T>(idOrToken) : idOrToken;
	return Object.freeze({
		id: serviceToken.id,
		token: serviceToken,
		optional,
		kind
	}) as Injection<T, Optional, Kind>;
}
