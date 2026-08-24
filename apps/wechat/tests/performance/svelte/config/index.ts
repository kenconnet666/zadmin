import { defineSvelteConfig } from '@zadmin/svelte-taro';

export default defineSvelteConfig({
	compiler: { type: 'vite' },
	date: '2026-08-25',
	designWidth: 750,
	framework: 'svelte',
	mini: { enableSourceMap: false },
	outputRoot: 'dist',
	plugins: ['@zadmin/svelte-taro'],
	projectName: 'performance-svelte',
	sourceRoot: 'src'
});
