import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(packageRoot, '../..');
const fixtureRoot = await realpath(
	await mkdtemp(resolve(tmpdir(), 'zadmin-zui-sveltekit-package-'))
);
const tarballRoot = resolve(fixtureRoot, 'tarballs');
const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) throw new Error('accept-zui-package must be launched through pnpm.');

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

async function waitForServer(url, processHandle) {
	const deadline = Date.now() + 15_000;
	while (Date.now() < deadline) {
		if (processHandle.exitCode !== null)
			throw new Error(`External SSR host exited with ${processHandle.exitCode}.`);
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
			if (response.ok) return response;
		} catch {
			// The server is still starting.
		}
		await new Promise((resolveWait) => setTimeout(resolveWait, 100));
	}
	throw new Error('External SSR host did not become ready.');
}

let succeeded = false;
let server;
try {
	await mkdir(tarballRoot, { recursive: true });
	for (const packageName of ['@zadmin/core', '@zadmin/zui', '@zadmin/sveltekit']) {
		await runPnpm(['--filter', packageName, 'build'], workspaceRoot);
		await runPnpm(
			['--filter', packageName, 'pack', '--pack-destination', tarballRoot],
			workspaceRoot
		);
	}
	const tarballs = (await readdir(tarballRoot)).map((name) => resolve(tarballRoot, name));
	const tarball = (name) => {
		const marker = name.replace('@zadmin/', 'zadmin-');
		const match = tarballs.find((path) => basename(path).includes(marker));
		if (!match) throw new Error(`Missing tarball for ${name}.`);
		return `file:${match.replaceAll('\\', '/')}`;
	};

	await write(
		resolve(fixtureRoot, 'package.json'),
		`${JSON.stringify(
			{
				name: 'zadmin-zui-sveltekit-external-acceptance',
				private: true,
				version: '0.0.0',
				type: 'module',
				packageManager: 'pnpm@11.22.0',
				scripts: {
					build: 'vite build',
					check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json'
				},
				dependencies: {
					'@sveltejs/adapter-node': '5.5.7',
					'@sveltejs/kit': '2.70.3',
					'@zadmin/core': tarball('@zadmin/core'),
					'@zadmin/sveltekit': tarball('@zadmin/sveltekit'),
					'@zadmin/zui': tarball('@zadmin/zui'),
					svelte: '5.56.10'
				},
				devDependencies: {
					'@sveltejs/vite-plugin-svelte': '7.3.0',
					'@types/node': '26.2.0',
					'svelte-check': '4.7.6',
					typescript: '6.0.3',
					vite: '8.2.2'
				}
			},
			null,
			'\t'
		)}\n`
	);
	await write(
		resolve(fixtureRoot, 'pnpm-workspace.yaml'),
		`packages:\n  - .\n\noverrides:\n  '@zadmin/core': '${tarball('@zadmin/core')}'\n  '@zadmin/sveltekit': '${tarball('@zadmin/sveltekit')}'\n  '@zadmin/zui': '${tarball('@zadmin/zui')}'\n\nallowBuilds:\n  '@parcel/watcher': true\n  esbuild: true\n`
	);
	await write(
		resolve(fixtureRoot, 'svelte.config.js'),
		`import adapter from '@sveltejs/adapter-node';
import { icssPreprocess } from '@zadmin/zui/compiler';
export default { kit: { adapter: adapter() }, preprocess: [icssPreprocess()] };
`
	);
	await write(
		resolve(fixtureRoot, 'vite.config.ts'),
		`import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
export default defineConfig({ plugins: [sveltekit()] });
`
	);
	await write(
		resolve(fixtureRoot, 'tsconfig.json'),
		`${JSON.stringify(
			{
				extends: './.svelte-kit/tsconfig.json',
				compilerOptions: {
					allowJs: true,
					checkJs: true,
					moduleResolution: 'Bundler',
					strict: true
				}
			},
			null,
			'\t'
		)}\n`
	);
	await write(
		resolve(fixtureRoot, 'src/app.html'),
		'<!doctype html><html lang="en"><head><meta charset="utf-8" />%sveltekit.head%</head><body><div style="display: contents">%sveltekit.body%</div></body></html>\n'
	);
	await write(
		resolve(fixtureRoot, 'src/hooks.server.ts'),
		`import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { zuiHandle } from '@zadmin/sveltekit/zui';
const base: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  const headers = new Headers(response.headers);
  headers.set('content-security-policy', "default-src 'self'; style-src 'self'");
  return new Response(response.body, { headers, status: response.status, statusText: response.statusText });
};
export const handle = sequence(zuiHandle({ csp: { hash: true } }), base);
`
	);
	await write(
		resolve(fixtureRoot, 'src/routes/+layout.svelte'),
		`<script lang="ts">
import type { Snippet } from 'svelte';
import { ZProvider } from '@zadmin/zui';
let { children }: { children?: Snippet } = $props();
</script>
<ZProvider>{@render children?.()}</ZProvider>
`
	);
	await write(
		resolve(fixtureRoot, 'src/routes/+page.svelte'),
		`<script lang="ts">
import { ZBox, ZButton, ZStack, ZText, defaultTheme, icss } from '@zadmin/zui';
const panel = icss(defaultTheme, (s) => { s.padding._large; s.backgroundColor._surface; });
</script>
<ZBox class={panel}><ZStack><ZText as="strong">External ZUI SSR</ZText><ZButton>Ready</ZButton></ZStack></ZBox>
`
	);

	await runPnpm(['install', '--no-frozen-lockfile'], fixtureRoot);
	await runPnpm(['install', '--frozen-lockfile'], fixtureRoot);
	await runPnpm(['check'], fixtureRoot);
	await runPnpm(['build'], fixtureRoot);

	for (const file of (
		await readdir(resolve(fixtureRoot, 'build/client'), { recursive: true })
	).filter((name) => name.endsWith('.js'))) {
		const output = await readFile(resolve(fixtureRoot, 'build/client', file), 'utf8');
		if (output.includes(workspaceRoot) || output.includes(workspaceRoot.replaceAll('\\', '/'))) {
			throw new Error(`External client output contains workspace path: ${file}`);
		}
		if (/node:async_hooks|@zadmin\/zui\/compiler|@zadmin\/sveltekit\/zui/u.test(output)) {
			throw new Error(`External client output contains server/compiler code: ${file}`);
		}
	}

	const port = 43_000 + (process.pid % 1000);
	server = spawn(process.execPath, ['build'], {
		cwd: fixtureRoot,
		env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
		stdio: ['ignore', 'pipe', 'pipe'],
		windowsHide: true
	});
	const response = await waitForServer(`http://127.0.0.1:${port}/`, server);
	const html = await response.text();
	if (!html.includes('External ZUI SSR') || !html.includes('data-icss=')) {
		throw new Error('External SSR response is missing ZUI content or critical CSS.');
	}
	if (
		!/style-src-elem[^;]*'sha256-[A-Za-z0-9+/=]+'/u.test(
			response.headers.get('content-security-policy') ?? ''
		)
	) {
		throw new Error('External SSR response is missing the ZUI CSP style hash.');
	}

	succeeded = true;
	console.log('External ZUI + SvelteKit tarball SSR acceptance passed.');
} finally {
	server?.kill();
	if (succeeded) await rm(fixtureRoot, { force: true, recursive: true });
	else console.error(`Failed package fixture retained at ${fixtureRoot}`);
}
