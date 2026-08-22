import { describe, expect, it } from 'vitest';
import { defineApp, PluginRuntime } from '@zadmin/core';
import { createSvelteKitHost } from '@zadmin/sveltekit';
import approvalPlugin from '../src/server/index.ts';

describe('approval plugin', () => {
	it('registers and removes its route with the plugin lifecycle', async () => {
		const web = createSvelteKitHost();
		const runtime = new PluginRuntime();
		runtime.provide({ id: '@zadmin/sveltekit', version: '0.0.0', value: web });
		runtime.provide({ id: '@zadmin/auth', version: '0.0.0', value: { provider: 'auth' } });
		runtime.provide({ id: '@zadmin/postgres', version: '0.0.0', value: { driver: 'postgres' } });

		await runtime.reconcile(defineApp({ id: 'approval-test', plugins: [approvalPlugin] }));
		const active = await web.routes.handle(new Request('http://localhost/approval/api/status'));
		expect(await active?.json()).toMatchObject({ plugin: '@zadmin/approval', status: 'active' });

		await runtime.stop(approvalPlugin.id);
		expect(
			await web.routes.handle(new Request('http://localhost/approval/api/status'))
		).toBeUndefined();
	});
});
