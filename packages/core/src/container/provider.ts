import type { DependencyMap, ResolveInjections } from './injection.ts';
import type { MaybePromise, ServiceContext } from './context.ts';
import type { AnyServiceToken, ServiceOf } from './token.ts';

const SERVICE_METADATA = Symbol.for('@zadmin/core/service-metadata');
const EMPTY_DEPENDENCIES = Object.freeze({}) as DependencyMap;

export type ServiceHealth =
	| { readonly status: 'healthy'; readonly message?: string }
	| { readonly status: 'degraded' | 'unhealthy'; readonly message: string };

export interface ManagedService {
	prepare?(context: ServiceContext): MaybePromise<void>;
	activate?(context: ServiceContext): MaybePromise<void>;
	deactivate?(context: ServiceContext): MaybePromise<void>;
	dispose?(context: ServiceContext): MaybePromise<void>;
	health?(context: ServiceContext): MaybePromise<ServiceHealth>;
}

export interface ProviderDefinition<
	Token extends AnyServiceToken = AnyServiceToken,
	Dependencies extends DependencyMap = DependencyMap
> {
	readonly token: Token;
	readonly dependencies: Dependencies;
	readonly source: 'class' | 'factory' | 'value';
	create(
		context: ServiceContext,
		dependencies: ResolveInjections<Dependencies>
	): MaybePromise<ServiceOf<Token>>;
	prepare?(value: ServiceOf<Token>, context: ServiceContext): MaybePromise<void>;
	activate?(value: ServiceOf<Token>, context: ServiceContext): MaybePromise<void>;
	deactivate?(value: ServiceOf<Token>, context: ServiceContext): MaybePromise<void>;
	dispose?(value: ServiceOf<Token>, context: ServiceContext): MaybePromise<void>;
	health?(value: ServiceOf<Token>, context: ServiceContext): MaybePromise<ServiceHealth>;
}

export interface FactoryProviderOptions<
	Token extends AnyServiceToken,
	Dependencies extends DependencyMap
> {
	readonly token: Token;
	readonly dependencies?: Dependencies;
	create(
		context: ServiceContext,
		dependencies: ResolveInjections<Dependencies>
	): MaybePromise<ServiceOf<Token>>;
	prepare?(value: ServiceOf<Token>, context: ServiceContext): MaybePromise<void>;
	activate?(value: ServiceOf<Token>, context: ServiceContext): MaybePromise<void>;
	deactivate?(value: ServiceOf<Token>, context: ServiceContext): MaybePromise<void>;
	dispose?(value: ServiceOf<Token>, context: ServiceContext): MaybePromise<void>;
	health?(value: ServiceOf<Token>, context: ServiceContext): MaybePromise<ServiceHealth>;
}

export type ServiceConstructor<Value, Dependencies extends DependencyMap = DependencyMap> = new (
	dependencies: ResolveInjections<Dependencies>,
	context: ServiceContext
) => Value;

interface ServiceMetadata<
	Token extends AnyServiceToken = AnyServiceToken,
	Dependencies extends DependencyMap = DependencyMap
> {
	readonly token: Token;
	readonly dependencies: Dependencies;
}

type DecoratedServiceConstructor = ServiceConstructor<unknown> & {
	readonly [SERVICE_METADATA]?: ServiceMetadata;
};

type AnyConstructor = new (...arguments_: never[]) => unknown;

export function provideValue<Token extends AnyServiceToken>(
	serviceToken: Token,
	value: ServiceOf<Token>
): ProviderDefinition<Token, Record<never, never>> {
	return Object.freeze({
		token: serviceToken,
		dependencies: Object.freeze({}),
		source: 'value' as const,
		create: () => value
	});
}

export function provideFactory<
	Token extends AnyServiceToken,
	const Dependencies extends DependencyMap = Record<never, never>
>(options: FactoryProviderOptions<Token, Dependencies>): ProviderDefinition<Token, Dependencies> {
	return freezeProvider({
		...options,
		dependencies: Object.freeze({
			...(options.dependencies ?? EMPTY_DEPENDENCIES)
		}) as Dependencies,
		source: 'factory'
	});
}

export function service<
	Token extends AnyServiceToken,
	const Dependencies extends DependencyMap = Record<never, never>
>(options: { readonly token: Token; readonly dependencies?: Dependencies }) {
	const metadata: ServiceMetadata<Token, Dependencies> = Object.freeze({
		token: options.token,
		dependencies: Object.freeze({ ...(options.dependencies ?? EMPTY_DEPENDENCIES) }) as Dependencies
	});

	return <Constructor extends ServiceConstructor<ServiceOf<Token>, Dependencies>>(
		target: Constructor,
		_context: ClassDecoratorContext<Constructor>
	): void => {
		Object.defineProperty(target, SERVICE_METADATA, {
			configurable: false,
			enumerable: false,
			value: metadata,
			writable: false
		});
	};
}

export function provideClass<Constructor extends AnyConstructor>(
	constructor: Constructor
): ProviderDefinition;
export function provideClass<
	Token extends AnyServiceToken,
	const Dependencies extends DependencyMap,
	Constructor extends ServiceConstructor<ServiceOf<Token>, Dependencies>
>(options: {
	readonly token: Token;
	readonly dependencies: Dependencies;
	readonly useClass: Constructor;
}): ProviderDefinition<Token, Dependencies>;
export function provideClass(
	input:
		| AnyConstructor
		| {
				readonly token: AnyServiceToken;
				readonly dependencies: DependencyMap;
				readonly useClass: ServiceConstructor<unknown>;
		  }
): ProviderDefinition {
	let metadata: ServiceMetadata;
	let constructor: ServiceConstructor<unknown>;
	if (typeof input === 'function') {
		constructor = input as unknown as ServiceConstructor<unknown>;
		const decorated = (input as unknown as DecoratedServiceConstructor)[SERVICE_METADATA];
		if (!decorated) {
			throw new TypeError(
				`Class "${input.name || '<anonymous>'}" must use @service() or an explicit provideClass definition.`
			);
		}
		metadata = decorated;
	} else {
		constructor = input.useClass;
		metadata = Object.freeze({
			token: input.token,
			dependencies: Object.freeze({ ...input.dependencies })
		});
	}

	return freezeProvider({
		token: metadata.token,
		dependencies: metadata.dependencies,
		source: 'class',
		create(context, dependencies) {
			return new constructor(dependencies, context);
		},
		prepare: callLifecycle('prepare'),
		activate: callLifecycle('activate'),
		deactivate: callLifecycle('deactivate'),
		dispose: callLifecycle('dispose'),
		health(value, context) {
			const service = value as ManagedService;
			return service.health?.(context) ?? { status: 'healthy' };
		}
	});
}

function callLifecycle(method: 'activate' | 'deactivate' | 'dispose' | 'prepare') {
	return (value: unknown, context: ServiceContext): MaybePromise<void> => {
		const service = value as ManagedService;
		return service[method]?.(context);
	};
}

function freezeProvider<Token extends AnyServiceToken, Dependencies extends DependencyMap>(
	definition: ProviderDefinition<Token, Dependencies>
): ProviderDefinition<Token, Dependencies> {
	return Object.freeze(definition);
}
