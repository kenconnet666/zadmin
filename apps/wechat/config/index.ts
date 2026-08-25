import { defineSvelteConfig } from '@zadmin/svelte-taro';

export default defineSvelteConfig({
	compiler: { type: 'vite' },
	copy: {
		options: {},
		patterns: [{ from: 'src/workers', to: 'dist/workers' }]
	},
	date: '2026-08-25',
	defineConstants: {},
	designWidth: 750,
	deviceRatio: {
		375: 2,
		640: 1.17,
		750: 1,
		828: 0.905
	},
	framework: 'svelte',
	mini: {
		enableSourceMap: true,
		postcss: {
			cssModules: { enable: false },
			pxtransform: { enable: true, config: {} }
		},
		runtime: {
			enableAdjacentHTML: false,
			enableCloneNode: false,
			enableInnerHTML: false,
			enableMutationObserver: true,
			enableSizeAPIs: false,
			enableTemplateContent: false
		}
	},
	outputRoot: 'dist',
	plugins: [['@zadmin/svelte-taro', { target: 'weapp' }]],
	projectName: 'zadmin-wechat',
	sourceRoot: 'src'
});
