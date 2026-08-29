import type { PluginRoute } from '../routes.js';
import type { JsonRouteFixtureOptions } from './types.js';

export function createJsonRouteFixture(options: JsonRouteFixtureOptions): PluginRoute {
	return Object.freeze({
		method: options.method,
		path: options.path,
		handler: () => Response.json(options.body ?? null, { status: options.status })
	});
}

export function createRouteRequest(
	path: string,
	init?: RequestInit,
	origin = 'https://zadmin.test'
): Request {
	return new Request(new URL(path, origin), init);
}
