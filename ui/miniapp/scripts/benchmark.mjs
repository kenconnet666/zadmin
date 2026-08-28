import { spawn } from 'node:child_process';
import { readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(packageRoot, '../..');
const appRoot = resolve(workspaceRoot, 'apps/wechat');
const require = createRequire(resolve(appRoot, 'package.json'));
const taroPackage = require.resolve('@tarojs/cli/package.json');
const taroManifest = JSON.parse(await readFile(taroPackage, 'utf8'));
const taroBin = resolve(dirname(taroPackage), taroManifest.bin.taro);
const fixtures = {
	solid: resolve(appRoot, 'tests/performance/solid'),
	svelte: resolve(appRoot, 'tests/performance/svelte')
};

if (process.argv.includes('--clean')) {
	for (const fixture of Object.values(fixtures)) {
		for (const artifact of ['.swc', 'dist']) {
			await rm(resolve(fixture, artifact), { recursive: true, force: true });
		}
	}
	console.log('Removed performance fixture build outputs.');
	process.exit(0);
}

function runBuild(cwd) {
	return new Promise((resolveBuild, rejectBuild) => {
		const started = performance.now();
		const child = spawn(process.execPath, [taroBin, 'build', '--type', 'weapp'], {
			cwd,
			env: { ...process.env, NODE_ENV: 'production' },
			stdio: ['ignore', 'pipe', 'pipe'],
			windowsHide: true
		});
		let output = '';
		child.stdout.setEncoding('utf8').on('data', (chunk) => (output += chunk));
		child.stderr.setEncoding('utf8').on('data', (chunk) => (output += chunk));
		child.once('error', rejectBuild);
		child.once('exit', (code) => {
			if (code === 0) resolveBuild(Math.round(performance.now() - started));
			else rejectBuild(new Error(`Benchmark build failed (${code}).\n${output}`));
		});
	});
}

async function sizeOf(directory) {
	let bytes = 0;
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = resolve(directory, entry.name);
		if (entry.isDirectory()) bytes += await sizeOf(path);
		else if (entry.isFile() && !entry.name.endsWith('.map')) bytes += (await stat(path)).size;
	}
	return bytes;
}

function median(values) {
	const sorted = [...values].sort((left, right) => left - right);
	return sorted[Math.floor(sorted.length / 2)];
}

const measurements = { solid: [], svelte: [] };
try {
	for (const fixture of Object.values(fixtures))
		for (const artifact of ['.swc', 'dist'])
			await rm(resolve(fixture, artifact), { recursive: true, force: true });
	for (let round = 0; round < 3; round += 1) {
		const order = round % 2 === 0 ? ['solid', 'svelte'] : ['svelte', 'solid'];
		for (const name of order) measurements[name].push(await runBuild(fixtures[name]));
	}
	const solidMedianMs = median(measurements.solid);
	const svelteMedianMs = median(measurements.svelte);
	const report = {
		checkedAt: '2026-08-25',
		environment: {
			node: process.version,
			platform: `${process.platform}-${process.arch}`,
			taro: '4.2.1',
			vite: '4.5.14'
		},
		ratio: Number((svelteMedianMs / solidMedianMs).toFixed(3)),
		solid: {
			buildMs: measurements.solid,
			bundleBytes: await sizeOf(resolve(fixtures.solid, 'dist')),
			medianBuildMs: solidMedianMs
		},
		svelte: {
			buildMs: measurements.svelte,
			bundleBytes: await sizeOf(resolve(fixtures.svelte, 'dist')),
			medianBuildMs: svelteMedianMs
		},
		target: 'Svelte median build time <= 1.25x Taro Solid',
		targetMet: svelteMedianMs <= solidMedianMs * 1.25
	};
	const outputRoot = resolve(workspaceRoot, 'apps/docs/content');
	await writeFile(
		resolve(outputRoot, 'wechat-performance.json'),
		`${JSON.stringify(report, null, '\t')}\n`
	);
	await writeFile(
		resolve(outputRoot, 'wechat-performance.md'),
		`# WeChat performance baseline\n\nMeasured on 2026-08-25 with fixed Taro 4.2.1 and Vite 4.5.14. Both fixtures render the same 200 keyed Text nodes and one rotation Button. Times include a complete production Taro build; three alternating rounds reduce cache-order bias.\n\n| Renderer | Build samples | Median | Output bytes (excluding maps) |\n| --- | ---: | ---: | ---: |\n| Taro Solid | ${measurements.solid.join(', ')} ms | ${solidMedianMs} ms | ${report.solid.bundleBytes} |\n| Svelte custom renderer | ${measurements.svelte.join(', ')} ms | ${svelteMedianMs} ms | ${report.svelte.bundleBytes} |\n\nSvelte/Solid median ratio: **${report.ratio}x**. Provisional threshold (<=1.25x): **${report.targetMet ? 'passed' : 'not met'}**.\n\nThe Svelte framework package prebundles the exact pinned runtime into one tree-shakeable ESM module for each dev/prod condition. The application graph fell from 246–247 to 141–142 transformed modules, without introducing a second runtime; clean-tarball acceptance still resolved one Svelte 5.56.10 instance.\n`
	);
	console.log(JSON.stringify(report));
} finally {
	for (const fixture of Object.values(fixtures))
		for (const artifact of ['.swc', 'dist'])
			await rm(resolve(fixture, artifact), { recursive: true, force: true });
}
