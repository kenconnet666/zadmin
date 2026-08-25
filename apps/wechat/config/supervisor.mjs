import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { mkdir, open, readFile, readdir, realpath, stat, unlink } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { refreshDevtoolsIfStale } from './devtools-refresh.mjs';
import { classifyChange, workspacePath } from './file-policy.mjs';
import { BuildStatusStore } from './status.mjs';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(appRoot, '../..');
const appRequire = createRequire(resolve(appRoot, 'package.json'));
const zuiRequire = createRequire(resolve(workspaceRoot, 'ui/zui-taro/package.json'));

async function packageBin(requireFrom, packageName, binName) {
	const packagePath = requireFrom.resolve(`${packageName}/package.json`);
	const manifest = JSON.parse(await readFile(packagePath, 'utf8'));
	const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[binName];
	if (typeof bin !== 'string') throw new Error(`${packageName} does not expose ${binName}.`);
	return resolve(dirname(packagePath), bin);
}

function lines(stream, prefix, callback) {
	let buffer = '';
	stream.setEncoding('utf8');
	stream.on('data', (chunk) => {
		buffer += chunk;
		const parts = buffer.split(/\r?\n/u);
		buffer = parts.pop() ?? '';
		for (const line of parts) {
			if (line.length === 0) continue;
			process.stdout.write(`[${prefix}] ${line}\n`);
			callback?.(line);
		}
	});
}

function spawnNode(label, script, args, options = {}) {
	const child = spawn(process.execPath, [script, ...args], {
		cwd: options.cwd ?? workspaceRoot,
		env: { ...process.env, ...options.env },
		stdio: ['ignore', 'pipe', 'pipe'],
		windowsHide: true
	});
	lines(child.stdout, label, options.onLine);
	lines(child.stderr, label, options.onErrorLine ?? options.onLine);
	return child;
}

function runNode(label, script, args, options = {}) {
	return new Promise((resolveRun, rejectRun) => {
		const child = spawnNode(label, script, args, options);
		child.once('error', rejectRun);
		child.once('exit', (code) => {
			if (code === 0) resolveRun();
			else rejectRun(new Error(`${label} exited with code ${code ?? 'unknown'}.`));
		});
	});
}

async function stopChild(child, timeoutMs = 3000) {
	if (child === undefined || child.exitCode !== null) return;
	await new Promise((resolveStop) => {
		const timer = setTimeout(() => {
			if (child.exitCode === null) child.kill('SIGKILL');
		}, timeoutMs);
		child.once('exit', () => {
			clearTimeout(timer);
			resolveStop();
		});
		child.kill('SIGTERM');
	});
}

function processExists(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

async function acquireLock() {
	const directory = resolve(appRoot, '.wechat');
	const path = resolve(directory, 'supervisor.lock');
	await mkdir(directory, { recursive: true });
	for (let attempt = 0; attempt < 2; attempt += 1) {
		try {
			const handle = await open(path, 'wx');
			await handle.writeFile(`${process.pid}\n`, 'utf8');
			return {
				async release() {
					await handle.close();
					await unlink(path).catch(() => undefined);
				}
			};
		} catch (error) {
			if (error?.code !== 'EEXIST') throw error;
			const owner = Number.parseInt(await readFile(path, 'utf8').catch(() => ''), 10);
			if (Number.isInteger(owner) && processExists(owner)) {
				throw new Error(`A WeChat supervisor is already running as process ${owner}.`, {
					cause: error
				});
			}
			await unlink(path).catch(() => undefined);
		}
	}
	throw new Error('Unable to acquire the WeChat supervisor lock.');
}

async function externalRoots() {
	const configPath = resolve(appRoot, '.wechat/plugins.json');
	try {
		const config = JSON.parse(await readFile(configPath, 'utf8'));
		const paths = Array.isArray(config) ? config : config.paths;
		if (!Array.isArray(paths))
			throw new TypeError('plugins.json must be an array or { paths: [] }.');
		return await Promise.all(paths.map((path) => realpath(resolve(path))));
	} catch (error) {
		if (error?.code === 'ENOENT') return [];
		throw error;
	}
}

export async function runSupervisor() {
	const lock = await acquireLock();
	const status = new BuildStatusStore(appRoot);
	const children = new Map();
	const watchers = [];
	let stopping = false;
	let restartTimer;
	let expectedTaroExit = false;
	let exitCode = 0;
	const taroFailures = [];
	const lastChanges = new Map();
	const fileStamps = new Map();

	const tscBin = appRequire.resolve('typescript/bin/tsc');
	const taroBin = await packageBin(appRequire, '@tarojs/cli', 'taro');
	const sveltePackageBin = await packageBin(zuiRequire, '@sveltejs/package', 'svelte-package');

	async function shutdown(code = exitCode) {
		if (stopping) return;
		stopping = true;
		exitCode = code;
		if (restartTimer !== undefined) clearTimeout(restartTimer);
		for (const watcher of watchers.splice(0)) watcher.close();
		await Promise.all([...children.values()].map(stopChild));
		children.clear();
		await lock.release();
		process.exitCode = exitCode;
	}

	async function onSuccessfulBuild(buildId) {
		await status.success(buildId);
		await status.record('build-success', { buildId });
		setTimeout(async () => {
			const result = await refreshDevtoolsIfStale({
				client: process.env.ZADMIN_WECHATIDE_CLIENT,
				expectedBuildId: buildId,
				project: appRoot
			});
			await status.record('devtools-refresh', result);
		}, 1200);
	}

	function startTaro() {
		const child = spawnNode(
			'taro',
			taroBin,
			['build', '--type', 'weapp', '--watch', '--no-check'],
			{
				cwd: appRoot,
				env: { NODE_ENV: 'development', ZADMIN_WECHAT_SUPERVISED: '1' },
				onErrorLine(line) {
					if (/\b(?:error|failed)\b/iu.test(line)) void status.failure(line);
				},
				onLine(line) {
					if (line === 'build started...' && status.snapshot.startedAt === null) {
						void status.begin(status.snapshot.source ?? 'taro-watch');
					}
					const match = /^\[zadmin-build\] ([a-z0-9-]+)$/u.exec(line);
					if (match !== null) void onSuccessfulBuild(match[1]);
				}
			}
		);
		children.set('taro', child);
		child.once('exit', (code) => {
			children.delete('taro');
			if (stopping || expectedTaroExit) {
				expectedTaroExit = false;
				return;
			}
			void status.failure(`Taro watcher exited with code ${code ?? 'unknown'}.`);
			const now = Date.now();
			taroFailures.push(now);
			while (taroFailures[0] !== undefined && taroFailures[0] < now - 30_000) {
				taroFailures.shift();
			}
			if (taroFailures.length >= 3) {
				process.stderr.write(
					'[wechat] Taro watcher failed three times in 30 seconds; supervisor stopped.\n'
				);
				void shutdown(1);
				return;
			}
			setTimeout(() => {
				if (!stopping) startTaro();
			}, 750);
		});
	}

	async function restartTaro(reason) {
		await status.restart(reason);
		await status.record('taro-restart', { reason });
		const child = children.get('taro');
		if (child !== undefined) {
			expectedTaroExit = true;
			await stopChild(child, 500);
			children.delete('taro');
		}
		if (!stopping) startTaro();
	}

	function scheduleRestart(reason) {
		if (restartTimer !== undefined) clearTimeout(restartTimer);
		restartTimer = setTimeout(() => void restartTaro(reason), 500);
	}

	function keepRequired(name, child) {
		children.set(name, child);
		child.once('exit', (code) => {
			children.delete(name);
			if (stopping) return;
			void status
				.failure(`${name} watcher exited with code ${code ?? 'unknown'}.`)
				.finally(() => shutdown(1));
		});
	}

	async function onChange(path, external = false) {
		const stamp = await stat(path).then(
			(info) => info.mtimeMs,
			() => -1
		);
		if (fileStamps.get(path) === stamp) return;
		fileStamps.set(path, stamp);
		const source = external ? path : workspacePath(workspaceRoot, path);
		const now = Date.now();
		if ((lastChanges.get(source) ?? 0) > now - 100) return;
		lastChanges.set(source, now);
		const action = classifyChange(source, { external });
		if (action === 'ignore') return;
		await status.begin(source);
		await status.record('source-change', { action, source });
		switch (action) {
			case 'dependencies-changed':
				process.stderr.write(
					'[wechat] Dependency graph changed; reinstall and restart pnpm dev:wechat.\n'
				);
				await status.failure('Dependency graph changed; reinstall and restart required.');
				await shutdown(75);
				break;
			case 'restart-taro':
				scheduleRestart(source);
				break;
			default:
				break;
		}
	}

	async function rememberTree(root) {
		for (const entry of await readdir(root, { withFileTypes: true })) {
			const path = resolve(root, entry.name);
			if (entry.isDirectory()) await rememberTree(path);
			else if (entry.isFile()) fileStamps.set(path, (await stat(path)).mtimeMs);
		}
	}

	async function watchRoot(root, external = false) {
		await rememberTree(root);
		const watcher = watch(root, { recursive: true }, (_event, filename) => {
			if (filename === null) return;
			void onChange(resolve(root, String(filename)), external).catch((error) =>
				status.failure(error)
			);
		});
		watcher.on('error', (error) => void status.failure(error));
		watchers.push(watcher);
	}

	try {
		await status.initialize(0);
		await status.record('supervisor-start', { pid: process.pid });
		await runNode('svelte-taro:build', tscBin, ['-p', 'tsconfig.json'], {
			cwd: resolve(workspaceRoot, 'ui/svelte-taro')
		});
		await runNode(
			'svelte-runtime:build',
			resolve(workspaceRoot, 'ui/svelte-taro/scripts/build-runtime.mjs'),
			[],
			{ cwd: resolve(workspaceRoot, 'ui/svelte-taro') }
		);
		await runNode('zui-taro:build', sveltePackageBin, ['--input', 'src', '--output', 'dist'], {
			cwd: resolve(workspaceRoot, 'ui/zui-taro')
		});

		keepRequired(
			'svelte-taro',
			spawnNode(
				'svelte-taro',
				tscBin,
				['-p', 'tsconfig.json', '--watch', '--preserveWatchOutput', '--pretty', 'false'],
				{ cwd: resolve(workspaceRoot, 'ui/svelte-taro') }
			)
		);
		keepRequired(
			'zui-taro',
			spawnNode(
				'zui-taro',
				sveltePackageBin,
				['--input', 'src', '--output', 'dist', '--watch', '--preserve-output'],
				{ cwd: resolve(workspaceRoot, 'ui/zui-taro') }
			)
		);
		startTaro();

		for (const root of [
			resolve(appRoot, 'src'),
			resolve(workspaceRoot, 'ui/svelte-taro/src'),
			resolve(workspaceRoot, 'ui/zui-taro/src')
		]) {
			await watchRoot(root);
		}
		for (const root of await externalRoots()) await watchRoot(root, true);
		await status.update({ watcherCount: watchers.length });
		process.stdout.write(`[wechat] Supervisor ready with ${watchers.length} source watchers.\n`);
	} catch (error) {
		await status.failure(error);
		await shutdown(1);
		throw error;
	}

	process.once('SIGINT', () => void shutdown(0));
	process.once('SIGTERM', () => void shutdown(0));
	process.once('uncaughtException', (error) => {
		void status.failure(error).finally(() => shutdown(1));
	});
	process.once('unhandledRejection', (error) => {
		void status.failure(error).finally(() => shutdown(1));
	});

	return { shutdown, status };
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
	await runSupervisor();
}
