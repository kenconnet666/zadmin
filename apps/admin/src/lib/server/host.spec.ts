import { afterAll, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packPluginArtifact } from '@zadmin/core';
import { adminHost, createAdminHost } from './host.js';

afterAll(() => adminHost.dispose());

describe('admin host composition', () => {
	it('provides the configured static capabilities', () => {
		expect(adminHost.runtime.snapshot.plugins).toEqual([]);
		expect(adminHost.runtime.snapshot.modules).toEqual([
			expect.objectContaining({ id: '@zadmin/auth', kind: 'host', state: 'active' }),
			expect.objectContaining({ id: '@zadmin/oss', kind: 'host', state: 'active' }),
			expect.objectContaining({ id: '@zadmin/postgres', kind: 'host', state: 'active' }),
			expect.objectContaining({ id: '@zadmin/redis', kind: 'host', state: 'active' }),
			expect.objectContaining({ id: '@zadmin/sveltekit', kind: 'host', state: 'active' })
		]);
	});

	it('serves the auth route registered by the static package', async () => {
		const response = await adminHost.web.routes.handle(
			new Request('http://localhost/auth/api/status')
		);

		expect(await response?.json()).toEqual({ package: '@zadmin/auth', status: 'active' });
	});

	it('rolls installation state back when a plugin cannot enter the runtime', async () => {
		const root = await mkdtemp(join(tmpdir(), 'zadmin-admin-host-'));
		const source = join(root, 'artifact');
		const archive = join(root, 'broken.zplugin');
		await mkdir(join(source, 'server'), { recursive: true });
		await writeFile(join(source, 'server', 'index.js'), 'export default "not a plugin"');
		await writeFile(
			join(source, 'zadmin.plugin.json'),
			JSON.stringify({
				protocol: 2,
				id: '@zadmin/broken',
				version: '1.0.0',
				displayName: 'Broken',
				requiredTrust: 'trusted',
				entries: { server: './server/index.js' },
				requiresHost: {},
				requires: {},
				optional: {}
			})
		);
		await packPluginArtifact(source, archive);
		const host = await createAdminHost({
			enableInstalledPlugins: false,
			pluginDataRoot: join(root, 'data')
		});
		try {
			await expect(host.mutatePlugins(() => host.installer.install(archive))).rejects.toThrow();
			expect((await host.installer.read()).plugins).toEqual({});
			expect(host.runtime.snapshot.plugins).toEqual([]);
		} finally {
			await host.dispose();
			await rm(root, { recursive: true, force: true });
		}
	});
});
