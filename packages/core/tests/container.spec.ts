import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { ServiceContainer } from '../src/container/container.ts';
import {
	ContainerError,
	HostDependsOnPluginError,
	LeakedGenerationError,
	ServiceCycleError,
	ServiceNamespaceError,
	ServiceVisibilityError
} from '../src/container/errors.ts';
import {
	inject,
	injectOptional,
	injectPlugin,
	type ResolveInjections
} from '../src/container/injection.ts';
import {
	defineModule,
	definePlugin,
	type ModuleRegistration,
	type PluginApi
} from '../src/container/module.ts';
import { provideClass, provideFactory, provideValue, service } from '../src/container/provider.ts';
import { token } from '../src/container/token.ts';

function registration(
	definition: ModuleRegistration['definition'],
	options: Partial<Omit<ModuleRegistration, 'definition'>> = {}
): ModuleRegistration {
	return Object.freeze({
		definition,
		config: undefined,
		kind: 'host',
		version: '1.0.0',
		revision: 'one',
		...options
	});
}

describe('ServiceContainer', () => {
	it('infers plugin API types without importing a runtime plugin value', () => {
		interface UpstreamApi {
			load(id: string): Promise<string>;
		}
		const upstreamToken = token<UpstreamApi>('@test/upstream');
		const upstream = definePlugin({
			id: '@test/upstream',
			primary: upstreamToken,
			providers: [
				provideValue(upstreamToken, {
					async load(id) {
						return id;
					}
				})
			]
		});
		const dependencies = {
			upstream: injectPlugin<typeof upstream>('@test/upstream')
		} as const;

		expectTypeOf<PluginApi<typeof upstream>>().toEqualTypeOf<UpstreamApi>();
		expectTypeOf<ResolveInjections<typeof dependencies>>().toEqualTypeOf<{
			readonly upstream: UpstreamApi;
		}>();
		expect(dependencies.upstream.kind).toBe('plugin');
	});

	it('constructs, activates and disposes services in dependency order', async () => {
		const events: string[] = [];
		const databaseToken = token<{ readonly name: string }>('@test/database');
		const serviceToken = token<{ readonly database: string }>('@test/service');
		const database = defineModule({
			id: '@test/database',
			primary: databaseToken,
			exports: [databaseToken],
			providers: [
				provideFactory({
					token: databaseToken,
					create() {
						events.push('database:create');
						return { name: 'main' };
					},
					prepare() {
						events.push('database:prepare');
					},
					activate() {
						events.push('database:activate');
					},
					deactivate() {
						events.push('database:deactivate');
					},
					dispose() {
						events.push('database:dispose');
					}
				})
			]
		});
		const dependencies = { database: inject(databaseToken) } as const;
		const serviceModule = defineModule({
			id: '@test/service',
			primary: serviceToken,
			exports: [serviceToken],
			providers: [
				provideFactory({
					token: serviceToken,
					dependencies,
					create(context, services) {
						events.push('service:create');
						context.onActivate(() => {
							events.push('service:scope-activate');
							return () => {
								events.push('service:scope-deactivate');
							};
						});
						return { database: services.database.name };
					},
					activate() {
						events.push('service:activate');
					},
					deactivate() {
						events.push('service:deactivate');
					},
					dispose() {
						events.push('service:dispose');
					}
				})
			]
		});

		const container = new ServiceContainer();
		await container.reconcile([registration(database), registration(serviceModule)]);

		expect(container.resolve(serviceToken)).toEqual({ database: 'main' });
		expect(events).toEqual([
			'database:create',
			'database:prepare',
			'service:create',
			'database:activate',
			'service:activate',
			'service:scope-activate'
		]);

		await container.dispose();
		expect(events.slice(-5)).toEqual([
			'service:scope-deactivate',
			'service:deactivate',
			'database:deactivate',
			'service:dispose',
			'database:dispose'
		]);
	});

	it('supports standard class decorators without reflection or global registration', async () => {
		const dependencyToken = token<{ readonly value: number }>('@test/decorated/dependency');
		const decoratedToken = token<{ readonly answer: number }>('@test/decorated');
		const dependencies = { dependency: inject(dependencyToken) } as const;

		@service({ token: decoratedToken, dependencies })
		class DecoratedService {
			readonly answer: number;

			constructor(services: ResolveInjections<typeof dependencies>) {
				this.answer = services.dependency.value;
			}
		}

		const module = defineModule({
			id: '@test/decorated',
			primary: decoratedToken,
			exports: [decoratedToken],
			providers: [provideValue(dependencyToken, { value: 42 }), provideClass(DecoratedService)]
		});
		const container = new ServiceContainer();
		await container.reconcile([registration(module)]);
		expect(container.resolve(decoratedToken).answer).toBe(42);
		await container.dispose();
	});

	it('allows mutual module dependencies when the provider graph is acyclic', async () => {
		const a = token<{ readonly value: string }>('@test/a');
		const aConsumer = token<{ readonly value: string }>('@test/a/consumer');
		const b = token<{ readonly value: string }>('@test/b');
		const moduleA = defineModule({
			id: '@test/a',
			primary: a,
			exports: [a, aConsumer],
			providers: [
				provideValue(a, { value: 'a' }),
				provideFactory({
					token: aConsumer,
					dependencies: { b: inject(b) },
					create: (_context, { b: serviceB }) => ({ value: `${serviceB.value}:a` })
				})
			]
		});
		const moduleB = defineModule({
			id: '@test/b',
			primary: b,
			exports: [b],
			providers: [
				provideFactory({
					token: b,
					dependencies: { a: inject(a) },
					create: (_context, { a: serviceA }) => ({ value: `${serviceA.value}:b` })
				})
			]
		});
		const container = new ServiceContainer();
		await container.reconcile([registration(moduleA), registration(moduleB)]);
		expect(container.resolve(aConsumer).value).toBe('a:b:a');
		await container.dispose();
	});

	it('waits for missing required services and restarts when they appear', async () => {
		const required = token<{ readonly value: number }>('@test/required');
		const consumer = token<{ readonly value: number }>('@test/consumer');
		const consumerModule = defineModule({
			id: '@test/consumer',
			primary: consumer,
			providers: [
				provideFactory({
					token: consumer,
					dependencies: { required: inject(required) },
					create: (_context, { required: value }) => value
				})
			]
		});
		const container = new ServiceContainer();
		await container.reconcile([registration(consumerModule)]);
		expect(container.snapshot.modules[0]).toMatchObject({
			id: '@test/consumer',
			state: 'waiting',
			waitingFor: ['@test/required']
		});

		const requiredModule = defineModule({
			id: '@test/required',
			primary: required,
			exports: [required],
			providers: [provideValue(required, { value: 7 })]
		});
		await container.reconcile([registration(consumerModule), registration(requiredModule)]);
		expect(container.resolve(consumer).value).toBe(7);
		await container.dispose();
	});

	it('injects undefined for optional services', async () => {
		const optional = token<{ readonly value: number }>('@test/optional');
		const consumer = token<{ readonly optional: number | undefined }>('@test/optional-consumer');
		const module = defineModule({
			id: '@test/optional-consumer',
			primary: consumer,
			providers: [
				provideFactory({
					token: consumer,
					dependencies: { optional: injectOptional(optional) },
					create: (_context, { optional: value }) => ({ optional: value?.value })
				})
			]
		});
		const container = new ServiceContainer();
		await container.reconcile([registration(module)]);
		expect(container.resolve(consumer)).toEqual({ optional: undefined });
		await container.dispose();
	});

	it('replaces changed generations and all dependents without touching unrelated modules', async () => {
		const upstream = token<{ readonly revision: number }>('@test/reload-upstream');
		const downstream = token<{ readonly upstream: object }>('@test/reload-downstream');
		const unrelated = token<object>('@test/reload-unrelated');
		const makeUpstream = (revision: number) =>
			defineModule({
				id: '@test/reload-upstream',
				primary: upstream,
				exports: [upstream],
				providers: [provideValue(upstream, Object.freeze({ revision }))]
			});
		const downstreamModule = defineModule({
			id: '@test/reload-downstream',
			primary: downstream,
			providers: [
				provideFactory({
					token: downstream,
					dependencies: { upstream: inject(upstream) },
					create: (_context, services) => ({ upstream: services.upstream })
				})
			]
		});
		const unrelatedValue = Object.freeze({});
		const unrelatedModule = defineModule({
			id: '@test/reload-unrelated',
			primary: unrelated,
			providers: [provideValue(unrelated, unrelatedValue)]
		});
		const container = new ServiceContainer();
		await container.reconcile([
			registration(makeUpstream(1)),
			registration(downstreamModule),
			registration(unrelatedModule)
		]);
		const downstreamV1 = container.resolve(downstream);
		const unrelatedV1 = container.resolve(unrelated);

		await container.reconcile([
			registration(makeUpstream(2), { revision: 'two' }),
			registration(downstreamModule),
			registration(unrelatedModule)
		]);

		const downstreamV2 = container.resolve(downstream);
		expect(downstreamV2).not.toBe(downstreamV1);
		expect(downstreamV2.upstream).toEqual({ revision: 2 });
		expect(container.resolve(unrelated)).toBe(unrelatedV1);
		await container.dispose();
	});

	it('keeps the active generation when candidate preparation fails', async () => {
		const api = token<{ readonly revision: number }>('@test/prepare-rollback');
		const stable = defineModule({
			id: '@test/prepare-rollback',
			primary: api,
			providers: [provideValue(api, Object.freeze({ revision: 1 }))]
		});
		const broken = defineModule({
			id: '@test/prepare-rollback',
			primary: api,
			providers: [
				provideFactory({
					token: api,
					create: () => ({ revision: 2 }),
					prepare: () => {
						throw new Error('prepare failed');
					}
				})
			]
		});
		const container = new ServiceContainer();
		await container.reconcile([registration(stable)]);
		const active = container.resolve(api);
		await expect(container.reconcile([registration(broken, { revision: 'two' })])).rejects.toThrow(
			'Failed to prepare service'
		);
		expect(container.resolve(api)).toBe(active);
		expect(container.snapshot.state).toBe('active');
		await container.dispose();
	});

	it('rolls back to the previous generation when candidate activation fails', async () => {
		const events: string[] = [];
		const api = token<{ readonly revision: number }>('@test/activate-rollback');
		const module = (revision: number, fail = false) =>
			defineModule({
				id: '@test/activate-rollback',
				primary: api,
				providers: [
					provideFactory({
						token: api,
						create: () => ({ revision }),
						activate() {
							events.push(`${revision}:activate`);
							if (fail) throw new Error('activate failed');
						},
						deactivate() {
							events.push(`${revision}:deactivate`);
						}
					})
				]
			});
		const container = new ServiceContainer();
		await container.reconcile([registration(module(1))]);
		const active = container.resolve(api);
		await expect(
			container.reconcile([registration(module(2, true), { revision: 'two' })])
		).rejects.toThrow('Failed to activate service');
		expect(container.resolve(api)).toBe(active);
		expect(events).toEqual([
			'1:activate',
			'1:deactivate',
			'2:activate',
			'2:deactivate',
			'1:activate'
		]);
		await container.dispose();
	});

	it('marks failed cleanup as leaked and blocks another replacement', async () => {
		const api = token<{ readonly revision: number }>('@test/leak');
		const module = (revision: number, leak = false) =>
			defineModule({
				id: '@test/leak',
				primary: api,
				providers: [
					provideFactory({
						token: api,
						create: () => ({ revision }),
						dispose() {
							if (leak) throw new Error('cannot close');
						}
					})
				]
			});
		const container = new ServiceContainer();
		await container.reconcile([registration(module(1, true))]);
		await container.reconcile([registration(module(2), { revision: 'two' })]);

		expect(container.resolve(api).revision).toBe(2);
		expect(container.snapshot.state).toBe('degraded');
		expect(container.snapshot.modules[0]?.leakedGenerations).toHaveLength(1);
		await expect(
			container.reconcile([registration(module(3), { revision: 'three' })])
		).rejects.toBeInstanceOf(LeakedGenerationError);
	});

	it('rejects namespace, visibility, host-to-plugin and provider-cycle violations', async () => {
		const outside = token<object>('@other/service');
		const namespaceModule = defineModule({
			id: '@test/namespace',
			providers: [provideValue(outside, {})]
		});
		await expect(
			new ServiceContainer().reconcile([registration(namespaceModule)])
		).rejects.toBeInstanceOf(ServiceNamespaceError);

		const privateToken = token<object>('@test/private/internal');
		const privateModule = defineModule({
			id: '@test/private',
			providers: [provideValue(privateToken, {})]
		});
		const consumerToken = token<object>('@test/private-consumer');
		const consumerModule = defineModule({
			id: '@test/private-consumer',
			providers: [
				provideFactory({
					token: consumerToken,
					dependencies: { value: inject(privateToken) },
					create: (_context, { value }) => value
				})
			]
		});
		await expect(
			new ServiceContainer().reconcile([registration(privateModule), registration(consumerModule)])
		).rejects.toBeInstanceOf(ServiceVisibilityError);

		const pluginToken = token<object>('@test/dynamic');
		const plugin = definePlugin({
			id: '@test/dynamic',
			primary: pluginToken,
			providers: [provideValue(pluginToken, {})]
		});
		const hostToken = token<object>('@test/host');
		const host = defineModule({
			id: '@test/host',
			providers: [
				provideFactory({
					token: hostToken,
					dependencies: { plugin: inject(pluginToken) },
					create: (_context, { plugin: value }) => value
				})
			]
		});
		await expect(
			new ServiceContainer().reconcile([
				registration(plugin, { kind: 'plugin' }),
				registration(host)
			])
		).rejects.toBeInstanceOf(HostDependsOnPluginError);

		const left = token<object>('@test/cycle/left');
		const right = token<object>('@test/cycle/right');
		const cycle = defineModule({
			id: '@test/cycle',
			providers: [
				provideFactory({
					token: left,
					dependencies: { right: inject(right) },
					create: (_context, { right: value }) => value
				}),
				provideFactory({
					token: right,
					dependencies: { left: inject(left) },
					create: (_context, { left: value }) => value
				})
			]
		});
		await expect(new ServiceContainer().reconcile([registration(cycle)])).rejects.toBeInstanceOf(
			ServiceCycleError
		);
	});

	it('serializes concurrent reconciliations', async () => {
		const api = token<{ readonly revision: number }>('@test/serialized');
		const gate = Promise.withResolvers<void>();
		const firstPrepared = vi.fn();
		const first = defineModule({
			id: '@test/serialized',
			primary: api,
			providers: [
				provideFactory({
					token: api,
					create: () => ({ revision: 1 }),
					async prepare() {
						firstPrepared();
						await gate.promise;
					}
				})
			]
		});
		const second = defineModule({
			id: '@test/serialized',
			primary: api,
			providers: [provideValue(api, { revision: 2 })]
		});
		const container = new ServiceContainer();
		const firstReconcile = container.reconcile([registration(first)]);
		const secondReconcile = container.reconcile([registration(second, { revision: 'two' })]);
		await vi.waitFor(() => expect(firstPrepared).toHaveBeenCalledOnce());
		gate.resolve();
		await Promise.all([firstReconcile, secondReconcile]);
		expect(container.resolve(api).revision).toBe(2);
		await container.dispose();
	});
});
