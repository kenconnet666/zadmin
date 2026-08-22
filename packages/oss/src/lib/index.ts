import { definePlugin, inject } from '@zadmin/core';

interface SvelteKit {
	readonly framework: 'sveltekit';
}

export const ossPlugin = definePlugin({
	id: '@zadmin/oss',
	dependencies: { sveltekit: inject<SvelteKit>('@zadmin/sveltekit') },
	setup(_context, { sveltekit }) {
		return { protocol: 's3', framework: sveltekit.framework } as const;
	}
});
