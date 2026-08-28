import type Taro from '@tarojs/taro';
import {
	wechatCapabilities,
	type DisposableHandle,
	type WeChatPlatform
} from '@zadmin/miniapp/platform';

export type SafeProbeName = 'files' | 'session' | 'support' | 'system' | 'worker';

export const SAFE_PROBE_WORKER = 'workers/safe-probe.js';

function accessFile(files: Taro.FileSystemManager, filePath: string): Promise<boolean> {
	return new Promise((resolve) => {
		files.access({ fail: () => resolve(false), path: filePath, success: () => resolve(true) });
	});
}

function readFile(files: Taro.FileSystemManager, filePath: string): Promise<string | ArrayBuffer> {
	return new Promise((resolve, reject) => {
		files.readFile({
			encoding: 'utf8',
			fail: reject,
			filePath,
			success: ({ data }) => resolve(data)
		});
	});
}

function unlinkFile(files: Taro.FileSystemManager, filePath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		files.unlink({ fail: reject, filePath, success: () => resolve() });
	});
}

function writeFile(files: Taro.FileSystemManager, filePath: string, data: string): Promise<void> {
	return new Promise((resolve, reject) => {
		files.writeFile({ data, encoding: 'utf8', fail: reject, filePath, success: () => resolve() });
	});
}

async function runFilesProbe(platform: WeChatPlatform): Promise<string> {
	const root = platform.raw.env.USER_DATA_PATH;
	if (typeof root !== 'string' || root.length === 0) {
		throw new Error('Files probe: USER_DATA_PATH is unavailable.');
	}
	const filePath = `${root}/__zadmin_safe_probe_${Date.now()}_${Math.random().toString(36).slice(2)}.txt`;
	const payload = 'zadmin-safe-file-probe';
	const files = platform.system.files();
	let written = false;
	const errors: unknown[] = [];
	try {
		await writeFile(files, filePath, payload);
		written = true;
		if ((await readFile(files, filePath)) !== payload) {
			throw new Error('Files probe: unexpected roundtrip value.');
		}
	} catch (error) {
		errors.push(error);
	}
	if (written) {
		try {
			await unlinkFile(files, filePath);
			if (await accessFile(files, filePath)) {
				throw new Error('Files probe: cleanup verification failed.');
			}
		} catch (error) {
			errors.push(error);
		}
	}
	if (errors.length === 1) throw errors[0];
	if (errors.length > 1) throw new AggregateError(errors, 'Files probe and cleanup failed.');
	return 'Files probe: roundtrip and cleanup passed.';
}

function workerRoundtrip(handle: DisposableHandle<Taro.Worker>): Promise<void> {
	return new Promise((resolve, reject) => {
		const requestId = `safe-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		let settled = false;
		const finish = (action: () => void) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			action();
		};
		const timeout = setTimeout(
			() => finish(() => reject(new Error('Worker probe: response timed out.'))),
			4000
		);
		handle.value.onMessage((event) => {
			const raw = event as unknown as Record<string, unknown>;
			const message =
				typeof raw.message === 'object' && raw.message !== null
					? (raw.message as Record<string, unknown>)
					: raw;
			if (message.requestId !== requestId) return;
			finish(() =>
				message.ready === true ? resolve() : reject(new Error('Worker probe: unexpected response.'))
			);
		});
		handle.value.onProcessKilled(() => {
			finish(() => reject(new Error('Worker probe: worker was reclaimed before responding.')));
		});
		try {
			handle.value.postMessage({ payload: 'ping', requestId });
		} catch (error) {
			finish(() => reject(error));
		}
	});
}

async function runWorkerProbe(platform: WeChatPlatform): Promise<string> {
	const handle = platform.compute.worker(SAFE_PROBE_WORKER);
	try {
		await workerRoundtrip(handle);
	} finally {
		await handle.close();
	}
	return 'Worker probe: roundtrip and terminate passed.';
}

export async function runSafeProbe(platform: WeChatPlatform, name: SafeProbeName): Promise<string> {
	switch (name) {
		case 'files':
			return runFilesProbe(platform);
		case 'session':
			return `Session probe: ${(await platform.identity.checkSession()) ? 'valid' : 'expired or unavailable'}.`;
		case 'support': {
			const availability = await platform.support.check(wechatCapabilities.support.canIUse);
			return `Support probe: ${availability.status}.`;
		}
		case 'system': {
			const settings = platform.support.system();
			const switches = [settings.bluetoothEnabled, settings.locationEnabled, settings.wifiEnabled];
			if (switches.some((value) => value !== undefined && typeof value !== 'boolean')) {
				throw new Error('System probe: invalid switch value.');
			}
			if (
				settings.deviceOrientation !== undefined &&
				settings.deviceOrientation !== 'landscape' &&
				settings.deviceOrientation !== 'portrait'
			) {
				throw new Error('System probe: invalid device orientation.');
			}
			return 'System probe: settings read passed.';
		}
		case 'worker':
			return runWorkerProbe(platform);
	}
}
