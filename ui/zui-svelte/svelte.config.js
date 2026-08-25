import { icssPreprocess } from './src/lib/compiler/preprocess.ts';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		icssPreprocess({
			modules: ['@zadmin/zui-svelte', '../../icss/runtime.js'],
			root: import.meta.dirname
		})
	]
};

export default config;
