import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(packageRoot, '../..');
const fixtureRoot = await mkdtemp(resolve(tmpdir(), 'zadmin-wechat-package-'));
const tarballRoot = resolve(fixtureRoot, 'tarballs');
const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) throw new Error('accept-package must be launched through pnpm.');

function runPnpm(args, cwd, capture = false) {
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
			if (!capture) process.stdout.write(chunk);
		});
		child.stderr.setEncoding('utf8').on('data', (chunk) => {
			output += chunk;
			if (!capture) process.stderr.write(chunk);
		});
		child.once('error', rejectRun);
		child.once('exit', (code) => {
			if (code === 0) resolveRun(output);
			else rejectRun(new Error(`pnpm ${args.join(' ')} failed (${code}).\n${output}`));
		});
	});
}

function fileSpec(path) {
	return `file:${path.replaceAll('\\', '/')}`;
}

async function write(path, content) {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content, 'utf8');
}

function collectVersions(node, packageName, output = new Set()) {
	if (
		(node?.name === packageName || node?.from === packageName) &&
		typeof node.version === 'string'
	) {
		output.add(node.version);
	}
	for (const dependency of Object.values(node?.dependencies ?? {}))
		collectVersions(dependency, packageName, output);
	return output;
}

let succeeded = false;
const started = performance.now();
try {
	await mkdir(tarballRoot, { recursive: true });
	for (const name of [
		'@zadmin/zui-core',
		'@zadmin/zui-svelte',
		'@zadmin/zui-taro',
		'@zadmin/svelte-taro'
	]) {
		await runPnpm(['--filter', name, 'build'], workspaceRoot);
		await runPnpm(['--filter', name, 'pack', '--pack-destination', tarballRoot], workspaceRoot);
	}
	const tarballs = (await readdir(tarballRoot)).map((name) => resolve(tarballRoot, name));
	const tarball = (name) => {
		const normalized = name.replace('@zadmin/', 'zadmin-');
		const match = tarballs.find((path) => path.replaceAll('\\', '/').includes(normalized));
		if (!match) throw new Error(`Missing tarball for ${name}.`);
		return fileSpec(match);
	};

	await write(
		resolve(fixtureRoot, 'package.json'),
		`${JSON.stringify(
			{
				name: 'zadmin-wechat-external-acceptance',
				private: true,
				version: '0.0.0',
				type: 'module',
				packageManager: 'pnpm@11.22.0',
				scripts: {
					build: 'taro build --type weapp --no-check',
					check: 'svelte-check --tsconfig ./tsconfig.json && tsc --noEmit'
				},
				dependencies: {
					'@tarojs/components': '4.2.1',
					'@tarojs/runtime': '4.2.1',
					'@tarojs/taro': '4.2.1',
					'@zadmin/svelte-taro': tarball('@zadmin/svelte-taro'),
					'@zadmin/zui-core': tarball('@zadmin/zui-core'),
					'@zadmin/zui-taro': tarball('@zadmin/zui-taro'),
					'@zadmin/zui-svelte': tarball('@zadmin/zui-svelte'),
					svelte: 'https://pkg.svelte.dev/svelte/c/eb7532dd70fb11b36258347c44cf3910d244f987'
				},
				devDependencies: {
					'@tarojs/cli': '4.2.1',
					'@tarojs/helper': '4.2.1',
					'@tarojs/plugin-platform-weapp': '4.2.1',
					'@tarojs/service': '4.2.1',
					'@tarojs/shared': '4.2.1',
					'@tarojs/vite-runner': '4.2.1',
					'svelte-check': '4.7.6',
					typescript: '6.0.3',
					vite: '4.5.14'
				}
			},
			null,
			'\t'
		)}\n`
	);
	await write(
		resolve(fixtureRoot, 'pnpm-workspace.yaml'),
		`packages:\n  - .\n\nallowBuilds:\n  '@parcel/watcher': true\n  '@swc/core': true\n  '@tarojs/binding': true\n  '@tarojs/cli': false\n  core-js: false\n  esbuild: true\n\noverrides:\n  '@tarojs/components>swiper': 12.1.2\n  '@tarojs/helper>esbuild': 0.25.12\n  '@zadmin/svelte-taro': '${tarball('@zadmin/svelte-taro')}'\n  '@zadmin/zui-core': '${tarball('@zadmin/zui-core')}'\n  '@zadmin/zui-taro': '${tarball('@zadmin/zui-taro')}'\n  '@zadmin/zui-svelte': '${tarball('@zadmin/zui-svelte')}'\n`
	);
	await write(
		resolve(fixtureRoot, 'config/index.ts'),
		`import { defineSvelteConfig } from '@zadmin/svelte-taro';
export default defineSvelteConfig({
	compiler: { type: 'vite' }, date: '2026-08-25', designWidth: 750,
	framework: 'svelte', mini: { enableSourceMap: true }, outputRoot: 'dist',
	plugins: ['@zadmin/svelte-taro'], projectName: 'external-acceptance', sourceRoot: 'src'
});
`
	);
	await write(
		resolve(fixtureRoot, 'src/app.config.ts'),
		`import type { AppConfig } from '@tarojs/taro';
export default { pages: ['pages/index/index'] } satisfies AppConfig;
`
	);
	await write(
		resolve(fixtureRoot, 'src/app.svelte'),
		'<script lang="ts">export function onLaunch(): void {}</script>\n'
	);
	await write(
		resolve(fixtureRoot, 'src/pages/index/index.config.ts'),
		`import type { PageConfig } from '@tarojs/taro';
export default { navigationBarTitleText: 'External fixture' } satisfies PageConfig;
`
	);
	await write(
		resolve(fixtureRoot, 'src/pages/index/index.svelte'),
		`<script lang="ts">
	import { Button, Stack, Text, ZuiProvider } from '@zadmin/zui-taro';
	let count = $state(0);
</script>
<ZuiProvider><Stack><Text>count:{count}</Text><Button onclick={() => count += 1}>increment</Button></Stack></ZuiProvider>
`
	);
	await write(
		resolve(fixtureRoot, 'src/module.ts'),
		`import { defineTaroModule } from '@zadmin/svelte-taro/module';
import { wechatCapabilities } from '@zadmin/svelte-taro/platform';
export const inventory = defineTaroModule({
	capabilities: { required: [wechatCapabilities.identity.login], optional: [wechatCapabilities.media.scan] },
	id: '@external/inventory', routes: ['./pages/index/index.svelte']
});
const route: './pages/index/index.svelte' = inventory.routes[0];
void route;
`
	);
	await write(
		resolve(fixtureRoot, 'src/types.ts'),
		`import type { BoxProps as WebBoxProps } from '@zadmin/zui-svelte';
import { __icssSlot } from '@zadmin/zui-svelte/internal';
import { useZuiTaroTheme } from '@zadmin/zui-taro/internal';
import type { NativeElementProps } from '@zadmin/svelte-taro/native';
const web: WebBoxProps = {};
const camera: Pick<NativeElementProps<'camera'>, 'devicePosition'> = { devicePosition: 'back' };
void [web, camera, __icssSlot, useZuiTaroTheme];
`
	);
	await write(
		resolve(fixtureRoot, 'tsconfig.json'),
		`${JSON.stringify(
			{
				compilerOptions: {
					allowJs: true,
					checkJs: true,
					module: 'ESNext',
					moduleResolution: 'Bundler',
					noEmit: true,
					skipLibCheck: true,
					strict: true,
					target: 'ES2022'
				},
				include: ['config/**/*.ts', 'src/**/*.ts', 'src/**/*.svelte']
			},
			null,
			'\t'
		)}\n`
	);
	await write(resolve(fixtureRoot, 'svelte.config.js'), 'export default {};\n');
	await write(
		resolve(fixtureRoot, 'project.config.json'),
		`${JSON.stringify(
			{
				appid: 'touristappid',
				compileType: 'miniprogram',
				miniprogramRoot: 'dist/',
				projectname: 'external-acceptance'
			},
			null,
			'\t'
		)}\n`
	);

	await runPnpm(['install'], fixtureRoot);
	await runPnpm(['install', '--frozen-lockfile'], fixtureRoot);
	await runPnpm(['run', 'check'], fixtureRoot);
	await runPnpm(['run', 'build'], fixtureRoot);
	const list = JSON.parse(
		await runPnpm(
			['list', 'svelte', '@tarojs/runtime', '--depth', 'Infinity', '--json'],
			fixtureRoot,
			true
		)
	)[0];
	const svelteVersions = [...collectVersions(list, 'svelte')];
	const runtimeVersions = [...collectVersions(list, '@tarojs/runtime')];
	if (svelteVersions.length !== 1 || runtimeVersions.length !== 1) {
		throw new Error(
			`Expected one Svelte and Taro runtime version, got ${svelteVersions.join(',')} / ${runtimeVersions.join(',')}.`
		);
	}
	const outputFiles = await readdir(resolve(fixtureRoot, 'dist'), { recursive: true });
	for (const file of outputFiles.filter(
		(value) => value.endsWith('.js') && !value.endsWith('.map')
	)) {
		const content = await readFile(resolve(fixtureRoot, 'dist', file), 'utf8');
		for (const forbidden of [
			'__ZADMIN_BUILD_ID__',
			'__zadmin_build_id__',
			'FakePlatformDriver',
			'@zadmin/svelte-taro/testing',
			workspaceRoot.replaceAll('\\', '/')
		]) {
			if (content.includes(forbidden)) throw new Error(`External output contains ${forbidden}.`);
		}
	}
	const report = {
		checkedAt: '2026-08-25',
		durationMs: Math.round(performance.now() - started),
		packages: ['zui-core', 'zui-svelte', 'zui-taro', 'svelte-taro'],
		productionFiles: outputFiles.length,
		runtimes: { svelte: svelteVersions[0], taro: runtimeVersions[0] },
		status: 'passed'
	};
	await write(
		resolve(workspaceRoot, 'apps/docs/content/wechat-package-acceptance.json'),
		`${JSON.stringify(report, null, '\t')}\n`
	);
	await write(
		resolve(workspaceRoot, 'apps/docs/content/wechat-package-acceptance.md'),
		`# WeChat clean-package acceptance\n\nPassed on 2026-08-25 from an empty system-temporary directory. The fixture installed all four packed libraries, repeated installation with a frozen lockfile, type-checked an external Taro module and native/ZUI types, and produced a Taro WeChat bundle.\n\n- Duration: ${report.durationMs} ms\n- Production files: ${report.productionFiles}\n- Resolved Svelte runtime: ${report.runtimes.svelte}\n- Resolved Taro runtime: ${report.runtimes.taro}\n- No workspace path, fake driver, testing entry, or development build ID was present in emitted JavaScript.\n`
	);
	succeeded = true;
	console.log(JSON.stringify(report));
} finally {
	if (succeeded) await rm(fixtureRoot, { recursive: true, force: true });
	else console.error(`Failed package fixture retained at ${fixtureRoot}`);
}
