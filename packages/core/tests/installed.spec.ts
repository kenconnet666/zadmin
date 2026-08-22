import { afterEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as tar from 'tar';
import {
	InstalledPluginArtifactProvider,
	packPluginArtifact,
	PluginInstaller
} from '../src/installed.ts';

const roots: string[] = [];

afterEach(async () => {
	await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('PluginInstaller', () => {
	it('installs, disables, enables, upgrades, rolls back and uninstalls artifacts', async () => {
		const root = await temporaryRoot();
		const data = join(root, 'data');
		const installer = new PluginInstaller({ root: data });
		const provider = new InstalledPluginArtifactProvider({ root: data });
		const v1 = await fixtureArchive(root, '0.1.0', 'v1');
		const v2 = await fixtureArchive(root, '0.2.0', 'v2');

		await expect(installer.install(v1)).resolves.toMatchObject({ version: '0.1.0' });
		expect((await provider.scan())[0]).toMatchObject({ version: '0.1.0' });

		await installer.disable('@zadmin/example');
		expect(await provider.scan()).toEqual([]);
		await installer.enable('@zadmin/example');
		expect(await provider.scan()).toHaveLength(1);

		await installer.install(v2);
		expect((await provider.scan())[0]).toMatchObject({ version: '0.2.0' });
		await installer.activate('@zadmin/example', '0.1.0');
		expect((await provider.scan())[0]).toMatchObject({ version: '0.1.0' });

		await installer.uninstall('@zadmin/example');
		expect(await provider.scan()).toEqual([]);
		expect(JSON.parse(await readFile(join(data, 'installed.json'), 'utf8')).plugins).toEqual({});
	});

	it('rejects archive path traversal before extraction', async () => {
		const root = await temporaryRoot();
		const source = join(root, 'unsafe-source');
		await mkdir(source);
		await writeFile(join(source, 'payload.js'), 'unsafe');
		const archive = join(root, 'unsafe.zplugin');
		await tar.c({ file: archive, cwd: source, gzip: true, prefix: '../escape' }, ['payload.js']);
		const installer = new PluginInstaller({ root: join(root, 'data') });

		await expect(installer.install(archive)).rejects.toThrow('Unsafe plugin archive entry');
	});
});

async function temporaryRoot(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'zadmin-installer-'));
	roots.push(root);
	return root;
}

async function fixtureArchive(root: string, version: string, content: string): Promise<string> {
	const source = join(root, `source-${version}`);
	await mkdir(join(source, 'server'), { recursive: true });
	await writeFile(join(source, 'server', 'index.js'), `export default ${JSON.stringify(content)}`);
	await writeFile(
		join(source, 'zadmin.plugin.json'),
		JSON.stringify({
			protocol: 1,
			id: '@zadmin/example',
			version,
			displayName: 'Example',
			requiredTrust: 'trusted',
			entries: { server: './server/index.js' },
			requiresHost: {},
			requires: {},
			optional: {}
		})
	);
	const archive = join(root, `example-${version}.zplugin`);
	await packPluginArtifact(source, archive);
	return archive;
}
