import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WorkspacePluginArtifactProvider } from '../src/workspace.ts';

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
		await writeFile(
			join(plugin, 'package.json'),
			JSON.stringify({ name: '@zadmin/example', version: '0.0.0' })
		);
		await writeFile(join(dist, 'server', 'index.js'), 'export default {}');
		await writeFile(
			join(dist, 'zadmin.plugin.json'),
			JSON.stringify({
				protocol: 1,
				id: '@zadmin/example',
				version: '0.0.0',
				displayName: 'Example',
				requiredTrust: 'trusted',
				entries: { server: './server/index.js' },
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
	});
});
