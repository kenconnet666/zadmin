import { afterAll, describe, expect, it } from 'vitest';
import { sveltekitPlugin } from '@zadmin/sveltekit';
import { etlRuntime } from './zadmin.js';

afterAll(() => etlRuntime.dispose());

describe('etl plugin composition', () => {
	it('starts all configured plugins', () => {
		expect(etlRuntime.snapshot.plugins).toEqual([
			expect.objectContaining({ id: 'etl', state: 'active' }),
			expect.objectContaining({ id: 'oss', state: 'active' }),
			expect.objectContaining({ id: 'postgres', state: 'active' }),
			expect.objectContaining({ id: 'redis', state: 'active' }),
			expect.objectContaining({ id: 'sveltekit', state: 'active' })
		]);
	});

	it('serves the etl route registered through the plugin lifecycle', async () => {
		const response = await etlRuntime
			.get(sveltekitPlugin)
			.routes.handle(new Request('http://localhost/etl/api/status'));

		expect(await response?.json()).toEqual({ plugin: 'etl', status: 'active' });
	});
});
