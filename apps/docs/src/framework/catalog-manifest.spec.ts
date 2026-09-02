import { describe, expect, it } from 'vitest';

import { componentCatalogManifest } from './catalog-manifest.generated.js';
import { componentDocLoaders } from './component-doc-loaders.generated.js';

describe('generated component catalog manifest', () => {
	it('keeps manifest, lazy loaders and catalog ids aligned', () => {
		const manifestIds = componentCatalogManifest.map(({ id }) => id);
		expect(new Set(manifestIds).size).toBe(manifestIds.length);
		expect(Object.keys(componentDocLoaders).sort()).toEqual([...manifestIds].sort());
		expect(manifestIds).toHaveLength(79);
		expect(manifestIds).toContain('tour');
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
