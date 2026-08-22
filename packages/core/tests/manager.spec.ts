import { describe, expect, it } from 'vitest';
import type { PluginArtifact } from '../src/artifact.ts';
import { inject } from '../src/injection.ts';
import { PluginManager } from '../src/manager.ts';
import { parsePluginManifest } from '../src/manifest.ts';
import { PluginRuntime } from '../src/runtime.ts';

describe('PluginManager', () => {
	it('loads artifact revisions and rolls back a failed replacement', async () => {
		const runtime = new PluginRuntime();
		const manager = managerForTests(runtime, 'manager-test');
		const v1 = artifact('revision-1', 'return { revision: "revision-1" }');
		await manager.reconcile([v1]);
		expect(runtime.snapshot.plugins[0]).toMatchObject({
			id: '@zadmin/example',
			artifactRevision: 'revision-1',
			state: 'active'
		});

		const broken = artifact('revision-2', 'throw new Error("broken revision")');
		await expect(manager.reconcile([broken])).rejects.toThrow('activation failed');

		expect(manager.artifacts).toEqual([v1]);
		expect(runtime.snapshot.plugins[0]).toMatchObject({
			artifactRevision: 'revision-1',
			state: 'active'
		});
	});

	it('injects host capabilities into a dynamically imported artifact', async () => {
		const runtime = new PluginRuntime();
		runtime.provide({ id: 'host-value', version: '1.0.0', value: { value: 42 } });
		const manager = managerForTests(runtime, 'manager-host');
		const source = `
const injection = { id: 'host-value', optional: false }
export default {
  id: '@zadmin/example',
  dependencies: { host: injection },
  defaultConfig: undefined,
  setup(_context, dependencies) { return dependencies.host },
  configure(config) { return { plugin: this, config } }
}`;
		await manager.reconcile([
			artifact('host-revision', undefined, source, { 'host-value': '1.0.0' })
		]);

		expect(runtime.resolve(inject<{ value: number }>('@zadmin/example')).value).toBe(42);
	});
});

function managerForTests(runtime: PluginRuntime, appId: string): PluginManager {
	return new PluginManager(runtime, appId, {
		importModule: async (url) => (await import(url)) as Record<string, unknown>
	});
}

function artifact(
	revision: string,
	setupBody?: string,
	source?: string,
	requires: Record<string, string> = {}
): PluginArtifact {
	const module =
		source ??
		`export default {
  id: '@zadmin/example',
  dependencies: {},
  defaultConfig: undefined,
  setup() { ${setupBody} },
  configure(config) { return { plugin: this, config } }
}`;
	const manifest = parsePluginManifest({
		protocol: 1,
		id: '@zadmin/example',
		version: '0.0.0',
		displayName: 'Example',
		requiredTrust: 'trusted',
		entries: { server: './server/index.js' },
		requiresHost: {},
		requires,
		optional: {}
	});
	return Object.freeze({
		id: manifest.id,
		version: manifest.version,
		revision,
		root: 'memory',
		manifest,
		serverEntry: new URL(`data:text/javascript,${encodeURIComponent(module)}`)
	});
}
