import { gzipSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { build } from 'vite';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(packageRoot, 'src/lib');
const portable = (path) => path.replaceAll('\\', '/');
const runtime = portable(resolve(sourceRoot, 'runtime.ts'));
const components = [
	{ id: 'provider', name: 'ZProvider', path: 'gene/ZProvider.svelte' },
	{ id: 'box', name: 'ZBox', path: 'gene/ZBox.svelte' },
	{ id: 'stack', name: 'ZStack', path: 'layout/ZStack.svelte' },
	{ id: 'text', name: 'ZText', path: 'gene/ZText.svelte' },
	{ id: 'icon', name: 'ZIcon', path: 'gene/ZIcon.svelte' },
	{ id: 'button', name: 'ZButton', path: 'gene/ZButton.svelte' },
	{ id: 'input', name: 'ZInput', path: 'input/ZInput.svelte' },
	{ id: 'field', name: 'ZField', path: 'input/ZField.svelte' }
];

async function bundle(source) {
	const virtualId = '\0zadmin-zui-bundle-entry';
	const result = await build({
		configFile: false,
		logLevel: 'silent',
		plugins: [
			{
				name: 'zadmin-zui-bundle-entry',
				resolveId(id) {
					return id === 'virtual:zui-bundle' ? virtualId : null;
				},
				load(id) {
					return id === virtualId ? source : null;
				}
			},
			svelte({ configFile: false })
		],
		resolve: { conditions: ['svelte', 'browser'] },
		build: {
			minify: 'oxc',
			write: false,
			rolldownOptions: {
				external: (id) => id === 'svelte' || id.startsWith('svelte/'),
				input: 'virtual:zui-bundle',
				output: { format: 'es' }
			}
		}
	});
	const outputs = (Array.isArray(result) ? result.flatMap((entry) => entry.output) : result.output)
		.filter((entry) => entry.type === 'chunk')
		.map((entry) => entry.code)
		.join('\n');
	return { code: outputs, gzip: gzipSync(outputs, { level: 9 }).byteLength };
}

const runtimeBundle = await bundle(
	`import * as runtime from ${JSON.stringify(runtime)}; globalThis.__zuiRuntimeBudget = runtime;`
);
if (runtimeBundle.gzip > 15 * 1024) {
	throw new Error(`ZUI browser runtime gzip ${runtimeBundle.gzip} exceeds 15 KiB.`);
}

const report = { runtimeGzip: runtimeBundle.gzip, components: {} };
for (const component of components) {
	const componentEntry = portable(resolve(sourceRoot, `components/${component.path}`));
	const output = await bundle(
		`import * as runtime from ${JSON.stringify(runtime)}; import * as component from ${JSON.stringify(componentEntry)}; globalThis.__zuiRuntimeBudget = runtime; globalThis.__zuiComponentBudget = component;`
	);
	const incremental = Math.max(0, output.gzip - runtimeBundle.gzip);
	if (incremental > 3 * 1024) {
		throw new Error(`${component.name} incremental gzip ${incremental} exceeds 3 KiB.`);
	}
	if (/node:async_hooks|compiler\/preprocess|svelte\/compiler/u.test(output.code)) {
		throw new Error(`${component.name} browser bundle contains compiler/server code.`);
	}
	report.components[component.id] = { gzip: output.gzip, incrementalGzip: incremental };
}

console.log(JSON.stringify(report));
