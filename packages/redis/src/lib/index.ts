import { definePlugin } from '@zadmin/core';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const redisPlugin = definePlugin({
	id: 'redis',
	dependencies: { sveltekit: sveltekitPlugin },
	setup(_context, { sveltekit }) {
		return { driver: 'redis', framework: sveltekit.framework } as const;
	}
});
