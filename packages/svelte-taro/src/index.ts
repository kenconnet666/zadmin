export { createSvelteVitePlugin } from './compiler/index.ts';
export type { SvelteCompilerOptions, SvelteCompilerPlugin } from './compiler/index.ts';
export { defineSvelteConfig } from './plugin/config.ts';
export type {
	ResolvedSvelteProjectConfig,
	SvelteProjectConfig,
	SvelteTaroPluginOptions
} from './plugin/types.ts';
export { createSvelteApp, getSvelteTaroContext, ResourceScope } from './runtime/index.ts';
export type { ScopeCleanup, SvelteTaroApp, SvelteTaroRuntimeContext } from './runtime/index.ts';
