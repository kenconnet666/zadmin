import { describe, expect, it } from 'vitest';

import { defineWebviewConfig, resolveWebviewTargets } from '../src/build/config.js';

describe('multi-target build configuration', () => {
	const config = defineWebviewConfig({
		web: { assets: 'build', command: 'pnpm build:web' },
		targets: {
			'windows-arm64': { package: 'portable' },
			'windows-x64': { package: 'portable' }
		}
	});

	it('resolves one target or every configured target', () => {
		expect(resolveWebviewTargets(config, 'windows-x64')).toEqual(['windows-x64']);
		expect(resolveWebviewTargets(config, 'all')).toEqual(['windows-arm64', 'windows-x64']);
	});

	it('rejects missing targets and empty build commands', () => {
		expect(() => resolveWebviewTargets(config, 'linux-x64' as never)).toThrow('not configured');
		expect(() =>
			defineWebviewConfig({
				web: { assets: 'build', command: '' },
				targets: { 'windows-x64': { package: 'portable' } }
			})
		).toThrow('command');
		expect(() =>
			defineWebviewConfig({
				web: { assets: '', command: 'build' },
				targets: { 'windows-x64': { package: 'portable' } }
			})
		).toThrow('assets');
		expect(() =>
			defineWebviewConfig({ web: { assets: 'build', command: 'build' }, targets: {} })
		).toThrow('target');
	});
});
