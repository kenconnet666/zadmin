import { definePlugin } from '@zadmin/core';
import { ossPlugin } from '@zadmin/oss';
import { postgresPlugin } from '@zadmin/postgres';
import { redisPlugin } from '@zadmin/redis';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const etlPlugin = definePlugin({
	id: 'etl',
	dependencies: [sveltekitPlugin, postgresPlugin, redisPlugin, ossPlugin]
});
