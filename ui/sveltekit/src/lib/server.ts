import type { Handle } from '@sveltejs/kit';
import type { PluginRouteRegistry } from './routes.js';

export {
	PluginRouteRegistry,
	type PluginRoute,
	type RegisteredRoute,
	type RouteMethod,
	type RouteRequest
} from './routes.js';

export function createPluginRouteHandle(routes: PluginRouteRegistry): Handle {
	return async ({ event, resolve }) => (await routes.handle(event.request)) ?? resolve(event);
}
