import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateArtifactManifest } from './read-release-artifact.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const defaultPackages = [
	'@zadmin/core',
	'@zadmin/zui',
	'@zadmin/sveltekit',
	'@zadmin/webview',
	'@zadmin/miniapp'
];
const output = resolve(
	root,
	process.argv.find((arg) => arg.startsWith('--out='))?.slice(6) ?? '.release-artifacts'
);
const requested = process.argv.filter((arg) => arg.startsWith('@'));
const packageNames = requested.length > 0 ? requested : defaultPackages;
if (process.argv.includes('--help')) {
	console.log(
		'Usage: pnpm release:pack:artifacts [--out=.release-artifacts] [@zadmin/package ...]'
	);
	process.exit(0);
}
const sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], {
	cwd: root,
	encoding: 'utf8'
}).trim();
if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u.test(sourceRevision))
	throw new Error(`Invalid source revision: ${sourceRevision}`);
const sourceChanges = execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
	cwd: root,
	encoding: 'utf8'
}).trim();
if (sourceChanges)
	throw new Error(
		`Release artifacts require a clean source checkout; found ${sourceChanges.split(/\r?\n/u).length} changed path(s).`
	);

function runPnpm(args) {
	return new Promise((resolveRun, rejectRun) => {
		const child = spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', args, {
			cwd: root,
			stdio: ['ignore', 'pipe', 'pipe'],
			windowsHide: true
		});
		let outputText = '';
		child.stdout.on('data', (chunk) => (outputText += chunk));
		child.stderr.on('data', (chunk) => (outputText += chunk));
		child.once('error', rejectRun);
		child.once('exit', (code) =>
			code === 0
				? resolveRun(outputText)
				: rejectRun(new Error(`pnpm ${args.join(' ')} failed (${code}).\n${outputText}`))
		);
	});
}

async function packageVersion(name) {
	const packageDirs = ['apps', 'packages', 'plugins', 'ui'];
	for (const directory of packageDirs) {
		for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
			if (!entry.isDirectory()) continue;
			const path = resolve(root, directory, entry.name, 'package.json');
			try {
				const packageJson = JSON.parse(await readFile(path, 'utf8'));
				if (packageJson.name === name) {
					if (packageJson.private === true) throw new Error(`Release package is private: ${name}.`);
					if (typeof packageJson.version !== 'string')
						throw new Error(`Release package has no version: ${name}.`);
					return packageJson.version;
				}
			} catch (error) {
				if (error?.code !== 'ENOENT') throw error;
			}
		}
	}
	throw new Error(`Release package was not found in workspace: ${name}.`);
}

await mkdir(output, { recursive: true });
const existing = await readdir(output);
if (existing.length > 0) throw new Error(`Release artifact output must be empty: ${output}.`);
if (new Set(packageNames).size !== packageNames.length)
	throw new Error('Release package list contains duplicates.');
const artifacts = [];
for (const name of packageNames) {
	const version = await packageVersion(name);
	const before = new Set(await readdir(output));
	await runPnpm(['--filter', name, 'pack', '--pack-destination', output]);
	const created = (await readdir(output)).filter(
		(file) => !before.has(file) && file.endsWith('.tgz')
	);
	if (created.length !== 1)
		throw new Error(`Expected exactly one tarball for ${name}, found ${created.length}.`);
	const filename = created[0];
	const bytes = await readFile(resolve(output, filename));
	artifacts.push({
		name,
		version,
		filename,
		sha256: createHash('sha256').update(bytes).digest('hex'),
		bytes: bytes.byteLength
	});
}
const manifest = {
	schemaVersion: 2,
	producer: 'scripts/pack-release-artifacts.mjs',
	sourceRevision,
	artifacts,
	status: 'passed'
};
validateArtifactManifest(manifest);
await writeFile(
	resolve(output, 'manifest.json'),
	`${JSON.stringify(manifest, null, '\t')}\n`,
	'utf8'
);
console.log(JSON.stringify(manifest));
