import { describe, expect, it } from 'vitest';
import { parsePluginManifest, PluginManifestError } from '../src/manifest.ts';

const valid = {
	protocol: 1,
	id: '@zadmin/example',
	version: '0.0.0',
	displayName: 'Example',
	requiredTrust: 'trusted',
	entries: { server: './server/index.js', client: './client/index.js' },
	requiresHost: { '@zadmin/core': '0.0.0' },
	requires: {},
	optional: {}
};

describe('parsePluginManifest', () => {
	it('normalizes and freezes a valid trusted manifest', () => {
		const manifest = parsePluginManifest(valid);
		expect(manifest).toMatchObject({ id: '@zadmin/example', protocol: 1 });
		expect(Object.isFrozen(manifest)).toBe(true);
		expect(Object.isFrozen(manifest.entries)).toBe(true);
	});

	it('rejects unsupported trust and unsafe entry paths', () => {
		expect(() => parsePluginManifest({ ...valid, requiredTrust: 'sandboxed' })).toThrow(
			PluginManifestError
		);
		expect(() => parsePluginManifest({ ...valid, entries: { server: './../outside.js' } })).toThrow(
			'must not traverse'
		);
		expect(() => parsePluginManifest({ ...valid, entries: { server: 'C:\\plugin.js' } })).toThrow(
			'relative path'
		);
	});
});
