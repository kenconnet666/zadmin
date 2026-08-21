import { definePlugin } from '@zadmin/core';
import { sveltekitPlugin } from '@zadmin/sveltekit';

export const ossPlugin = definePlugin({
	id: 'oss',
	dependencies: { sveltekit: sveltekitPlugin },
	setup(_context, { sveltekit }) {
		return { protocol: 's3', framework: sveltekit.framework } as const;
	}
});
