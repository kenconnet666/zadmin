import { defineApp } from '@zadmin/core';
import { etlPlugin } from '@zadmin/etl';
import { ossPlugin } from '@zadmin/oss';
import { postgresPlugin } from '@zadmin/postgres';
import { redisPlugin } from '@zadmin/redis';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const etlApp = defineApp({
	id: 'etl',
	plugins: [sveltekitPlugin, postgresPlugin, redisPlugin, ossPlugin, etlPlugin]
});
