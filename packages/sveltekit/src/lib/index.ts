import { PluginRouteRegistry } from './routes.ts';

export * from './routes.ts';

export interface SvelteKitHost {
	readonly framework: 'sveltekit';
	readonly routes: PluginRouteRegistry;
}

export function createSvelteKitHost(): SvelteKitHost {
	return Object.freeze({
		framework: 'sveltekit',
		routes: new PluginRouteRegistry()
	});
}
