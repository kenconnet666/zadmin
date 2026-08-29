import { icssPreprocess } from '@zadmin/zui/compiler';

const config = {
	preprocess: [icssPreprocess()],
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	}
};

export default config;
