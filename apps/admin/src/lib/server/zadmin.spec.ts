import { afterAll, describe, expect, it } from 'vitest';
import { sveltekitPlugin } from '@zadmin/sveltekit';
import { adminRuntime } from './zadmin.js';

afterAll(() => adminRuntime.dispose());

describe('admin plugin composition', () => {
	it('starts all configured plugins', () => {
		expect(adminRuntime.snapshot.plugins).toEqual([
			expect.objectContaining({ id: '@zadmin/auth', state: 'active' }),
			expect.objectContaining({ id: '@zadmin/oss', state: 'active' }),
			expect.objectContaining({ id: '@zadmin/postgres', state: 'active' }),
			expect.objectContaining({ id: '@zadmin/redis', state: 'active' }),
			expect.objectContaining({ id: '@zadmin/sveltekit', state: 'active' })
		]);
	});

	it('serves the auth route registered through the plugin lifecycle', async () => {
		const response = await adminRuntime
			.get(sveltekitPlugin)
			.routes.handle(new Request('http://localhost/auth/api/status'));

		expect(await response?.json()).toEqual({ plugin: 'auth', status: 'active' });
	});
});
