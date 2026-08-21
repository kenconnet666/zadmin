import { afterAll, describe, expect, it } from 'vitest';
import { sveltekitPlugin } from '@zadmin/sveltekit';
import { adminRuntime } from './zadmin.js';

afterAll(() => adminRuntime.dispose());

describe('admin plugin composition', () => {
	it('starts all configured plugins', () => {
		expect(adminRuntime.snapshot.plugins).toEqual([
			expect.objectContaining({ id: 'auth', state: 'active' }),
			expect.objectContaining({ id: 'oss', state: 'active' }),
			expect.objectContaining({ id: 'postgres', state: 'active' }),
			expect.objectContaining({ id: 'redis', state: 'active' }),
			expect.objectContaining({ id: 'sveltekit', state: 'active' })
		]);
	});

	it('serves the auth route registered through the plugin lifecycle', async () => {
		const response = await adminRuntime
			.get(sveltekitPlugin)
			.routes.handle(new Request('http://localhost/auth/api/status'));

		expect(await response?.json()).toEqual({ plugin: 'auth', status: 'active' });
	});
});
