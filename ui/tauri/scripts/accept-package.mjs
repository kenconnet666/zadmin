import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(packageRoot, '../..');
const fixtureRoot = await mkdtemp(resolve(tmpdir(), 'zadmin-tauri-package-'));
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
		child.once('exit', (code) => {
			if (code === 0) resolveRun(output);
			else rejectRun(new Error(`pnpm ${args.join(' ')} failed (${code}).\n${output}`));
		});
	});
}

async function write(path, content) {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content, 'utf8');
}

function fileSpec(path) {
	return `file:${path.replaceAll('\\', '/')}`;
}

let succeeded = false;
try {
	await mkdir(tarballRoot, { recursive: true });
	for (const packageName of ['@zadmin/zui-core', '@zadmin/zui-svelte', '@zadmin/tauri']) {
		await runPnpm(['--filter', packageName, 'build'], workspaceRoot);
		await runPnpm(
			['--filter', packageName, 'pack', '--pack-destination', tarballRoot],
			workspaceRoot
		);
	}
	const tarballs = (await readdir(tarballRoot)).map((name) => resolve(tarballRoot, name));
	const tarball = (name) => {
		const marker = name.replace('@zadmin/', 'zadmin-');
		const match = tarballs.find((path) => path.replaceAll('\\', '/').includes(marker));
		if (!match) throw new Error(`Missing tarball for ${name}.`);
		return fileSpec(match);
	};

	await write(
		resolve(fixtureRoot, 'package.json'),
		`${JSON.stringify(
			{
				name: 'zadmin-tauri-external-acceptance',
				private: true,
				version: '0.0.0',
				type: 'module',
				svelte: './src/index.ts',
				packageManager: 'pnpm@11.22.0',
				exports: {
					'.': {
						types: './src/index.ts',
						svelte: './src/index.ts',
						import: './src/index.ts'
					}
				},
				scripts: {
					build: 'svelte-package --input src --output dist',
					check: 'svelte-check --tsconfig ./tsconfig.json && tsc --noEmit'
				},
				dependencies: {
					'@zadmin/tauri': tarball('@zadmin/tauri'),
					'@zadmin/zui-core': tarball('@zadmin/zui-core'),
					'@zadmin/zui-svelte': tarball('@zadmin/zui-svelte'),
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
		`packages:
  - .

overrides:
  '@zadmin/tauri': '${tarball('@zadmin/tauri')}'
  '@zadmin/zui-core': '${tarball('@zadmin/zui-core')}'
  '@zadmin/zui-svelte': '${tarball('@zadmin/zui-svelte')}'

allowBuilds:
  '@parcel/watcher': true
`
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
import { ZuiProvider } from '@zadmin/zui-svelte';
import { createUnsupportedDesktopPlatform } from '@zadmin/tauri';
import { DesktopProvider, FilePickerButton, WindowFrame } from '@zadmin/tauri/svelte';
const platform = createUnsupportedDesktopPlatform();
</script>
<ZuiProvider><DesktopProvider {platform}><WindowFrame title="External fixture"><FilePickerButton disabled /></WindowFrame></DesktopProvider></ZuiProvider>
`
	);
	await write(
		resolve(fixtureRoot, 'src/index.ts'),
		`export { default as App } from './App.svelte';
export { createFakeDesktopDriver } from '@zadmin/tauri/testing';
export type { DesktopPlatform } from '@zadmin/tauri';
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
	const distRoot = resolve(fixtureRoot, 'dist');
	const outputFiles = await readdir(distRoot, { recursive: true });
	for (const file of outputFiles.filter((name) => /\.(?:d\.ts|js|svelte)$/u.test(name))) {
		const output = await readFile(resolve(distRoot, file), 'utf8');
		if (output.includes(workspaceRoot) || output.includes(workspaceRoot.replaceAll('\\', '/'))) {
			throw new Error(`External package output contains the source workspace path: ${file}`);
		}
	}
	succeeded = true;
	console.log('External @zadmin/tauri tarball acceptance passed.');
} finally {
	if (succeeded) await rm(fixtureRoot, { recursive: true, force: true });
	else console.error(`Failed package fixture retained at ${fixtureRoot}`);
}
