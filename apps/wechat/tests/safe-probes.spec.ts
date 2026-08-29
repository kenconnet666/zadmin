import assert from 'node:assert/strict';
import test from 'node:test';

import type { DisposableHandle, WeChatPlatform } from '@zadmin/miniapp/platform';

Object.assign(globalThis, {
	ENABLE_ADJACENT_HTML: true,
	ENABLE_CLONE_NODE: true,
	ENABLE_CONTAINS: true,
	ENABLE_INNER_HTML: true,
	ENABLE_MUTATION_OBSERVER: true,
	ENABLE_SIZE_APIS: true,
	ENABLE_TEMPLATE_CONTENT: true
});

const { runSafeProbe, SAFE_PROBE_WORKER } = await import('../src/pages/capabilities/probes.ts');

type FileSystemManager = ReturnType<WechatMiniprogram.Wx['getFileSystemManager']>;
type Worker = ReturnType<WechatMiniprogram.Wx['createWorker']>;
type WorkerListener = Parameters<Worker['onMessage']>[0];
type ProcessKilledListener = Parameters<Worker['onProcessKilled']>[0];

function fixture(
	options: {
		readonly fileValue?: string;
		readonly unlinkFails?: boolean;
		readonly workerResponds?: boolean;
	} = {}
) {
	const files = new Map<string, string>();
	let messageListener: WorkerListener = () => undefined;
	let processKilledListener: ProcessKilledListener = () => undefined;
	let workerClosed = false;
	let workerPath: string | undefined;
	let checkCalls = 0;
	const fileSystem = {
		access({ fail, path, success }: Parameters<FileSystemManager['access']>[0]) {
			files.has(path)
				? success?.({ errCode: 0, errMsg: 'access:ok' })
				: fail?.({ errCode: -1, errMsg: 'access:fail' });
		},
		readFile({ fail, filePath, success }: Parameters<FileSystemManager['readFile']>[0]) {
			const value = files.get(filePath);
			value === undefined
				? fail?.({ errCode: -1, errMsg: 'readFile:fail' })
				: success?.({ data: options.fileValue ?? value, errMsg: 'readFile:ok' });
		},
		unlink({ fail, filePath, success }: Parameters<FileSystemManager['unlink']>[0]) {
			if (options.unlinkFails === true) {
				fail?.({ errCode: -1, errMsg: 'unlink:fail' });
				return;
			}
			files.delete(filePath)
				? success?.({ errCode: 0, errMsg: 'unlink:ok' })
				: fail?.({ errCode: -1, errMsg: 'unlink:fail' });
		},
		writeFile({ data, filePath, success }: Parameters<FileSystemManager['writeFile']>[0]) {
			files.set(filePath, String(data));
			success?.({ errCode: 0, errMsg: 'writeFile:ok' });
		}
	} as unknown as FileSystemManager;
	const worker = {
		onMessage(listener: WorkerListener) {
			messageListener = listener;
		},
		onProcessKilled(listener: ProcessKilledListener) {
			processKilledListener = listener;
		},
		postMessage(message: Record<string, unknown>) {
			if (options.workerResponds === false) return;
			queueMicrotask(() =>
				messageListener({
					ready: message.payload === 'ping',
					requestId: message.requestId
				} as never)
			);
		},
		terminate() {
			workerClosed = true;
		}
	} as unknown as Worker;
	const handle: DisposableHandle<Worker> = {
		get closed() {
			return workerClosed;
		},
		async close() {
			worker.terminate();
		},
		async dispose() {
			await handle.close();
		},
		value: worker
	};
	const platform = {
		compute: {
			worker(path: string) {
				workerPath = path;
				return handle;
			}
		},
		identity: { checkSession: async () => true },
		raw: { env: { USER_DATA_PATH: '/sandbox' } },
		support: {
			async check() {
				checkCalls += 1;
				return { status: 'available' };
			},
			system: () => ({
				bluetoothEnabled: true,
				deviceOrientation: 'portrait',
				locationEnabled: true,
				wifiEnabled: true
			})
		},
		system: { files: () => fileSystem }
	} as unknown as WeChatPlatform;
	return {
		checkCalls: () => checkCalls,
		files,
		platform,
		processKilled: () => processKilledListener({ message: {} } as never),
		workerClosed: () => workerClosed,
		workerPath: () => workerPath
	};
}

test('safe probes cover support, system, session, files, and worker cleanup', async () => {
	const state = fixture();
	assert.equal(await runSafeProbe(state.platform, 'support'), 'Support probe: available.');
	assert.equal(await runSafeProbe(state.platform, 'system'), 'System probe: settings read passed.');
	assert.equal(await runSafeProbe(state.platform, 'session'), 'Session probe: valid.');
	assert.equal(
		await runSafeProbe(state.platform, 'files'),
		'Files probe: roundtrip and cleanup passed.'
	);
	assert.equal(
		await runSafeProbe(state.platform, 'worker'),
		'Worker probe: roundtrip and terminate passed.'
	);
	assert.equal(state.files.size, 0);
	assert.equal(state.workerPath(), SAFE_PROBE_WORKER);
	assert.equal(state.workerClosed(), true);
	assert.equal(state.checkCalls(), 1);
});

test('files probe removes its temporary file when validation fails', async () => {
	const state = fixture({ fileValue: 'unexpected' });
	await assert.rejects(runSafeProbe(state.platform, 'files'), /unexpected roundtrip value/u);
	assert.equal(state.files.size, 0);
});

test('files probe preserves both operation and cleanup failures', async () => {
	const state = fixture({ fileValue: 'unexpected', unlinkFails: true });
	const error = await runSafeProbe(state.platform, 'files').catch((reason: unknown) => reason);
	assert(error instanceof AggregateError);
	assert.equal(error.errors.length, 2);
});

test('worker probe terminates after the bounded response timeout', async (context) => {
	context.mock.timers.enable({ apis: ['setTimeout'] });
	const state = fixture({ workerResponds: false });
	const pending = runSafeProbe(state.platform, 'worker');
	context.mock.timers.tick(4000);
	await assert.rejects(pending, /response timed out/u);
	assert.equal(state.workerClosed(), true);
});
