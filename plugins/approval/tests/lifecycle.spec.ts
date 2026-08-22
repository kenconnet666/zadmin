import { describe, expect, it } from 'vitest';
import { defineApp, PluginRuntime } from '@zadmin/core';
import { authModule } from '@zadmin/auth';
import { postgresModule } from '@zadmin/postgres';
import { redisModule } from '@zadmin/redis';
import { SVELTEKIT, sveltekitModule } from '@zadmin/sveltekit';
import approvalPlugin from '../src/server/index.ts';

describe('approval plugin', () => {
	it('registers and removes its route with the plugin lifecycle', async () => {
		const runtime = new PluginRuntime({
			modules: [sveltekitModule, postgresModule, redisModule, authModule]
		});

		await runtime.reconcile(defineApp({ id: 'approval-test', plugins: [approvalPlugin] }));
		const web = runtime.resolve(SVELTEKIT);
		const active = await web.routes.handle(new Request('http://localhost/approval/api/status'));
		expect(await active?.json()).toMatchObject({ plugin: '@zadmin/approval', status: 'active' });

		await runtime.stop(approvalPlugin.id);
		expect(
			await web.routes.handle(new Request('http://localhost/approval/api/status'))
		).toBeUndefined();
		await runtime.dispose();
	});
});
