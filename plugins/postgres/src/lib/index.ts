import { definePlugin } from '@zadmin/core';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const postgresPlugin = definePlugin({
	id: 'postgres',
	dependencies: { sveltekit: sveltekitPlugin },
	setup(_context, { sveltekit }) {
		return { driver: 'postgres', framework: sveltekit.framework } as const;
	}
});
