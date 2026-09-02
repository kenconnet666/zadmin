import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readReleaseArtifact } from '../../../scripts/read-release-artifact.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(packageRoot, '../..');
const fixtureRoot = await mkdtemp(resolve(tmpdir(), 'zadmin-webview-package-'));
const tarballRoot = resolve(fixtureRoot, 'tarballs');
const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) throw new Error('accept-package must be launched through pnpm.');

function runPnpm(args, cwd) {
	return new Promise((resolveRun, rejectRun) => {
		const child = spawn(process.execPath, [pnpmCli, ...args], {
			cwd,
			env: { ...process.env, CI: 'true' },
			stdio: ['ignore', 'pipe', 'pipe'],
			windowsHide: true
		});
		let output = '';
		child.stdout.setEncoding('utf8').on('data', (chunk) => {
			output += chunk;
			process.stdout.write(chunk);
		});
		child.stderr.setEncoding('utf8').on('data', (chunk) => {
			output += chunk;
			process.stderr.write(chunk);
		});
		child.once('error', rejectRun);
		child.once('exit', (code) =>
			code === 0
				? resolveRun(output)
				: rejectRun(new Error(`pnpm ${args.join(' ')} failed (${code}).\n${output}`))
		);
	});
}

async function write(path, content) {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content, 'utf8');
}

let succeeded = false;
try {
	await mkdir(tarballRoot, { recursive: true });
	const artifactDirectory = process.env.ZADMIN_RELEASE_ARTIFACTS_DIR;
	const artifactRevision = process.env.ZADMIN_RELEASE_ARTIFACTS_REVISION;
	if (artifactDirectory && !artifactRevision)
		throw new Error('ZADMIN_RELEASE_ARTIFACTS_REVISION is required with release artifacts.');
	if (!artifactDirectory) {
		for (const packageName of ['@zadmin/zui', '@zadmin/webview']) {
			await runPnpm(['--filter', packageName, 'build'], workspaceRoot);
			await runPnpm(
				['--filter', packageName, 'pack', '--pack-destination', tarballRoot],
				workspaceRoot
			);
		}
	}
	const tarballs = artifactDirectory
		? []
		: (await readdir(tarballRoot)).map((name) => resolve(tarballRoot, name));
	const tarball = (name) => {
		if (artifactDirectory) return readReleaseArtifact(artifactDirectory, name, artifactRevision);
		const marker = name.replace('@zadmin/', 'zadmin-');
		const match = tarballs.find((path) => basename(path).includes(marker));
		if (!match) throw new Error(`Missing tarball for ${name}.`);
		return `file:${match.replaceAll('\\', '/')}`;
	};

	await write(
		resolve(fixtureRoot, 'package.json'),
		`${JSON.stringify(
			{
				name: 'zadmin-webview-external-acceptance',
				private: true,
				version: '0.0.0',
				type: 'module',
				svelte: './src/index.ts',
				packageManager: 'pnpm@11.22.0',
				scripts: {
					build: 'svelte-package --input src --output dist',
					check: 'svelte-check --tsconfig ./tsconfig.json && tsc --noEmit'
				},
				dependencies: {
					'@zadmin/webview': tarball('@zadmin/webview'),
					'@zadmin/zui': tarball('@zadmin/zui'),
					svelte: '5.56.10'
				},
				devDependencies: {
					'@sveltejs/package': '2.5.8',
					'@types/node': '26.2.0',
					'svelte-check': '4.7.6',
					typescript: '6.0.3'
				}
			},
			null,
			'\t'
		)}\n`
	);
	await write(
		resolve(fixtureRoot, 'pnpm-workspace.yaml'),
		`packages:\n  - .\n\noverrides:\n  '@zadmin/webview': '${tarball('@zadmin/webview')}'\n  '@zadmin/zui': '${tarball('@zadmin/zui')}'\n\nallowBuilds:\n  '@parcel/watcher': true\n  esbuild: true\n`
	);
	await write(
		resolve(fixtureRoot, 'tsconfig.json'),
		`${JSON.stringify(
			{
				compilerOptions: {
					allowImportingTsExtensions: true,
					module: 'ESNext',
					moduleResolution: 'Bundler',
					noEmit: true,
					skipLibCheck: true,
					strict: true,
					target: 'ES2024'
				},
				include: ['src/**/*.ts', 'src/**/*.svelte']
			},
			null,
			'\t'
		)}\n`
	);
	await write(resolve(fixtureRoot, 'svelte.config.js'), 'export default {};\n');
	await write(
		resolve(fixtureRoot, 'src/App.svelte'),
		`<script lang="ts">
import { ZProvider } from '@zadmin/zui';
import { createUnsupportedDesktopPlatform } from '@zadmin/webview/platform';
import { DesktopProvider, FilePickerButton, WindowFrame } from '@zadmin/webview/svelte';
const platform = createUnsupportedDesktopPlatform();
</script>
<ZProvider><DesktopProvider {platform}><WindowFrame title="External fixture"><FilePickerButton disabled /></WindowFrame></DesktopProvider></ZProvider>
`
	);
	await write(
		resolve(fixtureRoot, 'src/index.ts'),
		`export { default as App } from './App.svelte';
export { createFakeWebviewDriver } from '@zadmin/webview/testing';
export type { DesktopPlatform } from '@zadmin/webview/platform';
`
	);
	await write(
		resolve(fixtureRoot, 'src/svelte.d.ts'),
		`declare module '*.svelte' {
  import type { Component } from 'svelte';
  const component: Component<Record<string, unknown>>;
  export default component;
}
`
	);

	await runPnpm(['install', '--no-frozen-lockfile'], fixtureRoot);
	await runPnpm(['install', '--frozen-lockfile'], fixtureRoot);
	await runPnpm(['check'], fixtureRoot);
	await runPnpm(['build'], fixtureRoot);
	for (const file of (await readdir(resolve(fixtureRoot, 'dist'), { recursive: true })).filter(
		(name) => /\.(?:d\.ts|js|svelte)$/u.test(name)
	)) {
		const output = await readFile(resolve(fixtureRoot, 'dist', file), 'utf8');
		if (output.includes(workspaceRoot) || output.includes(workspaceRoot.replaceAll('\\', '/'))) {
			throw new Error(`External output contains workspace path: ${file}`);
		}
		if (/@tauri|\bTauri\b/u.test(output))
			throw new Error(`External output contains Tauri: ${file}`);
	}
	succeeded = true;
	console.log('External @zadmin/webview tarball acceptance passed.');
} finally {
	if (succeeded) await rm(fixtureRoot, { force: true, recursive: true });
	else console.error(`Failed package fixture retained at ${fixtureRoot}`);
}
