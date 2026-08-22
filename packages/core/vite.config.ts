import { defineConfig } from 'vitest/config';
import { standardDecorators } from './src/artifact/vite.ts';

export default defineConfig({
	plugins: [standardDecorators()],
	oxc: {
		target: 'es2022'
	}
});
