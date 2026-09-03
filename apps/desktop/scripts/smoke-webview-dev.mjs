import { spawn } from 'node:child_process';
import { readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(appRoot, '../..');
const reportPath = resolve(tmpdir(), `zadmin-webview-dev-smoke-${process.pid}.json`);
const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) throw new Error('Development smoke must be launched through pnpm.');

async function readReport() {
	for (let attempt = 1; attempt <= 50; attempt += 1) {
		try {
			return await readFile(reportPath, 'utf8');
		} catch (error) {
			const code = /** @type {{ code?: string }} */ (error).code;
			if (!['EACCES', 'EBUSY', 'ENOENT', 'EPERM'].includes(code ?? '') || attempt === 50)
				throw error;
			await new Promise((resolveRetry) => setTimeout(resolveRetry, 100));
		}
	}
	throw new Error('Development smoke report did not become readable.');
}

const child = spawn(
	process.execPath,
	[pnpmCli, '--filter', '@zadmin/desktop', 'webview:dev', '--', '--smoke-report', reportPath],
	{
		cwd: workspaceRoot,
		env: { ...process.env, ZADMIN_WEBVIEW_SMOKE_REPORT: reportPath },
		stdio: 'inherit',
		windowsHide: true
	}
);
async function killTree() {
	if (!child.pid || child.exitCode !== null) return;
	if (process.platform !== 'win32') return void child.kill('SIGTERM');
	await new Promise((resolveKill) => {
		const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
			stdio: 'ignore',
			windowsHide: true
		});
		killer.once('error', resolveKill);
		killer.once('exit', resolveKill);
	});
}
const exitCode = await new Promise((resolveExit, rejectExit) => {
	const timeout = setTimeout(async () => {
		await killTree();
		rejectExit(new Error('WebView development smoke timed out.'));
	}, 120_000);
	child.once('error', rejectExit);
	child.once('exit', (code) => {
		clearTimeout(timeout);
		resolveExit(code);
	});
});

try {
	if (exitCode !== 0) throw new Error(`WebView development host exited with code ${exitCode}.`);
	/** @type {{ bridgeRoundTrip?: { method?: string; requestReceived?: boolean; responseValidated?: boolean }; error?: string; navigation?: boolean; page?: { bodyText?: string; errors?: string[]; hasBridge?: boolean; origin?: string; viteClient?: boolean }; protocol?: number; source?: string }} */
	const report = JSON.parse(await readReport());
	if (report.error) throw new Error(report.error);
	const isDevelopmentOrigin = (value) => {
		try {
			const url = new URL(value);
			return (
				url.protocol === 'http:' &&
				url.port === '5176' &&
				(url.hostname === '127.0.0.1' || url.hostname === 'localhost')
			);
		} catch {
			return false;
		}
	};
	if (!isDevelopmentOrigin(report.page?.origin)) {
		throw new Error(`Unexpected development origin: ${JSON.stringify(report.page?.origin)}.`);
	}
	if (report.source !== undefined && !isDevelopmentOrigin(report.source)) {
		throw new Error(`Unexpected development source: ${JSON.stringify(report.source)}.`);
	}
	if (
		!report.navigation ||
		report.protocol !== 1 ||
		report.bridgeRoundTrip?.method !== 'app.snapshot' ||
		report.bridgeRoundTrip?.requestReceived !== true ||
		report.bridgeRoundTrip?.responseValidated !== true
	) {
		throw new Error(`Development protocol handshake is incomplete: ${JSON.stringify(report)}.`);
	}
	if (!report.page?.hasBridge || !report.page?.viteClient) {
		throw new Error(`WebView Vite/bridge injection is incomplete: ${JSON.stringify(report.page)}`);
	}
	if (!report.page?.bodyText?.includes('Windows WebView2 capability lab'))
		throw new Error('Development page did not hydrate.');
	if (report.page?.errors?.length)
		throw new Error(`Development page errors: ${report.page.errors.join('; ')}`);
	console.log(JSON.stringify(report));
} finally {
	await rm(reportPath, { force: true });
}
