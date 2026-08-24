import assert from 'node:assert/strict';
import test from 'node:test';

import { refreshDevtoolsIfStale } from '../config/devtools-refresh.mjs';

test('skips refresh when DevTools already exposes the expected build id', async () => {
	const calls = [];
	const result = await refreshDevtoolsIfStale({
		client: 'fixture',
		execFile: async (/** @type {string} */ _file, /** @type {string[]} */ args) => {
			calls.push(args);
			return { stdout: '{"result":{"result":"build-1"}}\n' };
		},
		expectedBuildId: 'build-1',
		project: 'C:/fixture'
	});
	assert.equal(result.action, 'current');
	assert.equal(calls.length, 1);
});

test('refreshes once when the runtime build id is stale and degrades without a client', async () => {
	const calls = [];
	const result = await refreshDevtoolsIfStale({
		client: 'fixture',
		execFile: async (/** @type {string} */ _file, /** @type {string[]} */ args) => {
			calls.push(args);
			return { stdout: '{"result":{"result":"old"}}\n' };
		},
		expectedBuildId: 'build-2',
		project: 'C:/fixture'
	});
	assert.equal(result.action, 'refreshed');
	assert.equal(calls.length, 2);
	assert.equal(
		(await refreshDevtoolsIfStale({ expectedBuildId: 'build-2', project: 'C:/fixture' })).action,
		'disabled'
	);
});
