import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

type PluginFunction = (context: Record<string, unknown>, options?: Record<string, unknown>) => void;

type InjectedVitePlugin = {
	buildStart?: (this: unknown) => unknown;
	configResolved?: (config: Record<string, unknown>) => Promise<unknown>;
	name: string;
	transform?: (
		this: { warn(warning: unknown): void },
		source: string,
		id: string
	) => Promise<{ code: string } | undefined>;
};

function loadPlugin(): PluginFunction & {
	defineSvelteConfig<TConfig extends Record<string, unknown>>(config: TConfig): TConfig;
	getLoaderMeta(): Record<string, unknown>;
} {
	return require('../dist/plugin/index.cjs') as ReturnType<typeof loadPlugin>;
}

function createContext(framework = 'none') {
	const state: {
		modify?: (args: { opts: Record<string, unknown> }) => void;
		modifyVite?: (args: { viteConfig: { plugins?: unknown[] } }) => void;
		parseElement?: (args: { componentConfig: { includes: Set<string> }; nodeName: string }) => void;
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
		modifyViteConfig(callback: (args: { viteConfig: { plugins?: unknown[] } }) => void) {
			state.modifyVite = callback;
		},
		onParseCreateElement(
			callback: (args: { componentConfig: { includes: Set<string> }; nodeName: string }) => void
		) {
			state.parseElement = callback;
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
	it('exposes the config helper through the CJS plugin condition', () => {
		const plugin = loadPlugin();
		const config = plugin.defineSvelteConfig({
			compiler: { type: 'vite' },
			framework: 'svelte',
			plugins: ['@zadmin/svelte-taro']
		});
		expect(config.framework).toBe('none');
	});

	it('does nothing for another framework', () => {
		const { context, state } = createContext('react');
		loadPlugin()(context);
		expect(state.modify).toBeUndefined();
		expect(state.modifyVite).toBeUndefined();
		expect(state.parseElement).toBeUndefined();
		expect(state.schema).toBeUndefined();
	});

	it('injects Svelte extensions, a lazy compiler, and loader metadata', async () => {
		const { compilerContext, context, state } = createContext();
		loadPlugin()(context, { renderer: '@fixture/renderer' });
		expect(state.schema).toBeTypeOf('function');
		const viteConfig: { plugins?: Array<{ name?: string }> } = {};
		state.modifyVite?.({ viteConfig });
		expect(viteConfig.plugins?.[0]?.name).toBe('zadmin:svelte-package-imports');
		const compatibility = viteConfig.plugins?.[0] as {
			resolveId(source: string): string | undefined;
		};
		expect(compatibility.resolveId('svelte')).toMatch(
			/dist[\\/]vendor[\\/]svelte-runtime\.prod\.js$/u
		);
		expect(compatibility.resolveId('svelte/internal/client')).toBe(
			compatibility.resolveId('svelte')
		);
		expect(compatibility.resolveId('svelte/renderer')).toBe(compatibility.resolveId('svelte'));
		const includes = new Set<string>();
		state.parseElement?.({ componentConfig: { includes }, nodeName: 'button' });
		expect(includes).toEqual(new Set(['button']));

		const appEntry = fileURLToPath(new URL('./RuntimeApp', import.meta.url));
		const opts: Record<string, unknown> = { compiler: 'vite', entry: { app: [appEntry] } };
		state.modify?.({ opts });
		expect(opts.frameworkExts).toEqual(['.svelte']);
		expect(opts.entry).toEqual({ app: [`${appEntry}.svelte`] });
		const compiler = opts.compiler as { type: string; vitePlugins: InjectedVitePlugin[] };
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

		await compiler.vitePlugins[0].configResolved?.({ command: 'build', mode: 'production' });
		const transformed = await compiler.vitePlugins[0].transform?.call(
			{ warn() {} },
			'<view><text>loaded</text></view>',
			'C:/fixture/Lazy.svelte'
		);
		expect(transformed?.code).toContain("from '@fixture/renderer'");
	});

	it('rejects a Webpack runner instead of silently compiling incorrectly', () => {
		const { context, state } = createContext();
		loadPlugin()(context);
		expect(() => state.modify?.({ opts: { compiler: { type: 'webpack5' } } })).toThrow(
			/only the Taro Vite compiler/
		);
	});
});
