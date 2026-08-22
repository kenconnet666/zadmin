import { describe, expect, it } from 'vitest';
import { defineApp, PluginRuntime } from '@zadmin/core';
import { createSvelteKitHost } from '@zadmin/sveltekit';
import approvalPlugin from '../../approval/src/server/index.ts';
import erpPlugin from '../src/server/index.ts';

describe('erp plugin', () => {
	it('runs without approval and reinjects it when available', async () => {
		const web = createSvelteKitHost();
		const runtime = new PluginRuntime();
		runtime.provide({ id: '@zadmin/sveltekit', version: '0.0.0', value: web });
		runtime.provide({ id: '@zadmin/auth', version: '0.0.0', value: { provider: 'auth' } });
		runtime.provide({ id: '@zadmin/postgres', version: '0.0.0', value: { driver: 'postgres' } });

		await runtime.reconcile(defineApp({ id: 'erp-test', plugins: [erpPlugin] }));
		const withoutApproval = await web.routes.handle(new Request('http://localhost/erp/api/status'));
		expect(await withoutApproval?.json()).not.toHaveProperty('approval');

		await runtime.reconcile(defineApp({ id: 'erp-test', plugins: [erpPlugin, approvalPlugin] }));
		const withApproval = await web.routes.handle(new Request('http://localhost/erp/api/status'));
		expect(await withApproval?.json()).toMatchObject({ approval: 'approval:erp-check' });
	});
});
