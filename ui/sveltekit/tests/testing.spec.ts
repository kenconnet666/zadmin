import { describe, expect, it } from 'vitest';
import { createPluginRouteHandle } from '../src/lib/server.js';
import {
	createHandleFixture,
	createJsonRouteFixture,
	createRouteRequest,
	createSsrResolveFixture,
	createTestSvelteKitHost
} from '../src/lib/testing/index.js';

describe('@zadmin/sveltekit server and testing entries', () => {
	it('runs route fixtures through the server handle and real registry', async () => {
		const host = createTestSvelteKitHost();
		host.routes.add(
			'test',
			createJsonRouteFixture({ body: { ready: true }, path: '/health', status: 202 })
		);
		const resolve = createSsrResolveFixture({ html: '<p>fallback</p>', status: 404 });
		const handle = createPluginRouteHandle(host.routes);

		const matched = await handle(createHandleFixture(createRouteRequest('/health'), resolve));
		expect(matched.status).toBe(202);
		expect(await matched.json()).toEqual({ ready: true });

		const fallback = await handle(createHandleFixture(createRouteRequest('/missing'), resolve));
		expect(fallback.status).toBe(404);
		expect(await fallback.text()).toBe('<p>fallback</p>');
	});

	it('creates typed route requests with explicit method and origin', () => {
		const request = createRouteRequest('/items', { method: 'POST' }, 'https://fixture.test');
		expect(request.method).toBe('POST');
		expect(request.url).toBe('https://fixture.test/items');
	});
});
