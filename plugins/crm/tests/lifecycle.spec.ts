import { describe, expect, it } from 'vitest';
import { defineApp, PluginRuntime } from '@zadmin/core';
import { authModule } from '@zadmin/auth';
import { postgresModule } from '@zadmin/postgres';
import { redisModule } from '@zadmin/redis';
import { SVELTEKIT, sveltekitModule } from '@zadmin/sveltekit';
import crmPlugin from '../src/server/index.ts';

describe('crm plugin', () => {
	it('starts without its optional approval capability', async () => {
		const runtime = new PluginRuntime({
			modules: [sveltekitModule, postgresModule, redisModule, authModule]
		});

		await runtime.reconcile(defineApp({ id: 'crm-test', plugins: [crmPlugin] }));
		const web = runtime.resolve(SVELTEKIT);
		const response = await web.routes.handle(new Request('http://localhost/crm/api/status'));
		expect(await response?.json()).toMatchObject({ plugin: '@zadmin/crm', status: 'active' });
		await runtime.dispose();
	});
});
