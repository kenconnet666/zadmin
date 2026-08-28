import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

import { createSvelteVitePlugin } from '@zadmin/miniapp';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
const svelteClient = resolve(
	dirname(require.resolve('svelte/package.json')),
	'src/index-client.js'
);

export default defineConfig({
	define: {
		ENABLE_ADJACENT_HTML: true,
		ENABLE_CLONE_NODE: true,
		ENABLE_CONTAINS: true,
		ENABLE_INNER_HTML: true,
		ENABLE_MUTATION_OBSERVER: true,
		ENABLE_SIZE_APIS: true,
		ENABLE_TEMPLATE_CONTENT: true
	},
	plugins: [createSvelteVitePlugin({ dev: true })],
	resolve: {
		alias: [{ find: /^svelte$/u, replacement: svelteClient }],
		conditions: ['browser'],
		dedupe: ['svelte']
	},
	test: {
		coverage: {
			exclude: ['dist/**', 'tests/**'],
			provider: 'v8',
			reporter: ['text', 'json-summary']
		}
	}
});
