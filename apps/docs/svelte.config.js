import adapter from '@sveltejs/adapter-node';
import { icssPreprocess } from '@zadmin/zui-web/compiler';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [icssPreprocess()],
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter()
	}
};

export default config;
