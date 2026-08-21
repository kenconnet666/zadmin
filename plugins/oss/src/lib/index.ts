import { definePlugin } from '@zadmin/core';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const ossPlugin = definePlugin({
	id: 'oss',
	dependencies: [sveltekitPlugin]
});
