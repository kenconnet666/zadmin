import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import { BuildStatusStore } from '../config/status.mjs';

test('records build ids only on success and keeps a JSONL event trail', async () => {
	const root = await mkdtemp(resolve(tmpdir(), 'zadmin-wechat-status-'));
	const dates = [
		new Date('2026-08-25T00:00:00.000Z'),
		new Date('2026-08-25T00:00:00.100Z'),
		new Date('2026-08-25T00:00:00.200Z'),
		new Date('2026-08-25T00:00:00.300Z'),
		new Date('2026-08-25T00:00:00.400Z'),
		new Date('2026-08-25T00:00:00.500Z'),
		new Date('2026-08-25T00:00:00.600Z'),
		new Date('2026-08-25T00:00:00.700Z'),
		new Date('2026-08-25T00:00:00.800Z')
	];
	const store = new BuildStatusStore(root, () => dates.shift() ?? new Date());
	try {
		await store.initialize(4);
		await Promise.all([store.begin('Button.svelte'), store.begin('Button.svelte')]);
		await store.failure('compile failed');
		assert.equal(store.snapshot.buildId, null);
		await store.begin('Button.svelte');
		await store.success('build-2');
		assert.equal(store.snapshot.buildId, 'build-2');
		assert.equal(store.snapshot.success, true);
		const persisted = JSON.parse(
			await readFile(resolve(root, '.wechat/build-status.json'), 'utf8')
		);
		assert.equal(persisted.buildId, 'build-2');
		const events = (await readFile(resolve(root, '.wechat/build-events.jsonl'), 'utf8'))
			.trim()
			.split('\n')
			.map((line) => JSON.parse(line));
		assert.ok(events.length >= 5);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});
