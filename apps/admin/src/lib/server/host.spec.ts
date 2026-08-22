import { afterAll, describe, expect, it } from 'vitest';
import { adminHost } from './host.js';

afterAll(() => adminHost.dispose());

describe('admin host composition', () => {
	it('provides the configured static capabilities', () => {
		expect(adminHost.runtime.snapshot.plugins).toEqual([]);
		expect(adminHost.runtime.snapshot.providers).toEqual([
			expect.objectContaining({ id: '@zadmin/auth', owner: 'host' }),
			expect.objectContaining({ id: '@zadmin/oss', owner: 'host' }),
			expect.objectContaining({ id: '@zadmin/postgres', owner: 'host' }),
			expect.objectContaining({ id: '@zadmin/redis', owner: 'host' }),
			expect.objectContaining({ id: '@zadmin/sveltekit', owner: 'host' })
		]);
	});

	it('serves the auth route registered by the static package', async () => {
		const response = await adminHost.web.routes.handle(
			new Request('http://localhost/auth/api/status')
		);

		expect(await response?.json()).toEqual({ package: '@zadmin/auth', status: 'active' });
	});
});
