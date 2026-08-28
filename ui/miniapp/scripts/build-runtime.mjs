import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(packageRoot, 'dist/vendor');
const source = `
export * from 'svelte/internal/client';
export * from 'svelte';
export * from 'svelte/renderer';
`;

await mkdir(outputRoot, { recursive: true });
for (const mode of ['development', 'production']) {
	await build({
		bundle: true,
		conditions: ['browser', mode],
		format: 'esm',
		logLevel: 'warning',
		outfile: resolve(outputRoot, `svelte-runtime.${mode === 'development' ? 'dev' : 'prod'}.js`),
		platform: 'browser',
		sourcemap: true,
		stdin: {
			contents: source,
			loader: 'js',
			resolveDir: packageRoot,
			sourcefile: `svelte-runtime.${mode}.js`
		},
		target: 'es2022',
		treeShaking: true
	});
}
