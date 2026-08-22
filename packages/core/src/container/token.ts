const serviceType: unique symbol = Symbol('zadmin.service.type');

export interface ServiceToken<T> {
	readonly id: string;
	readonly [serviceType]?: (value: T) => T;
}

export interface AnyServiceToken {
	readonly id: string;
}

export type ServiceOf<Token extends AnyServiceToken> =
	Token extends ServiceToken<infer Value> ? Value : never;

export function token<T>(id: string): ServiceToken<T> {
	const normalized = id.trim();
	if (!normalized) throw new TypeError('Service token id must not be empty.');
	return Object.freeze({ id: normalized }) as ServiceToken<T>;
}
