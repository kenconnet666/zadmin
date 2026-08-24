import { execFile as nodeExecFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(nodeExecFile);

/**
 * @typedef {(file: string, args: string[], options: { timeout: number, windowsHide: boolean }) => Promise<{ stdout: string }>} WechatExec
 */

function executable() {
	return process.platform === 'win32' ? 'wechatide.cmd' : 'wechatide';
}

/** @param {string} stdout */
function findResult(stdout) {
	for (const line of stdout.trim().split(/\r?\n/u).reverse()) {
		try {
			const parsed = JSON.parse(line);
			return parsed?.result?.result ?? parsed?.result ?? null;
		} catch {
			// wechatide may prefix diagnostic lines before its JSON result.
		}
	}
	return null;
}

/**
 * @param {{ client?: string, execFile?: WechatExec, expectedBuildId: string, project: string }} options
 */
export async function refreshDevtoolsIfStale(options) {
	const { client, expectedBuildId, project } = options;
	if (!client) return { action: 'disabled' };
	const run = options.execFile ?? /** @type {WechatExec} */ (execFile);
	try {
		const probe = await run(
			executable(),
			[
				'-c',
				client,
				'automation_evaluate',
				'--project',
				project,
				'--fn-source',
				'function(){return wx.getStorageSync("__zadmin_build_id__")||null}'
			],
			{ timeout: 4000, windowsHide: true }
		);
		if (findResult(probe.stdout) === expectedBuildId) return { action: 'current' };
		await run(executable(), ['-c', client, 'simulator_refresh', '--project', project], {
			timeout: 4000,
			windowsHide: true
		});
		return { action: 'refreshed' };
	} catch (error) {
		return { action: 'unavailable', error: error instanceof Error ? error.message : String(error) };
	}
}
