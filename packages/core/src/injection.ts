const injectionType: unique symbol = Symbol('zadmin.injection.type');

export interface Injection<T, Optional extends boolean = false> {
	readonly id: string;
	readonly optional: Optional;
	readonly [injectionType]?: () => T;
}

export type AnyInjection = Injection<unknown, boolean>;

export function inject<T>(id: string): Injection<T, false> {
	return createInjection(id, false);
}

export function injectOptional<T>(id: string): Injection<T, true> {
	return createInjection(id, true);
}

function createInjection<T, const Optional extends boolean>(
	id: string,
	optional: Optional
): Injection<T, Optional> {
	if (!id.trim()) throw new TypeError('Injection id must not be empty.');
	return Object.freeze({ id, optional }) as Injection<T, Optional>;
}
