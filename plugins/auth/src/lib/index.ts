import { definePlugin } from '@zadmin/core';
import { postgresPlugin } from '@zadmin/postgres';
import { redisPlugin } from '@zadmin/redis';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const authPlugin = definePlugin({
	id: 'auth',
	dependencies: [sveltekitPlugin, postgresPlugin, redisPlugin]
});
