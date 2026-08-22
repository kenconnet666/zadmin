import { describe, expect, it, vi } from 'vitest';
import type { ClientPluginModule } from '../src/lib/pages.ts';
import { ClientPluginRuntime, type ClientPluginArtifact } from '../src/lib/client-runtime.ts';

describe('ClientPluginRuntime', () => {
	it('replaces owned pages and rolls back a failed client revision', async () => {
		const disposed = vi.fn();
		const modules = new Map<string, ClientPluginModule>([
			['one', module('/one', disposed)],
			['two', module('/two')],
			[
				'broken',
				{
					activate(context) {
						context.pages.register({
							path: '/partial',
							mount: () => () => undefined
						});
						throw new Error('broken client');
					}
				}
			]
		]);
		const runtime = new ClientPluginRuntime({
			async importModule(artifact) {
				return modules.get(artifact.revision)!;
			}
		});

		await runtime.reconcile([artifact('one')]);
		expect(runtime.pages.paths).toEqual(['/one']);

		await runtime.reconcile([artifact('two')]);
		expect(disposed).toHaveBeenCalledOnce();
		expect(runtime.pages.paths).toEqual(['/two']);

		await expect(runtime.reconcile([artifact('broken')])).rejects.toThrow('broken client');
		expect(runtime.pages.paths).toEqual(['/two']);
		expect(runtime.artifacts[0]?.revision).toBe('two');
	});

	it('rejects duplicate page ownership', () => {
		const runtime = new ClientPluginRuntime();
		runtime.pages.forOwner('one').register({ path: '/shared', mount: () => () => undefined });
		expect(() =>
			runtime.pages.forOwner('two').register({ path: '/shared', mount: () => () => undefined })
		).toThrow('already owned');
	});
});

function artifact(revision: string): ClientPluginArtifact {
	return { id: '@zadmin/client-test', revision, url: `/client.js?source=${revision}` };
}

function module(path: string, onDispose: () => void = () => undefined): ClientPluginModule {
	return {
		activate(context) {
			const disposePage = context.pages.register({ path, mount: () => () => undefined });
			return () => {
				disposePage();
				onDispose();
			};
		}
	};
}
