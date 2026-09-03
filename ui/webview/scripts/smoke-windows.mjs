import { spawn } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDesktopEvidence } from './desktop-evidence.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = resolve(tmpdir(), `zadmin-webview-smoke-${process.pid}.json`);
const executable = process.argv[2]
	? resolve(process.cwd(), process.argv[2])
	: resolve(
			root,
			'targets/windows/dotnet/bin/Release/net10.0-windows10.0.26100.0/win-x64/ZAdmin.exe'
		);
const evidenceOutput = process.argv
	.find((arg) => arg.startsWith('--evidence='))
	?.slice('--evidence='.length);
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
	if (report.error)
		throw new Error(`${report.error}${report.phase ? ` (phase: ${report.phase})` : ''}`);
	const evidence = validateDesktopEvidence(report, { expectedRevision: process.env.GITHUB_SHA });
	if (evidenceOutput) {
		if (isAbsolute(evidenceOutput))
			throw new Error('Desktop evidence output must be relative to the working directory.');
		const workingDirectory = resolve(process.cwd());
		const destination = resolve(workingDirectory, evidenceOutput);
		const relativeDestination = relative(workingDirectory, destination);
		if (
			relativeDestination === '..' ||
			relativeDestination.startsWith(`..${sep}`) ||
			isAbsolute(relativeDestination)
		)
			throw new Error('Desktop evidence output escapes the working directory.');
		await mkdir(dirname(destination), { recursive: true });
		await writeFile(destination, `${JSON.stringify(evidence, null, '\t')}\n`, 'utf8');
	}
	console.log(JSON.stringify(evidence));
} finally {
	await rm(reportPath, { force: true });
}
