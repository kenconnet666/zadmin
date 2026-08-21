import { definePlugin } from '@zadmin/core';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const redisPlugin = definePlugin({
	id: 'redis',
	dependencies: [sveltekitPlugin]
});
