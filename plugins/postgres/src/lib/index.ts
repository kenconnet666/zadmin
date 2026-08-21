import { definePlugin } from '@zadmin/core';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const postgresPlugin = definePlugin({
	id: 'postgres',
	dependencies: [sveltekitPlugin]
});
