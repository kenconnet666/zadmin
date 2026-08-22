import { describe, expect, it } from 'vitest';
import { validatePeerDependencies } from '../src/artifact/validation.ts';
import { assertNoRuntimePluginImports } from '../src/artifact/vite.ts';
import { parsePluginManifest } from '../src/artifact/manifest.ts';

const manifest = parsePluginManifest({
	protocol: 2,
	id: '@test/plugin',
	version: '1.0.0',
	displayName: 'Plugin',
	requiredTrust: 'trusted',
	entries: { server: './server/index.js' },
	requiresHost: { '@zadmin/core': '^1.0.0' },
	requires: { '@test/upstream': '^2.0.0' },
	optional: { '@test/optional': '~3.1.0' }
});

describe('plugin package validation', () => {
	it('aligns runtime dependencies with package peer dependencies', () => {
		expect(() =>
			validatePeerDependencies(manifest, {
				'@zadmin/core': 'workspace:^',
				'@test/upstream': '^2.0.0',
				'@test/optional': '~3.1.0',
				svelte: '^5.0.0'
			})
		).not.toThrow();
	});

	it('rejects missing, mismatched and unused ZAdmin peer dependencies', () => {
		expect(() =>
			validatePeerDependencies(manifest, {
				'@zadmin/core': '^1.0.0',
				'@test/upstream': '^1.0.0',
				'@test/optional': '~3.1.0'
			})
		).toThrow('does not match');
		expect(() =>
			validatePeerDependencies(manifest, {
				'@zadmin/core': '^1.0.0',
				'@test/upstream': '^2.0.0'
			})
		).toThrow('not a peerDependency');
		expect(() =>
			validatePeerDependencies(manifest, {
				'@zadmin/core': '^1.0.0',
				'@test/upstream': '^2.0.0',
				'@test/optional': '~3.1.0',
				'@zadmin/unused': '^1.0.0'
			})
		).toThrow('unused ZAdmin peerDependency');
	});

	it('rejects runtime imports while allowing erased type dependencies', () => {
		const dependencies = new Set(['@test/upstream']);
		expect(() => assertNoRuntimePluginImports('@test/plugin', dependencies, [])).not.toThrow();
		expect(() =>
			assertNoRuntimePluginImports('@test/plugin', dependencies, ['@test/upstream/internal'])
		).toThrow('use import type');
	});
});
