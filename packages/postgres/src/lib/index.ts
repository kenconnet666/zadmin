import { definePlugin, inject } from '@zadmin/core';

interface SvelteKit {
	readonly framework: 'sveltekit';
}

export const postgresPlugin = definePlugin({
	id: '@zadmin/postgres',
	dependencies: { sveltekit: inject<SvelteKit>('@zadmin/sveltekit') },
	setup(_context, { sveltekit }) {
		return { driver: 'postgres', framework: sveltekit.framework } as const;
	}
});
