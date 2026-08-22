import { describe, expect, it } from 'vitest';
import type { PluginArtifact } from '../src/artifact/types.ts';
import { inject } from '../src/container/injection.ts';
import { defineModule } from '../src/container/module.ts';
import { provideValue } from '../src/container/provider.ts';
import { token } from '../src/container/token.ts';
import { parsePluginManifest } from '../src/artifact/manifest.ts';
import { PluginManager } from '../src/plugin/manager.ts';
import { defineApp } from '../src/plugin/definition.ts';
import { PluginRuntime } from '../src/plugin/runtime.ts';

describe('PluginManager', () => {
	it('loads artifact revisions and retains the active revision after a failed replacement', async () => {
		const runtime = new PluginRuntime();
		await runtime.reconcile(defineApp({ id: 'manager-test', plugins: [] }));
		const manager = managerForTests(runtime, 'manager-test');
		const v1 = artifact('revision-1', 'return { revision: "revision-1" }');
		await manager.reconcile([v1]);
		expect(runtime.snapshot.plugins[0]).toMatchObject({
			id: '@zadmin/example',
			revision: 'revision-1',
			state: 'active'
		});

		const broken = artifact('revision-2', 'throw new Error("broken revision")');
		await expect(manager.reconcile([broken])).rejects.toThrow('Failed to prepare service');

		expect(manager.artifacts).toEqual([v1]);
		expect(runtime.snapshot.plugins[0]).toMatchObject({
			revision: 'revision-1',
			state: 'active'
		});
		await runtime.dispose();
	});

	it('publishes a client-only revision without rebuilding the server generation', async () => {
		const runtime = new PluginRuntime();
		await runtime.reconcile(defineApp({ id: 'manager-client', plugins: [] }));
		const manager = managerForTests(runtime, 'manager-client');
		const initial = artifact('server-one', 'return { revision: "server-one" }');
		await manager.reconcile([initial]);
		const server = runtime.resolve(inject<{ revision: string }>('@zadmin/example'));
		const clientOnly: PluginArtifact = Object.freeze({
			...initial,
			revision: 'full-two',
			clientRevision: 'client-two',
			clientEntry: new URL('data:text/javascript,export function activate() {}')
		});

		await manager.reconcile([clientOnly]);
		expect(runtime.resolve(inject<{ revision: string }>('@zadmin/example'))).toBe(server);
		expect(manager.artifacts[0]?.clientRevision).toBe('client-two');
		await runtime.dispose();
	});

	it('injects host capabilities into a dynamically imported artifact', async () => {
		const hostToken = token<{ readonly value: number }>('@zadmin/host-value');
		const host = defineModule({
			id: hostToken.id,
			version: '1.0.0',
			primary: hostToken,
			exports: [hostToken],
			providers: [provideValue(hostToken, { value: 42 })]
		});
		const runtime = new PluginRuntime({ modules: [host] });
		await runtime.reconcile(defineApp({ id: 'manager-host', plugins: [] }));
		const manager = managerForTests(runtime, 'manager-host');
		await manager.reconcile([
			artifact(
				'host-revision',
				'return dependencies.host',
				{ '@zadmin/host-value': '1.0.0' },
				`{ id: '@zadmin/host-value', token: { id: '@zadmin/host-value' }, optional: false, kind: 'service' }`
			)
		]);

		expect(runtime.resolve(inject<{ value: number }>('@zadmin/example')).value).toBe(42);
		await runtime.dispose();
	});

	it('keeps client artifacts hidden while required server services are unavailable', async () => {
		const runtime = new PluginRuntime();
		await runtime.reconcile(defineApp({ id: 'manager-waiting', plugins: [] }));
		const manager = managerForTests(runtime, 'manager-waiting');
		await manager.reconcile([
			artifact(
				'waiting-revision',
				'return dependencies.host',
				{ '@zadmin/missing': '^1.0.0' },
				`{ id: '@zadmin/missing', token: { id: '@zadmin/missing' }, optional: false, kind: 'service' }`
			)
		]);

		expect(runtime.snapshot.plugins[0]).toMatchObject({ state: 'waiting' });
		expect(manager.artifacts).toHaveLength(1);
		expect(manager.activeArtifacts).toEqual([]);
		await runtime.dispose();
	});
});

function managerForTests(runtime: PluginRuntime, appId: string): PluginManager {
	return new PluginManager(runtime, appId, {
		importModule: async (url) => (await import(url)) as Record<string, unknown>
	});
}

function artifact(
	revision: string,
	createBody: string,
	requires: Record<string, string> = {},
	injection = ''
): PluginArtifact {
	const dependencies = injection ? `{ host: ${injection} }` : '{}';
	const module = `
const token = { id: '@zadmin/example' }
const provider = {
  token,
  dependencies: ${dependencies},
  source: 'factory',
  create(_context, dependencies) { ${createBody} },
  prepare(value) {
    if (value && value.revision === 'revision-2') throw new Error('broken revision')
  }
}
export default {
  plugin: true,
  id: '@zadmin/example',
  version: '0.0.0',
  primary: token,
  providers: [provider],
  exports: [token],
  defaultConfig: undefined,
  configure(config) { return { plugin: this, config } }
}`;
	const manifest = parsePluginManifest({
		protocol: 2,
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
		serverRevision: revision,
		root: 'memory',
		manifest,
		serverEntry: new URL(`data:text/javascript,${encodeURIComponent(module)}`)
	});
}
