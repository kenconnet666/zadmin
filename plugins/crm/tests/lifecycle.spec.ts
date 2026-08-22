import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ApprovalRecord } from '@zadmin/approval';
import { defineApp, PluginRuntime } from '@zadmin/core';
import type { PluginApi } from '@zadmin/core/plugin';
import { authModule } from '@zadmin/auth';
import { postgresModule } from '@zadmin/postgres';
import { redisModule } from '@zadmin/redis';
import { SVELTEKIT, sveltekitModule } from '@zadmin/sveltekit';
import crmPlugin, { type CrmPlugin } from '../src/server/index.ts';

describe('crm plugin', () => {
	it('carries its upstream plugin types through the CRM plugin API', () => {
		expectTypeOf<PluginApi<CrmPlugin>['startApproval']>().returns.toEqualTypeOf<
			ApprovalRecord | undefined
		>();
	});

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
