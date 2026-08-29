export { createSvelteVitePlugin } from '../compiler/index.ts';
export type { SvelteCompilerOptions, SvelteCompilerPlugin } from '../compiler/index.ts';

export interface MiniappProjectConfig {
	readonly outputRoot?: string;
	readonly sourceRoot?: string;
	readonly target: 'wechat';
}

export function defineMiniappConfig<const TConfig extends MiniappProjectConfig>(
	config: TConfig
): Readonly<TConfig> {
	if (config.target !== 'wechat') throw new TypeError('Miniapp v1 only supports target="wechat".');
	return Object.freeze({ ...config });
}
