import { describe, expect, it } from 'vitest';
import { GET, _status } from './+server.js';

describe('ETL status', () => {
	it('describes the standalone application', () => {
		expect(_status).toEqual({ app: 'etl', status: 'active' });
	});

	it('serves the status endpoint', async () => {
		const response = await GET({} as never);
		expect(response).toBeInstanceOf(Response);
		expect(await (response as Response).json()).toEqual(_status);
	});
});
