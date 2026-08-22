import { describe, expect, it } from 'vitest';
import { defineApp, PluginRuntime } from '@zadmin/core';
import { authModule } from '@zadmin/auth';
import { postgresModule } from '@zadmin/postgres';
import { redisModule } from '@zadmin/redis';
import { SVELTEKIT, sveltekitModule } from '@zadmin/sveltekit';
import approvalPlugin from '../../approval/src/server/index.ts';
import erpPlugin from '../src/server/index.ts';

describe('erp plugin', () => {
	it('runs without approval and reinjects it when available', async () => {
		const runtime = new PluginRuntime({
			modules: [sveltekitModule, postgresModule, redisModule, authModule]
		});

		await runtime.reconcile(defineApp({ id: 'erp-test', plugins: [erpPlugin] }));
		const web = runtime.resolve(SVELTEKIT);
		const withoutApproval = await web.routes.handle(new Request('http://localhost/erp/api/status'));
		expect(await withoutApproval?.json()).not.toHaveProperty('approval');

		await runtime.reconcile(defineApp({ id: 'erp-test', plugins: [erpPlugin, approvalPlugin] }));
		const withApproval = await web.routes.handle(new Request('http://localhost/erp/api/status'));
		expect(await withApproval?.json()).toMatchObject({ approval: 'approval:erp-check' });
		await runtime.dispose();
	});
});
