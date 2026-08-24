import { compile, parse } from 'svelte/compiler';

import { collectNativeElements, createComponentMarkerCode } from './marker.ts';
import { assertSupportedSvelteSource } from './diagnostics.ts';
import type {
	SvelteCompilerOptions,
	SvelteCompilerPlugin,
	SvelteTransformResult
} from './types.ts';

const STYLE_SUFFIX = '.zadmin-svelte-taro.css';
const COMPONENT_SUFFIX = '.taro-components.tsx';
const BUILD_ID_SOURCE = 'virtual:zadmin-svelte-taro-build-id';
const BUILD_ID_RESOLVED = '\0zadmin-svelte-taro-build-id';

export function styleVirtualId(id: string): string {
	return `${id.split('?')[0]}${STYLE_SUFFIX}`;
}

export function componentMarkerId(id: string): string {
	return `${id.split('?')[0]}${COMPONENT_SUFFIX}`;
}

function isSvelteSource(id: string): boolean {
	const [filename, query = ''] = id.split('?', 2);
	return (
		filename.endsWith('.svelte') &&
		!query.includes('entry-loader=true') &&
		!query.includes('page-loader=true')
	);
}

export function createSvelteVitePlugin(options: SvelteCompilerOptions = {}): SvelteCompilerPlugin {
	const styles = new Map<string, string>();
	const componentMarkers = new Map<string, string>();
	let resolved: { command?: string; mode?: string; root?: string } = {};
	let buildSequence = 0;
	let buildId: string | undefined;
	const isDevelopment = () =>
		options.dev ?? (resolved.command === 'serve' || resolved.mode === 'development');

	return {
		enforce: 'pre',
		name: 'zadmin:svelte-taro-compiler',
		buildStart() {
			buildId = isDevelopment()
				? `${Date.now().toString(36)}-${(++buildSequence).toString(36)}`
				: undefined;
		},
		configResolved(config) {
			resolved = config;
		},
		resolveId(source) {
			if (source === BUILD_ID_SOURCE) return BUILD_ID_RESOLVED;
			if (styles.has(source) || componentMarkers.has(source)) return source;
			return undefined;
		},
		load(id) {
			if (id === BUILD_ID_RESOLVED && buildId !== undefined) {
				return `globalThis.__ZADMIN_BUILD_ID__ = ${JSON.stringify(buildId)};\nif (typeof wx !== "undefined") wx.setStorageSync("__zadmin_build_id__", ${JSON.stringify(buildId)});\n`;
			}
			return styles.get(id) ?? componentMarkers.get(id);
		},
		shouldTransformCachedModule({ id }) {
			return id === BUILD_ID_RESOLVED;
		},
		async transform(source, id): Promise<SvelteTransformResult | undefined> {
			if (!isSvelteSource(id)) return undefined;
			const filename = id.split('?')[0];
			assertSupportedSvelteSource(source, filename);
			const dev = isDevelopment();
			const renderer = options.renderer ?? '@zadmin/svelte-taro/renderer';
			const ast = parse(source, { filename, modern: true });
			const elements = collectNativeElements(ast.fragment);
			const markerId = componentMarkerId(filename);
			componentMarkers.set(markerId, createComponentMarkerCode(elements));

			const result = compile(source, {
				css: 'external',
				dev,
				experimental: { customRenderer: renderer },
				filename,
				generate: 'client',
				rootDir: resolved.root,
				runes: true
			});
			for (const warning of result.warnings) {
				this.warn({
					code: warning.code,
					id: filename,
					message: warning.message,
					pos: warning.start?.character
				});
			}

			const imports = [`import ${JSON.stringify(markerId)};`];
			if (buildId !== undefined) imports.push(`import ${JSON.stringify(BUILD_ID_SOURCE)};`);
			if (result.css?.code) {
				const styleId = styleVirtualId(filename);
				styles.set(styleId, result.css.code);
				imports.push(`import ${JSON.stringify(styleId)};`);
			}
			return {
				code: `${result.js.code}\n${imports.join('\n')}\n`,
				map: result.js.map ?? null
			};
		},
		writeBundle() {
			if (buildId !== undefined) console.log(`[zadmin-build] ${buildId}`);
		}
	};
}

export type { SvelteCompilerOptions, SvelteCompilerPlugin } from './types.ts';
export { collectNativeElements, createComponentMarkerCode } from './marker.ts';
export { assertSupportedSvelteSource, SvelteTaroCompileError } from './diagnostics.ts';
