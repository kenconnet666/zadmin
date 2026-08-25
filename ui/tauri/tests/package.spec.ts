import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('@zadmin/tauri package', () => {
	it('keeps root, Svelte, and testing exports explicit', async () => {
		const manifest = JSON.parse(
			await readFile(resolve(import.meta.dirname, '../package.json'), 'utf8')
		);
		expect(manifest.name).toBe('@zadmin/tauri');
		expect(manifest.exports).toHaveProperty('.');
		expect(manifest.exports).toHaveProperty('./svelte');
		expect(manifest.exports).toHaveProperty('./testing');
	});
});
