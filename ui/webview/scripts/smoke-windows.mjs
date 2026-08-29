import { spawn } from 'node:child_process';
import { readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = resolve(tmpdir(), `zadmin-webview-smoke-${process.pid}.json`);
const executable = process.argv[2]
	? resolve(process.cwd(), process.argv[2])
	: resolve(
			root,
			'targets/windows/dotnet/bin/Release/net10.0-windows10.0.26100.0/win-x64/ZAdmin.exe'
		);
const expectedText = process.argv[3];
const child = spawn(executable, [], {
	env: { ...process.env, ZADMIN_WEBVIEW_SMOKE_REPORT: reportPath },
	stdio: 'ignore',
	windowsHide: true
});
const exitCode = await new Promise((resolveExit, rejectExit) => {
	const timeout = setTimeout(() => {
		child.kill();
		rejectExit(new Error('Windows WebView2 smoke test timed out.'));
	}, 30_000);
	child.once('error', rejectExit);
	child.once('exit', (code) => {
		clearTimeout(timeout);
		resolveExit(code);
	});
});

try {
	if (exitCode !== 0) throw new Error(`Windows WebView2 host exited with code ${exitCode}.`);
	const report = JSON.parse(await readFile(reportPath, 'utf8'));
	if (report.error) throw new Error(report.error);
	if (!report.navigation || !report.bridgeRequest)
		throw new Error('Windows WebView2 smoke report is incomplete.');
	if (report.page?.origin !== 'https://app.zadmin.local' || report.page?.hasBridge !== true) {
		throw new Error(`Unexpected WebView2 page state: ${JSON.stringify(report.page)}`);
	}
	if (report.page?.errors?.length)
		throw new Error(`WebView2 page errors: ${report.page.errors.join('; ')}`);
	if (expectedText && !report.page?.bodyText?.includes(expectedText)) {
		throw new Error(`WebView2 page does not contain expected text: ${expectedText}`);
	}
	console.log(JSON.stringify(report));
} finally {
	await rm(reportPath, { force: true });
}
