import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

async function json(path: string): Promise<Record<string, unknown>> {
	return JSON.parse(await readFile(resolve(import.meta.dirname, path), 'utf8'));
}

describe('desktop production security configuration', () => {
	it('grants only the Windows main window narrow permissions', async () => {
		const capability = await json('../../src-tauri/capabilities/desktop-main.json');
		expect(capability.windows).toEqual(['main']);
		expect(capability.platforms).toEqual(['windows']);

		const permissions = capability.permissions as Array<string | { identifier: string }>;
		const identifiers = permissions.map((permission) =>
			typeof permission === 'string' ? permission : permission.identifier
		);
		expect(identifiers).toEqual(
			expect.arrayContaining([
				'allow-desktop-channel-probe',
				'allow-desktop-error-probe',
				'allow-desktop-runtime-report'
			])
		);
		expect(
			identifiers.filter((identifier) =>
				/(?:^|:)(?:default|shell|updater|http)(?:$|:)/u.test(identifier)
			)
		).toEqual([]);
		expect(identifiers.some((identifier) => identifier.includes('*'))).toBe(false);
	});

	it('limits filesystem and opener scopes to explicit safe values', async () => {
		const capability = await json('../../src-tauri/capabilities/desktop-main.json');
		const permissions = capability.permissions as Array<
			string | { allow?: Array<Record<string, string>>; identifier: string }
		>;
		const filesystem = permissions.find(
			(permission) => typeof permission !== 'string' && permission.identifier === 'fs:scope'
		);
		const opener = permissions.find(
			(permission) =>
				typeof permission !== 'string' && permission.identifier === 'opener:allow-open-url'
		);
		expect(filesystem).toMatchObject({
			allow: expect.arrayContaining([
				{ path: '$APPDATA/zadmin/**/*' },
				{ path: '$APPCACHE/zadmin/**/*' }
			])
		});
		expect(JSON.stringify(filesystem)).not.toMatch(/\$HOME|C:\\\\|\*\*\/\*\*/u);
		expect(opener).toMatchObject({
			allow: [{ url: 'https://github.com/**' }, { url: 'https://v2.tauri.app/**' }]
		});
	});

	it('ships local static assets with strict runtime and current-user NSIS', async () => {
		const config = await json('../../src-tauri/tauri.conf.json');
		const app = config.app as Record<string, unknown>;
		const security = app.security as Record<string, unknown>;
		const bundle = config.bundle as Record<string, unknown>;
		const windows = bundle.windows as Record<string, unknown>;
		const nsis = windows.nsis as Record<string, unknown>;

		expect(config.build).toMatchObject({ frontendDist: '../build' });
		expect(app.withGlobalTauri).toBe(false);
		expect(security.capabilities).toEqual(['desktop-main']);
		expect(security.csp).not.toContain('unsafe-eval');
		expect(bundle.targets).toEqual(['nsis']);
		expect(nsis.installMode).toBe('currentUser');
	});
});
