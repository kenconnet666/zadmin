import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WorkspacePluginArtifactProvider } from '../src/artifact/workspace.ts';

const roots: string[] = [];

afterEach(async () => {
	await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('WorkspacePluginArtifactProvider', () => {
	it('discovers built plugin directories and revisions their content', async () => {
		const root = await mkdtemp(join(tmpdir(), 'zadmin-workspace-provider-'));
		roots.push(root);
		const plugin = join(root, 'example');
		const dist = join(plugin, 'dist');
		await mkdir(join(dist, 'server'), { recursive: true });
		await mkdir(join(dist, 'client'), { recursive: true });
		await writeFile(
			join(plugin, 'package.json'),
			JSON.stringify({ name: '@zadmin/example', version: '0.0.0' })
		);
		await writeFile(join(dist, 'server', 'index.js'), 'export default {}');
		await writeFile(join(dist, 'client', 'index.js'), 'export function activate() {}');
		await writeFile(
			join(dist, 'zadmin.plugin.json'),
			JSON.stringify({
				protocol: 2,
				id: '@zadmin/example',
				version: '0.0.0',
				displayName: 'Example',
				requiredTrust: 'trusted',
				entries: { server: './server/index.js', client: './client/index.js' },
				requiresHost: {},
				requires: {},
				optional: {}
			})
		);
		const provider = new WorkspacePluginArtifactProvider({ roots: [root] });
		const [first] = await provider.scan();
		expect(first).toMatchObject({ id: '@zadmin/example', version: '0.0.0' });

		await writeFile(join(dist, 'server', 'index.js'), 'export default { changed: true }');
		const [second] = await provider.scan();
		expect(second?.revision).not.toBe(first?.revision);
		expect(second?.serverRevision).not.toBe(first?.serverRevision);
		expect(second?.clientRevision).toBe(first?.clientRevision);

		await writeFile(join(dist, 'client', 'index.js'), 'export function activate() { return 1 }');
		const [third] = await provider.scan();
		expect(third?.serverRevision).toBe(second?.serverRevision);
		expect(third?.clientRevision).not.toBe(second?.clientRevision);
	});
});
