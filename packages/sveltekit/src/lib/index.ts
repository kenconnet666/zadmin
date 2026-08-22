import { definePlugin } from '@zadmin/core';
import { PluginRouteRegistry } from './routes.ts';

export * from './routes.ts';

export const sveltekitPlugin = definePlugin({
	id: '@zadmin/sveltekit',
	setup() {
		return {
			framework: 'sveltekit' as const,
			routes: new PluginRouteRegistry()
		};
	}
});
