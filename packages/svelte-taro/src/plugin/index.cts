import type { SvelteTaroPluginOptions } from './types.ts';

type VitePlugin = {
	readonly enforce?: 'pre' | 'post';
	readonly name: string;
	readonly buildStart?: (this: unknown) => void;
};

type CompilerOptions = {
	type?: string;
	vitePlugins?: VitePlugin[];
};

type RunnerOptions = {
	compiler?: string | CompilerOptions;
	frameworkExts?: string[];
};

type LoaderMetaContext = {
	loaderMeta?: Record<string, unknown>;
};

type PluginContext = {
	addPluginOptsSchema(schema: (joi: JoiRoot) => unknown): void;
	initialConfig: { framework?: string };
	modifyRunnerOpts(callback: (args: { opts: RunnerOptions }) => void): void;
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
	return {
		enforce: 'pre',
		name: 'zadmin:svelte-taro-compiler',
		...({ renderer: options.renderer ?? DEFAULT_RENDERER } as object)
	};
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

function normalizeCompiler(options: RunnerOptions): CompilerOptions | undefined {
	if (typeof options.compiler === 'string') options.compiler = { type: options.compiler };
	return options.compiler;
}

function svelteTaroPlugin(context: PluginContext, options: SvelteTaroPluginOptions = {}): void {
	if (context.initialConfig.framework !== 'svelte') return;

	context.addPluginOptsSchema((joi) =>
		joi.object({
			renderer: joi.string().optional(),
			target: joi.string().valid('weapp').default('weapp')
		})
	);

	context.modifyRunnerOpts(({ opts }) => {
		opts.frameworkExts = ['.svelte'];
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
module.exports.getLoaderMeta = getLoaderMeta;
