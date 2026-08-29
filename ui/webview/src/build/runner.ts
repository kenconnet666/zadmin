import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { resolveWebviewTargets, type WebviewConfig, type WebviewTarget } from './config.js';
import { WEBVIEW_PROTOCOL_VERSION } from '../generated/protocol.js';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function run(
	command: string,
	args: readonly string[],
	options: { readonly cwd: string; readonly env?: NodeJS.ProcessEnv; readonly shell?: boolean }
): Promise<void> {
	return new Promise((resolveRun, rejectRun) => {
		const child = spawn(command, args, {
			cwd: options.cwd,
			env: { ...process.env, ...options.env },
			shell: options.shell,
			stdio: 'inherit',
			windowsHide: true
		});
		child.once('error', rejectRun);
		child.once('exit', (code) =>
			code === 0 ? resolveRun() : rejectRun(new Error(`${command} exited with code ${code}.`))
		);
	});
}

function waitForProcess(child: ReturnType<typeof spawn>, label: string): Promise<void> {
	return new Promise((resolveRun, rejectRun) => {
		child.once('error', rejectRun);
		child.once('exit', (code) =>
			code === 0 ? resolveRun() : rejectRun(new Error(`${label} exited with code ${code}.`))
		);
	});
}

async function terminateProcessTree(child: ReturnType<typeof spawn> | undefined): Promise<void> {
	if (!child?.pid || child.exitCode !== null) return;
	if (process.platform !== 'win32') {
		child.kill('SIGTERM');
		return;
	}
	await new Promise<void>((resolveKill) => {
		const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
			stdio: 'ignore',
			windowsHide: true
		});
		killer.once('error', () => resolveKill());
		killer.once('exit', () => resolveKill());
	});
}

async function hashFile(path: string): Promise<string> {
	const hash = createHash('sha256');
	for await (const chunk of createReadStream(path)) hash.update(chunk);
	return hash.digest('hex');
}

async function writeTargetMetadata(options: {
	readonly output: string;
	readonly packageFormat: string;
	readonly productName: string;
	readonly rid: string;
	readonly target: WebviewTarget;
}): Promise<void> {
	const entries = (await readdir(options.output, { recursive: true, withFileTypes: true }))
		.filter((entry) => entry.isFile() && !['checksums.txt', 'manifest.json'].includes(entry.name))
		.map((entry) => resolve(entry.parentPath, entry.name))
		.sort((left, right) => left.localeCompare(right));
	const rows: string[] = [];
	let totalBytes = 0;
	for (const path of entries) {
		const relative = path.slice(options.output.length + 1).replaceAll('\\', '/');
		totalBytes += (await stat(path)).size;
		rows.push(`${await hashFile(path)}  ${relative}`);
	}
	await writeFile(resolve(options.output, 'checksums.txt'), `${rows.join('\n')}\n`, 'utf8');
	await writeFile(
		resolve(options.output, 'manifest.json'),
		`${JSON.stringify(
			{
				fileCount: entries.length,
				package: options.packageFormat,
				productName: options.productName,
				protocolVersion: WEBVIEW_PROTOCOL_VERSION,
				rid: options.rid,
				target: options.target,
				totalBytes,
				webviewRuntime: 'evergreen'
			},
			null,
			'\t'
		)}\n`,
		'utf8'
	);
}

async function waitForUrl(url: string, timeoutMs = 60_000): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	let lastError: unknown;
	while (Date.now() < deadline) {
		try {
			const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(2_000) });
			if (response.ok || response.status === 304) return;
			lastError = new Error(`HTTP ${response.status}`);
		} catch (error) {
			lastError = error;
		}
		await new Promise((resolveWait) => setTimeout(resolveWait, 100));
	}
	throw new Error(`Web development server did not become ready: ${url}`, { cause: lastError });
}

function spawnWebDevelopment(command: string, projectRoot: string) {
	const [executable, ...args] = command.trim().split(/\s+/u);
	const environment = Object.fromEntries(
		Object.entries(process.env).filter(
			([name]) => !/AUTH|PASSWORD|SECRET|TOKEN|API_KEY/iu.test(name)
		)
	);
	if (executable === 'vite') {
		return spawn(
			process.execPath,
			[resolve(projectRoot, 'node_modules/vite/bin/vite.js'), ...args],
			{
				cwd: projectRoot,
				env: environment,
				stdio: 'inherit',
				windowsHide: true
			}
		);
	}
	return spawn(command, [], {
		cwd: projectRoot,
		env: environment,
		shell: true,
		stdio: 'inherit',
		windowsHide: true
	});
}

export async function loadWebviewConfig(projectRoot: string, configPath = 'webview.config.ts') {
	const path = resolve(projectRoot, configPath);
	const module = (await import(`${pathToFileURL(path).href}?t=${Date.now()}`)) as {
		readonly default?: WebviewConfig;
	};
	if (!module.default) throw new Error(`WebView config has no default export: ${path}`);
	return module.default;
}

export async function buildWebviewTargets(options: {
	readonly config: WebviewConfig;
	readonly projectRoot: string;
	readonly target: WebviewTarget | 'all';
}): Promise<void> {
	const { config, projectRoot } = options;
	await run(config.web.command, [], { cwd: projectRoot, shell: true });
	for (const target of resolveWebviewTargets(config, options.target)) {
		const rid = target === 'windows-arm64' ? 'win-arm64' : 'win-x64';
		const output = resolve(projectRoot, config.output ?? 'dist/desktop', target);
		const productName = config.targets[target]?.productName ?? 'ZAdmin';
		await rm(output, { force: true, recursive: true });
		await mkdir(output, { recursive: true });
		await run(
			'dotnet',
			[
				'publish',
				resolve(packageRoot, 'targets/windows/dotnet/ZAdmin.WebView.Windows.csproj'),
				'--configuration',
				'Release',
				'--runtime',
				rid,
				'--self-contained',
				'true',
				'--output',
				output,
				`-p:WebAssetsRoot=${resolve(projectRoot, config.web.assets)}`,
				`-p:ProductName=${productName}`
			],
			{ cwd: projectRoot }
		);
		await writeFile(
			resolve(output, 'webview.host.json'),
			`${JSON.stringify({ allowedExternalOrigins: config.host?.allowedExternalOrigins ?? [] }, null, '\t')}\n`,
			'utf8'
		);
		const packageFormat = config.targets[target]?.package ?? 'portable';
		await writeTargetMetadata({ output, packageFormat, productName, rid, target });
		if (packageFormat === 'portable') {
			if (process.platform !== 'win32')
				throw new Error('Windows portable packaging requires Windows.');
			const archive = resolve(output, '..', `${productName}-${target}-portable.zip`);
			await rm(archive, { force: true });
			await run('tar.exe', ['-a', '-c', '-f', archive, '-C', output, '.'], { cwd: projectRoot });
		}
	}
}

export async function devWebviewTarget(options: {
	readonly config: WebviewConfig;
	readonly projectRoot: string;
	readonly smokeReportPath?: string;
	readonly target: WebviewTarget;
}): Promise<void> {
	const target = resolveWebviewTargets(options.config, options.target)[0];
	if (!target) throw new Error('Missing WebView development target.');
	const rid = target === 'windows-arm64' ? 'win-arm64' : 'win-x64';
	const web = options.config.web;
	if (!web.devCommand || !web.devUrl) {
		throw new Error('web.devCommand and web.devUrl are required for WebView development.');
	}
	const webProcess = spawnWebDevelopment(web.devCommand, options.projectRoot);
	let hostProcess: ReturnType<typeof spawn> | undefined;
	try {
		if (options.smokeReportPath) {
			console.log(`[webview] Development smoke report: ${resolve(options.smokeReportPath)}`);
		}
		const project = resolve(packageRoot, 'targets/windows/dotnet/ZAdmin.WebView.Windows.csproj');
		await Promise.all([
			waitForUrl(web.devUrl),
			run('dotnet', ['build', project, '--configuration', 'Debug', '--runtime', rid], {
				cwd: options.projectRoot
			})
		]);
		const executable = resolve(
			packageRoot,
			'targets/windows/dotnet/bin/Debug/net10.0-windows10.0.26100.0',
			rid,
			'ZAdmin.exe'
		);
		hostProcess = spawn(executable, [], {
			cwd: options.projectRoot,
			env: {
				...process.env,
				ZADMIN_WEBVIEW_DEV_URL: web.devUrl,
				...(options.smokeReportPath
					? { ZADMIN_WEBVIEW_SMOKE_REPORT: resolve(options.smokeReportPath) }
					: {})
			},
			stdio: 'inherit',
			windowsHide: true
		});
		await waitForProcess(hostProcess, 'WebView host');
	} finally {
		await terminateProcessTree(hostProcess);
		await terminateProcessTree(webProcess);
	}
}
