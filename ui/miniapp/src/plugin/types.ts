import type { IProjectConfig, PluginItem } from '@tarojs/taro/types/compile/index.js';

export interface SvelteTaroPluginOptions {
	readonly renderer?: string;
	readonly target?: 'weapp';
}

export type SvelteProjectConfig = Omit<IProjectConfig, 'framework' | 'plugins'> & {
	readonly framework: 'svelte';
	readonly plugins: readonly PluginItem[];
};

export type ResolvedSvelteProjectConfig<TConfig extends SvelteProjectConfig> = Omit<
	TConfig,
	'framework'
> & {
	readonly framework: 'none';
};
