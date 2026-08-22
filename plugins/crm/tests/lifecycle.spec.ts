import { describe, expect, it } from 'vitest';
import { defineApp, PluginRuntime } from '@zadmin/core';
import { createSvelteKitHost } from '@zadmin/sveltekit';
import crmPlugin from '../src/server/index.ts';

describe('crm plugin', () => {
	it('starts without its optional approval capability', async () => {
		const web = createSvelteKitHost();
		const runtime = new PluginRuntime();
		runtime.provide({ id: '@zadmin/sveltekit', version: '0.0.0', value: web });
		runtime.provide({ id: '@zadmin/auth', version: '0.0.0', value: { provider: 'auth' } });
		runtime.provide({ id: '@zadmin/postgres', version: '0.0.0', value: { driver: 'postgres' } });

		await runtime.reconcile(defineApp({ id: 'crm-test', plugins: [crmPlugin] }));
		const response = await web.routes.handle(new Request('http://localhost/crm/api/status'));
		expect(await response?.json()).toMatchObject({ plugin: '@zadmin/crm', status: 'active' });
	});
});
