import { describe, expect, it } from 'vitest';

import { defineSvelteConfig } from '../src/index.ts';

describe('defineSvelteConfig', () => {
	it('preserves a valid strongly typed Taro config', () => {
		const config = defineSvelteConfig({
			compiler: { type: 'vite' },
			framework: 'svelte',
			plugins: ['@zadmin/svelte-taro'],
			projectName: 'fixture'
		});
		expect(config.framework).toBe('svelte');
		expect(config.projectName).toBe('fixture');
	});

	it('rejects missing plugin and non-Vite compilers', () => {
		expect(() =>
			defineSvelteConfig({
				compiler: { type: 'vite' },
				framework: 'svelte',
				plugins: [],
				projectName: 'missing'
			})
		).toThrow(/must register/);
		expect(() =>
			defineSvelteConfig({
				compiler: { type: 'webpack5' },
				framework: 'svelte',
				plugins: ['@zadmin/svelte-taro'],
				projectName: 'webpack'
			})
		).toThrow(/require compiler/);
	});
});
