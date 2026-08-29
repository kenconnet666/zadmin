import { watch } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build, type BuildOptions, type Plugin } from 'esbuild';
import { compile } from 'svelte/compiler';

import { assertWeChatElement } from '../targets/wechat/elements.ts';
import { normalizeAppConfig, type MiniappAppConfig } from '../targets/wechat/manifest.ts';
import { mergeWechatWxss } from '../targets/wechat/styles.ts';
import { pageTemplate, WECHAT_RUNTIME_TEMPLATE } from '../targets/wechat/template.ts';
import { analyzeMiniappComponent } from './ir.ts';

export interface MiniappBuildOptions {
	readonly dev?: boolean;
	readonly outputRoot?: string;
	readonly projectRoot: string;
	readonly target: 'wechat';
}

export interface MiniappBuildResult {
	readonly buildId?: string;
	readonly files: readonly string[];
	readonly outputRoot: string;
	readonly pages: readonly string[];
}

export interface MiniappWatchOptions extends MiniappBuildOptions {
	readonly onBuild?: (result: MiniappBuildResult) => Promise<void> | void;
}

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function portable(path: string): string {
	return path.split(sep).join('/');
}

async function evaluateConfig<TConfig>(filename: string): Promise<TConfig> {
	const result = await build({
		bundle: true,
		entryPoints: [filename],
		format: 'esm',
		logLevel: 'silent',
		platform: 'node',
		target: 'node22',
		write: false
	});
	const source = result.outputFiles[0]?.text;
	if (source === undefined) throw new Error(`Unable to compile Miniapp config ${filename}.`);
	const module = (await import(
		`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
	)) as {
		default?: TConfig;
	};
	if (module.default === undefined)
		throw new TypeError(`Miniapp config ${filename} has no default export.`);
	return module.default;
}

function sveltePlugin(css: string[], renderer: string): Plugin {
	return {
		name: 'zadmin-miniapp-svelte',
		setup(buildContext) {
			buildContext.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
				const source = await readFile(path, 'utf8');
				const ir = analyzeMiniappComponent(source, path);
				for (const element of ir.nativeElements) assertWeChatElement(element);
				const result = compile(source, {
					css: 'external',
					dev: false,
					experimental: { customRenderer: renderer },
					filename: path,
					generate: 'client',
					runes: true
				});
				if (result.css?.code) css.push(result.css.code);
				return { contents: result.js.code, loader: 'js', resolveDir: dirname(path) };
			});
		}
	};
}

const SVELTE_FEATURES: Record<string, string> = {
	DEV: 'false',
	ENABLE_ADJACENT_HTML: 'false',
	ENABLE_CLONE_NODE: 'false',
	ENABLE_CONTAINS: 'false',
	ENABLE_INNER_HTML: 'false',
	ENABLE_MUTATION_OBSERVER: 'false',
	ENABLE_SIZE_APIS: 'false',
	ENABLE_TEMPLATE_CONTENT: 'false'
};

async function existingSource(javascript: string): Promise<string> {
	return readFile(javascript).then(
		() => javascript,
		() => javascript.replace(/\.js$/u, '.ts')
	);
}

async function bundleEntry(
	component: string,
	register: 'registerWechatApp' | 'registerWechatPage',
	output: string,
	dev: boolean,
	buildId?: string
): Promise<string> {
	const css: string[] = [];
	const lifecycle = await existingSource(resolve(sourceRoot, 'targets/wechat/lifecycle.js'));
	const renderer = await existingSource(resolve(sourceRoot, 'targets/wechat/runtime.js'));
	const identity =
		buildId === undefined
			? ''
			: `globalThis.__ZADMIN_BUILD_ID__ = ${JSON.stringify(buildId)}; if (typeof wx !== 'undefined') wx.setStorageSync('__zadmin_build_id__', ${JSON.stringify(buildId)});\n`;
	const entry = `${identity}import Component from ${JSON.stringify(portable(component))};\nimport { ${register} } from ${JSON.stringify(portable(lifecycle))};\n${register}(Component);\n`;
	const options: BuildOptions = {
		bundle: true,
		conditions: ['svelte', 'browser', dev ? 'development' : 'production'],
		define: {
			...SVELTE_FEATURES,
			'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production')
		},
		format: 'iife',
		logLevel: 'silent',
		outfile: output,
		platform: 'browser',
		plugins: [sveltePlugin(css, portable(renderer))],
		sourcemap: true,
		stdin: { contents: entry, loader: 'js', resolveDir: dirname(component), sourcefile: output },
		target: 'es2022',
		write: false
	};
	const result = await build(options);
	await mkdir(dirname(output), { recursive: true });
	for (const file of result.outputFiles ?? []) await writeFile(file.path, file.contents);
	return mergeWechatWxss(...css);
}

export async function buildMiniapp(options: MiniappBuildOptions): Promise<MiniappBuildResult> {
	if (options.target !== 'wechat')
		throw new TypeError(`Unsupported Miniapp target "${options.target}".`);
	const projectRoot = resolve(options.projectRoot);
	const outputRoot = resolve(projectRoot, options.outputRoot ?? 'dist/wechat');
	if (!outputRoot.startsWith(`${projectRoot}${sep}`)) {
		throw new TypeError('Miniapp outputRoot must stay inside projectRoot.');
	}
	await rm(outputRoot, { force: true, recursive: true });
	await mkdir(outputRoot, { recursive: true });

	const appConfig = normalizeAppConfig(
		await evaluateConfig<MiniappAppConfig>(resolve(projectRoot, 'src/app.config.ts'))
	);
	const buildId = options.dev ? Date.now().toString(36) : undefined;
	const files: string[] = [];
	const write = async (name: string, content: string): Promise<void> => {
		const filename = resolve(outputRoot, name);
		await mkdir(dirname(filename), { recursive: true });
		await writeFile(filename, content, 'utf8');
		files.push(portable(relative(outputRoot, filename)));
	};

	await write('templates/runtime.wxml', WECHAT_RUNTIME_TEMPLATE);
	const appCss = await bundleEntry(
		resolve(projectRoot, 'src/app.svelte'),
		'registerWechatApp',
		resolve(outputRoot, 'app.js'),
		options.dev === true,
		buildId
	);
	files.push('app.js', 'app.js.map');
	const authoredAppStyle = await readFile(resolve(projectRoot, 'src/app.wxss'), 'utf8').catch(
		() => ''
	);
	await write('app.wxss', mergeWechatWxss(authoredAppStyle, appCss));
	await write('app.json', `${JSON.stringify(appConfig, null, 2)}\n`);

	for (const route of appConfig.pages) {
		const source = resolve(projectRoot, `src/${route}.svelte`);
		const pageCss = await bundleEntry(
			source,
			'registerWechatPage',
			resolve(outputRoot, `${route}.js`),
			options.dev === true,
			buildId
		);
		files.push(`${route}.js`, `${route}.js.map`);
		const config = await evaluateConfig<Record<string, unknown>>(
			resolve(projectRoot, `src/${route}.config.ts`)
		);
		await write(`${route}.json`, `${JSON.stringify(config, null, 2)}\n`);
		await write(`${route}.wxml`, pageTemplate('../../templates/runtime.wxml'));
		await write(`${route}.wxss`, pageCss);
	}

	await cp(resolve(projectRoot, 'src/workers'), resolve(outputRoot, 'workers'), {
		recursive: true
	}).catch(() => undefined);
	if (buildId !== undefined) await write('__zadmin_build_id__.txt', buildId);
	return Object.freeze({
		...(buildId === undefined ? {} : { buildId }),
		files: Object.freeze(files.sort()),
		outputRoot,
		pages: appConfig.pages
	});
}

export function watchMiniapp(options: MiniappWatchOptions): () => Promise<void> {
	let building = false;
	let pending = false;
	let closed = false;
	let debounce: ReturnType<typeof setTimeout> | undefined;
	const rebuild = async (): Promise<void> => {
		if (building) {
			pending = true;
			return;
		}
		building = true;
		try {
			const result = await buildMiniapp({ ...options, dev: true });
			await options.onBuild?.(result);
		} finally {
			building = false;
			if (pending && !closed) {
				pending = false;
				void rebuild();
			}
		}
	};
	const schedule = (): void => {
		if (debounce !== undefined) clearTimeout(debounce);
		debounce = setTimeout(() => {
			debounce = undefined;
			void rebuild();
		}, 500);
	};
	const watchRoots = new Set([resolve(options.projectRoot, 'src'), sourceRoot]);
	const watchers: ReturnType<typeof watch>[] = [];
	const startWatchers = (): void => {
		if (closed) return;
		for (const root of watchRoots) watchers.push(watch(root, { recursive: true }, schedule));
	};
	void rebuild().then(startWatchers, startWatchers);
	return async () => {
		closed = true;
		if (debounce !== undefined) clearTimeout(debounce);
		for (const watcher of watchers) watcher.close();
	};
}
