import { describe, expect, it } from 'vitest';

import { componentCatalogManifest } from './catalog-manifest.generated.js';
import { componentDocLoaders } from './component-doc-loaders.generated.js';

describe('generated component catalog manifest', () => {
	it('keeps manifest, lazy loaders and catalog ids aligned', () => {
		const manifestIds = componentCatalogManifest.map(({ id }) => id);
		expect(new Set(manifestIds).size).toBe(manifestIds.length);
		const loaderIds = Object.keys(componentDocLoaders);
		const sortedManifestIds = [...manifestIds].sort();
		const sortedLoaderIds = [...loaderIds].sort();
		expect(sortedManifestIds).toEqual(sortedLoaderIds);
		expect(loaderIds).toHaveLength(sortedManifestIds.length);
		// Deliberate candidate inventory, reviewed together with public API additions.
		expect(manifestIds).toHaveLength(117);
		expect(
			componentCatalogManifest.reduce((total, entry) => total + entry.publicComponentCount, 0)
		).toBe(187);
		expect(manifestIds).toContain('tour');
		expect(componentCatalogManifest.every(({ name }) => /^Z[A-Z]/u.test(name))).toBe(true);
		expect(componentCatalogManifest.find(({ id }) => id === 'link')?.name).toBe('ZLink');
		expect(componentCatalogManifest.find(({ id }) => id === 'separator')?.name).toBe('ZSeparator');
		const provider = componentCatalogManifest.find(({ id }) => id === 'provider');
		expect(provider?.status).toBe('stable');
		expect(provider?.summary).not.toBe('');
		expect(
			componentCatalogManifest.find(({ id }) => id === 'alert')?.keywords.length
		).toBeGreaterThan(0);
		expect(
			componentCatalogManifest.some(
				({ profiles, capabilities }) => profiles.length > 0 && capabilities.length > 0
			)
		).toBe(true);
	});
});
