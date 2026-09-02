import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { readReleaseArtifact } from '../../../scripts/read-release-artifact.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(packageRoot, '../..');
const fixtureRoot = await mkdtemp(resolve(tmpdir(), 'zadmin-miniapp-package-'));
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

let succeeded = false;
const started = performance.now();
try {
	await mkdir(tarballRoot, { recursive: true });
	const artifactDirectory = process.env.ZADMIN_RELEASE_ARTIFACTS_DIR;
	const artifactRevision = process.env.ZADMIN_RELEASE_ARTIFACTS_REVISION;
	if (artifactDirectory && !artifactRevision)
		throw new Error('ZADMIN_RELEASE_ARTIFACTS_REVISION is required with release artifacts.');
	let tarball;
	if (artifactDirectory)
		tarball = await readReleaseArtifact(artifactDirectory, '@zadmin/miniapp', artifactRevision);
	else {
		await runPnpm(['--filter', '@zadmin/miniapp', 'build'], workspaceRoot);
		await runPnpm(
			['--filter', '@zadmin/miniapp', 'pack', '--pack-destination', tarballRoot],
			workspaceRoot
		);
		const tarballName = (await readdir(tarballRoot)).find((name) =>
			name.includes('zadmin-miniapp')
		);
		if (!tarballName) throw new Error('Missing @zadmin/miniapp tarball.');
		tarball = `file:${resolve(tarballRoot, tarballName).replaceAll('\\', '/')}`;
	}

	await write(
		resolve(fixtureRoot, 'package.json'),
		`${JSON.stringify(
			{
				name: 'zadmin-miniapp-external-acceptance',
				private: true,
				version: '0.0.0',
				type: 'module',
				packageManager: 'pnpm@11.22.0',
				scripts: {
					build: 'miniapp build --project . --target wechat --output dist/wechat',
					check: 'svelte-check --tsconfig ./tsconfig.json && tsc --noEmit'
				},
				dependencies: {
					'@zadmin/miniapp': tarball,
					svelte: 'https://pkg.svelte.dev/svelte/c/eb7532dd70fb11b36258347c44cf3910d244f987'
				},
				devDependencies: {
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
		`packages:\n  - .\n\nallowBuilds:\n  esbuild: true\n`
	);
	await write(
		resolve(fixtureRoot, 'src/app.config.ts'),
		`import type { MiniappAppConfig } from '@zadmin/miniapp/compiler';
export default { pages: ['pages/index/index'], window: { navigationBarTitleText: 'External' } } satisfies MiniappAppConfig;
`
	);
	await write(
		resolve(fixtureRoot, 'src/app.svelte'),
		'<script>export function onLaunch() {}</script>\n'
	);
	await write(resolve(fixtureRoot, 'src/app.wxss'), 'page { background: #fff; }\n');
	await write(
		resolve(fixtureRoot, 'src/pages/index/index.config.ts'),
		`import type { MiniappPageConfig } from '@zadmin/miniapp/compiler';
export default { navigationBarTitleText: 'External' } satisfies MiniappPageConfig;
`
	);
	await write(
		resolve(fixtureRoot, 'src/pages/index/index.svelte'),
		`<script lang="ts">
import { MButton, MProvider, MStack, MText } from '@zadmin/miniapp';
let count = $state(0);
</script>
<MProvider><MStack><MText>count:{count}</MText><MButton onclick={() => count += 1}>increment</MButton></MStack></MProvider>
`
	);
	await write(
		resolve(fixtureRoot, 'src/types.ts'),
		`import type { MBoxProps } from '@zadmin/miniapp';
import type { NativeElementProps } from '@zadmin/miniapp/native';
const box: MBoxProps = {};
const camera: Pick<NativeElementProps<'camera'>, 'devicePosition'> = { devicePosition: 'back' };
void [box, camera];
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
					target: 'ES2022'
				},
				include: ['src/**/*.ts', 'src/**/*.svelte']
			},
			null,
			'\t'
		)}\n`
	);
	await write(resolve(fixtureRoot, 'svelte.config.js'), 'export default {};\n');

	await runPnpm(['install', '--no-frozen-lockfile'], fixtureRoot);
	await runPnpm(['install', '--frozen-lockfile'], fixtureRoot);
	await runPnpm(['run', 'check'], fixtureRoot);
	await runPnpm(['run', 'build'], fixtureRoot);
	const outputRoot = resolve(fixtureRoot, 'dist/wechat');
	const outputFiles = await readdir(outputRoot, { recursive: true });
	for (const file of outputFiles.filter((name) => name.endsWith('.js'))) {
		const output = await readFile(resolve(outputRoot, file), 'utf8');
		for (const forbidden of [
			'@tarojs',
			'@zadmin/miniapp/testing',
			workspaceRoot.replaceAll('\\', '/')
		]) {
			if (output.includes(forbidden)) throw new Error(`External output contains ${forbidden}.`);
		}
	}
	const report = {
		checkedAt: new Date().toISOString().slice(0, 10),
		durationMs: Math.round(performance.now() - started),
		packages: ['miniapp'],
		productionFiles: outputFiles.length,
		runtimes: { svelte: '5.56.10', target: 'wechat-direct' },
		status: 'passed'
	};
	await write(
		resolve(workspaceRoot, '.docs/miniapp/wechat-package-acceptance.json'),
		`${JSON.stringify(report, null, '\t')}\n`
	);
	succeeded = true;
	console.log(JSON.stringify(report));
} finally {
	if (succeeded) await rm(fixtureRoot, { force: true, recursive: true });
	else console.error(`Failed package fixture retained at ${fixtureRoot}`);
}
