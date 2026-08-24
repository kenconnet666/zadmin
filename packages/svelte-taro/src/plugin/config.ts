import type { ResolvedSvelteProjectConfig, SvelteProjectConfig } from './types.ts';

const PACKAGE_NAME = '@zadmin/svelte-taro';

function pluginName(item: SvelteProjectConfig['plugins'][number]): string | undefined {
	return typeof item === 'string' ? item : item[0];
}

export function defineSvelteConfig<const TConfig extends SvelteProjectConfig>(
	config: TConfig
): ResolvedSvelteProjectConfig<TConfig> {
	if (config.framework !== 'svelte') {
		throw new TypeError('Svelte Taro projects must use framework="svelte".');
	}
	if (!config.plugins.some((item) => pluginName(item) === PACKAGE_NAME)) {
		throw new TypeError(`Svelte Taro projects must register ${PACKAGE_NAME} in plugins.`);
	}
	const compiler = config.compiler;
	const compilerType = typeof compiler === 'string' ? compiler : compiler?.type;
	if (compilerType !== 'vite') {
		throw new TypeError('Svelte Taro projects currently require compiler.type="vite".');
	}
	return { ...config, framework: 'none' };
}
