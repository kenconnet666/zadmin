import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			exclude: ['dist/**', 'tests/**'],
			provider: 'v8',
			reporter: ['text', 'json-summary'],
			thresholds: {
				branches: 95,
				functions: 95,
				lines: 95,
				statements: 95
			}
		}
	}
});
