import { describe, expect, it } from 'vitest';
import { PluginScope } from '@zadmin/core';
import { PluginRouteRegistry } from '../src/lib/routes.ts';

describe('PluginRouteRegistry', () => {
	it('matches static, parameter and wildcard routes by specificity', async () => {
		const registry = new PluginRouteRegistry();
		const scope = new PluginScope('auth');
		registry.register(scope, {
			path: '/auth/*rest',
			handler: ({ params }) => Response.json({ route: 'wildcard', rest: params.rest })
		});
		registry.register(scope, {
			path: '/auth/users/:id',
			handler: ({ params }) => Response.json({ route: 'user', id: params.id })
		});
		registry.register(scope, {
			path: '/auth/users/new',
			handler: () => Response.json({ route: 'new' })
		});
		await scope.activate();

		await expectJson(registry, '/auth/users/new', { route: 'new' });
		await expectJson(registry, '/auth/users/42', { route: 'user', id: '42' });
		await expectJson(registry, '/auth/settings/security', {
			route: 'wildcard',
			rest: 'settings/security'
		});
	});

	it('normalizes trailing slashes and supports HEAD through GET', async () => {
		const registry = new PluginRouteRegistry();
		const scope = new PluginScope('health');
		registry.register(scope, {
			path: '/health/',
			handler: ({ request }) => new Response(request.method)
		});
		await scope.activate();

		const response = await registry.handle(
			new Request('http://localhost/health/', { method: 'HEAD' })
		);

		expect(await response?.text()).toBe('HEAD');
	});

	it('removes every route owned by a disposed plugin scope', async () => {
		const registry = new PluginRouteRegistry();
		const scope = new PluginScope('auth');
		registry.register(scope, {
			path: '/auth',
			handler: () => new Response('auth')
		});
		await scope.activate();
		expect(registry.routes).toHaveLength(1);

		await scope.dispose();

		expect(registry.routes).toEqual([]);
		expect(await registry.handle(new Request('http://localhost/auth'))).toBeUndefined();
	});

	it('returns a disposer for routes owned by a static package', async () => {
		const registry = new PluginRouteRegistry();
		const dispose = registry.add('@zadmin/auth', {
			path: '/auth/status',
			handler: () => new Response('active')
		});

		expect(await registry.handle(new Request('http://localhost/auth/status'))).toBeInstanceOf(
			Response
		);
		dispose();
		expect(await registry.handle(new Request('http://localhost/auth/status'))).toBeUndefined();
	});

	it('rejects duplicate and malformed routes', () => {
		const registry = new PluginRouteRegistry();
		const scope = new PluginScope('auth');
		const route = { path: '/auth', handler: () => new Response('auth') };
		registry.register(scope, route);

		expect(() => registry.register(scope, route)).toThrow('already registered');
		expect(() =>
			registry.register(scope, { path: 'auth', handler: () => new Response('auth') })
		).toThrow('must start');
		expect(() =>
			registry.register(scope, { path: '/auth/*rest/more', handler: () => new Response('auth') })
		).toThrow('Wildcard must be the last');
	});
});

async function expectJson(
	registry: PluginRouteRegistry,
	path: string,
	expected: Record<string, string>
): Promise<void> {
	const response = await registry.handle(new Request(`http://localhost${path}`));
	expect(await response?.json()).toEqual(expected);
}
