import { defineModule, provideFactory, token } from '@zadmin/core/di';
import { PluginRouteRegistry } from './routes.ts';

export * from './routes.ts';

export interface SvelteKitHost {
	readonly framework: 'sveltekit';
	readonly routes: PluginRouteRegistry;
}

export const SVELTEKIT = token<SvelteKitHost>('@zadmin/sveltekit');

export function createSvelteKitModule() {
	return defineModule({
		id: SVELTEKIT.id,
		primary: SVELTEKIT,
		exports: [SVELTEKIT],
		providers: [
			provideFactory({
				token: SVELTEKIT,
				create: createSvelteKitHost
			})
		]
	});
}

export const sveltekitModule = createSvelteKitModule();

export function createSvelteKitHost(): SvelteKitHost {
	return Object.freeze({
		framework: 'sveltekit',
		routes: new PluginRouteRegistry()
	});
}
