import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

type PluginFunction = (context: Record<string, unknown>, options?: Record<string, unknown>) => void;

function loadPlugin(): PluginFunction & { getLoaderMeta(): Record<string, unknown> } {
	return require('../dist/plugin/index.cjs') as ReturnType<typeof loadPlugin>;
}

function createContext(framework = 'svelte') {
	const state: {
		modify?: (args: { opts: Record<string, unknown> }) => void;
		schema?: (joi: unknown) => unknown;
	} = {};
	const compilerContext: { loaderMeta?: Record<string, unknown> } = {};
	const context = {
		addPluginOptsSchema(schema: (joi: unknown) => unknown) {
			state.schema = schema;
		},
		initialConfig: { framework },
		modifyRunnerOpts(callback: (args: { opts: Record<string, unknown> }) => void) {
			state.modify = callback;
		},
		runnerUtils: {
			getViteMiniCompilerContext() {
				return compilerContext;
			}
		}
	};
	return { compilerContext, context, state };
}

describe('Taro framework plugin', () => {
	it('does nothing for another framework', () => {
		const { context, state } = createContext('react');
		loadPlugin()(context);
		expect(state.modify).toBeUndefined();
		expect(state.schema).toBeUndefined();
	});

	it('injects Svelte extensions, compiler, and loader metadata', () => {
		const { compilerContext, context, state } = createContext();
		loadPlugin()(context, { renderer: '@fixture/renderer' });
		expect(state.schema).toBeTypeOf('function');

		const opts: Record<string, unknown> = { compiler: 'vite' };
		state.modify?.({ opts });
		expect(opts.frameworkExts).toEqual(['.svelte']);
		const compiler = opts.compiler as { type: string; vitePlugins: Array<Record<string, unknown>> };
		expect(compiler.type).toBe('vite');
		expect(compiler.vitePlugins.map((plugin) => plugin.name)).toEqual([
			'zadmin:svelte-taro-compiler',
			'zadmin:svelte-taro-loader-meta'
		]);
		const buildStart = compiler.vitePlugins[1].buildStart;
		expect(buildStart).toBeTypeOf('function');
		if (typeof buildStart === 'function') buildStart.call({});
		expect(compilerContext.loaderMeta).toMatchObject({
			creator: 'createSvelteApp',
			creatorLocation: '@zadmin/svelte-taro/runtime'
		});
	});

	it('rejects a Webpack runner instead of silently compiling incorrectly', () => {
		const { context, state } = createContext();
		loadPlugin()(context);
		expect(() => state.modify?.({ opts: { compiler: { type: 'webpack5' } } })).toThrow(
			/only the Taro Vite compiler/
		);
	});
});
