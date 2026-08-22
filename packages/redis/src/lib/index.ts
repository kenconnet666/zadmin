import { definePlugin, inject } from '@zadmin/core';

interface SvelteKit {
	readonly framework: 'sveltekit';
}

export const redisPlugin = definePlugin({
	id: '@zadmin/redis',
	dependencies: { sveltekit: inject<SvelteKit>('@zadmin/sveltekit') },
	setup(_context, { sveltekit }) {
		return { driver: 'redis', framework: sveltekit.framework } as const;
	}
});
