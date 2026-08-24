import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import type { SvelteTaroPluginOptions } from './types.ts';
import type { SvelteCompilerPlugin } from '../compiler/types.ts';

type VitePlugin = {
	readonly enforce?: 'pre' | 'post';
	readonly name: string;
	readonly buildStart?: (this: unknown, ...args: readonly unknown[]) => unknown;
	readonly resolveId?: (source: string) => unknown;
};

type ViteConfig = {
	plugins?: unknown[];
};

type CompilerOptions = {
	type?: string;
	vitePlugins?: VitePlugin[];
};

type RunnerOptions = {
	compiler?: string | CompilerOptions;
	entry?: {
		app?: string | string[];
	};
	frameworkExts?: string[];
};

type LoaderMetaContext = {
	loaderMeta?: Record<string, unknown>;
};

type TaroComponentConfig = {
	includes: Set<string>;
};

type PluginContext = {
	addPluginOptsSchema(schema: (joi: JoiRoot) => unknown): void;
	initialConfig: { framework?: string };
	modifyRunnerOpts(callback: (args: { opts: RunnerOptions }) => void): void;
	modifyViteConfig?(callback: (args: { viteConfig: ViteConfig }) => void): void;
	onParseCreateElement?(
		callback: (args: { componentConfig: TaroComponentConfig; nodeName: string }) => void
	): void;
	runnerUtils?: {
		getViteMiniCompilerContext(context: unknown): LoaderMetaContext | undefined;
	};
};

type JoiSchema = {
	default(value: unknown): JoiSchema;
	optional(): JoiSchema;
	valid(...values: readonly unknown[]): JoiSchema;
};

type JoiRoot = {
	object(shape: Record<string, JoiSchema>): unknown;
	string(): JoiSchema;
};

const DEFAULT_RENDERER = '@zadmin/svelte-taro/renderer';
const PACKAGE_NAME = '@zadmin/svelte-taro';
const localRequire = createRequire(__filename);

function defineSvelteConfig<TConfig extends Record<string, unknown>>(config: TConfig): TConfig {
	if (config.framework !== 'svelte') {
		throw new TypeError('Svelte Taro projects must use framework="svelte".');
	}
	const plugins = Array.isArray(config.plugins) ? config.plugins : [];
	const hasPlugin = plugins.some((item) =>
		typeof item === 'string'
			? item === PACKAGE_NAME
			: Array.isArray(item) && item[0] === PACKAGE_NAME
	);
	if (!hasPlugin)
		throw new TypeError(`Svelte Taro projects must register ${PACKAGE_NAME} in plugins.`);
	const compiler = config.compiler;
	const compilerType =
		typeof compiler === 'string'
			? compiler
			: typeof compiler === 'object' && compiler !== null
				? (compiler as { type?: unknown }).type
				: undefined;
	if (compilerType !== 'vite') {
		throw new TypeError('Svelte Taro projects currently require compiler.type="vite".');
	}
	return { ...config, framework: 'none' };
}

function getLoaderMeta(): Record<string, unknown> {
	return {
		creator: 'createSvelteApp',
		creatorLocation: '@zadmin/svelte-taro/runtime',
		execBeforeCreateWebApp: '',
		extraImportForWeb: '',
		frameworkArgs: 'config',
		importFrameworkName: '',
		importFrameworkStatement: '',
		mockAppStatement: 'function App() { return null }',
		modifyConfig(config: Record<string, unknown>, source: string) {
			if (/\bonShareAppMessage\b/u.test(source)) config.enableShareAppMessage = true;
			if (/\bonShareTimeline\b/u.test(source)) config.enableShareTimeline = true;
		}
	};
}

function createCompilerPlugin(options: SvelteTaroPluginOptions): VitePlugin {
	let implementation: Promise<SvelteCompilerPlugin> | undefined;
	const load = () =>
		(implementation ??= import('../compiler/index.js').then(({ createSvelteVitePlugin }) =>
			createSvelteVitePlugin({ renderer: options.renderer ?? DEFAULT_RENDERER })
		));
	return {
		enforce: 'pre',
		name: 'zadmin:svelte-taro-compiler',
		async buildStart(...args: readonly unknown[]) {
			return (await load()).buildStart?.apply(this, args as []);
		},
		async configResolved(config: unknown) {
			return (await load()).configResolved?.call(this, config as never);
		},
		async load(id: string) {
			return (await load()).load?.call(this, id);
		},
		async resolveId(source: string) {
			return (await load()).resolveId?.call(this, source);
		},
		async transform(source: string, id: string) {
			const plugin = await load();
			return plugin.transform?.call(this as never, source, id);
		}
	} as VitePlugin;
}

function createMiniIntegrationPlugin(context: PluginContext): VitePlugin {
	return {
		name: 'zadmin:svelte-taro-loader-meta',
		buildStart() {
			const compilerContext = context.runnerUtils?.getViteMiniCompilerContext(this);
			if (compilerContext === undefined) return;
			compilerContext.loaderMeta ??= {};
			Object.assign(compilerContext.loaderMeta, getLoaderMeta());
		}
	};
}

function createSveltePackageImportsPlugin(): VitePlugin {
	const svelteRoot = dirname(localRequire.resolve('svelte/package.json'));
	const clientConstants = join(svelteRoot, 'src/internal/client/constants.js');
	return {
		enforce: 'pre',
		name: 'zadmin:svelte-package-imports',
		resolveId(source: string) {
			return source === '#client/constants' ? clientConstants : undefined;
		}
	};
}

function normalizeCompiler(options: RunnerOptions): CompilerOptions | undefined {
	if (typeof options.compiler === 'string') options.compiler = { type: options.compiler };
	return options.compiler;
}

function resolveSvelteAppEntry(entry: string): string {
	if (entry.endsWith('.svelte') || !existsSync(`${entry}.svelte`)) return entry;
	return `${entry}.svelte`;
}

function svelteTaroPlugin(context: PluginContext, options: SvelteTaroPluginOptions = {}): void {
	if (context.initialConfig.framework !== 'svelte' && context.initialConfig.framework !== 'none') {
		return;
	}

	context.addPluginOptsSchema((joi) =>
		joi.object({
			renderer: joi.string().optional(),
			target: joi.string().valid('weapp').default('weapp')
		})
	);

	context.modifyViteConfig?.(({ viteConfig }) => {
		viteConfig.plugins ??= [];
		viteConfig.plugins.unshift(createSveltePackageImportsPlugin());
	});

	context.onParseCreateElement?.(({ componentConfig, nodeName }) => {
		componentConfig.includes.add(nodeName);
	});

	context.modifyRunnerOpts(({ opts }) => {
		opts.frameworkExts = ['.svelte'];
		const appEntry = opts.entry?.app;
		if (typeof appEntry === 'string') opts.entry!.app = resolveSvelteAppEntry(appEntry);
		else if (Array.isArray(appEntry)) opts.entry!.app = appEntry.map(resolveSvelteAppEntry);
		const compiler = normalizeCompiler(opts);
		if (compiler === undefined) return;
		if (compiler.type !== 'vite') {
			throw new Error('@zadmin/svelte-taro currently supports only the Taro Vite compiler.');
		}
		compiler.vitePlugins ??= [];
		compiler.vitePlugins.unshift(createCompilerPlugin(options));
		compiler.vitePlugins.push(createMiniIntegrationPlugin(context));
	});
}

module.exports = svelteTaroPlugin;
module.exports.default = svelteTaroPlugin;
module.exports.defineSvelteConfig = defineSvelteConfig;
module.exports.getLoaderMeta = getLoaderMeta;
