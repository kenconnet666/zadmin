import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import {
	access,
	mkdtemp,
	mkdir,
	readFile,
	readdir,
	realpath,
	rm,
	writeFile
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readReleaseArtifact } from '../../../scripts/read-release-artifact.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(packageRoot, '../..');
const fixtureRoot = await realpath(
	await mkdtemp(resolve(tmpdir(), 'zadmin-zui-sveltekit-package-'))
);
const tarballRoot = resolve(fixtureRoot, 'tarballs');
const pnpmCli = process.env.npm_execpath;

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

async function stopOwnedChild(processHandle, timeoutMs = 5000) {
	if (!processHandle || processHandle.exitCode !== null || processHandle.signalCode !== null)
		return;
	await new Promise((resolveStop, rejectStop) => {
		let settled = false;
		const onExit = () => finish();
		const onError = (error) => finish(error);
		const timeout = setTimeout(
			() => finish(new Error(`External SSR host did not exit within ${timeoutMs}ms.`)),
			timeoutMs
		);
		const finish = (error) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			processHandle.removeListener('exit', onExit);
			processHandle.removeListener('error', onError);
			if (error) rejectStop(error);
			else resolveStop();
		};
		processHandle.once('exit', onExit);
		processHandle.once('error', onError);
		try {
			if (
				!processHandle.kill() &&
				processHandle.exitCode === null &&
				processHandle.signalCode === null
			)
				finish(new Error('External SSR host could not be stopped.'));
		} catch (error) {
			finish(error);
		}
	});
}

async function cleanupFixture(processHandle, path, validationSucceeded, timeoutMs = 5000) {
	let failure;
	try {
		await stopOwnedChild(processHandle, timeoutMs);
	} catch (error) {
		console.error('External package SSR child cleanup failed.', error);
		failure = error;
	}
	if (validationSucceeded && !failure) {
		try {
			await rm(path, { force: true, maxRetries: 5, recursive: true, retryDelay: 100 });
		} catch (error) {
			console.error('External package fixture cleanup failed.', error);
			failure = error;
		}
	}
	if (!validationSucceeded || failure) console.error(`Failed package fixture retained at ${path}`);
	return failure;
}

async function pathExists(path) {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

if (process.argv.includes('--cleanup-self-test')) {
	const noChildRoot = await mkdtemp(resolve(tmpdir(), 'zadmin-package-cleanup-no-child-'));
	if (await cleanupFixture(undefined, noChildRoot, true))
		throw new Error('External package cleanup self-test rejected an absent child.');
	if (await pathExists(noChildRoot))
		throw new Error('External package cleanup self-test retained its no-child fixture.');

	const exitedChild = spawn(process.execPath, ['-e', ''], { stdio: 'ignore', windowsHide: true });
	await new Promise((resolveExit, rejectExit) => {
		exitedChild.once('exit', resolveExit);
		exitedChild.once('error', rejectExit);
	});
	const exitedRoot = await mkdtemp(resolve(tmpdir(), 'zadmin-package-cleanup-exited-'));
	if (await cleanupFixture(exitedChild, exitedRoot, true))
		throw new Error('External package cleanup self-test rejected an exited child.');
	if (await pathExists(exitedRoot))
		throw new Error('External package cleanup self-test retained its exited-child fixture.');

	const stuckChild = new EventEmitter();
	stuckChild.exitCode = null;
	stuckChild.signalCode = null;
	stuckChild.kill = () => true;
	const timeoutRoot = await mkdtemp(resolve(tmpdir(), 'zadmin-package-cleanup-timeout-'));
	const timeoutFailure = await cleanupFixture(stuckChild, timeoutRoot, true, 10);
	if (!timeoutFailure || !(await pathExists(timeoutRoot)))
		throw new Error('External package cleanup self-test did not retain its timed-out fixture.');
	await rm(timeoutRoot, { force: true, maxRetries: 5, recursive: true, retryDelay: 100 });

	const child = spawn(process.execPath, ['-e', 'setInterval(() => undefined, 1000)'], {
		stdio: 'ignore',
		windowsHide: true
	});
	await new Promise((resolveSpawn, rejectSpawn) => {
		child.once('spawn', resolveSpawn);
		child.once('error', rejectSpawn);
	});
	await stopOwnedChild(child);
	if (child.exitCode === null && child.signalCode === null)
		throw new Error('External package cleanup self-test left its child running.');
	await rm(fixtureRoot, { force: true, maxRetries: 5, recursive: true, retryDelay: 100 });
	console.log('External package cleanup self-test passed.');
	process.exit(0);
}
if (!pnpmCli) throw new Error('accept-zui-package must be launched through pnpm.');

let succeeded = false;
let server;
let cleanupFailure;
try {
	await mkdir(tarballRoot, { recursive: true });
	const artifactDirectory = process.env.ZADMIN_RELEASE_ARTIFACTS_DIR;
	const artifactRevision = process.env.ZADMIN_RELEASE_ARTIFACTS_REVISION;
	if (artifactDirectory && !artifactRevision)
		throw new Error('ZADMIN_RELEASE_ARTIFACTS_REVISION is required with release artifacts.');
	if (!artifactDirectory) {
		for (const packageName of ['@zadmin/core', '@zadmin/zui', '@zadmin/sveltekit']) {
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
				name: 'zadmin-zui-sveltekit-external-acceptance',
				private: true,
				version: '0.0.0',
				type: 'module',
				packageManager: 'pnpm@11.22.0',
				scripts: {
					build: 'vite build',
					check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json',
					'test:zui': 'node testing.mjs'
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
		`packages:\n  - .\n\noverrides:\n  '@zadmin/core': '${tarball('@zadmin/core')}'\n  '@zadmin/sveltekit': '${tarball('@zadmin/sveltekit')}'\n  '@zadmin/zui': '${tarball('@zadmin/zui')}'\n  # https://github.com/postcss/postcss/issues/2154\n  postcss: '8.5.28'\n\nallowBuilds:\n  '@parcel/watcher': true\n  esbuild: true\n`
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
		`<script>
import { ZProvider } from '@zadmin/zui';
let { children } = $props();
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
	await write(
		resolve(fixtureRoot, 'src/date-time-component-types.ts'),
		// language=TypeScript
		`import type { ComponentProps } from 'svelte';
import { ZDateTimeField, ZDateTimePicker, ZDateTimeRangePicker } from '@zadmin/zui';
import type {
  ZDateTimeFieldLocalProps,
  ZDateTimeFieldZonedProps,
  ZDateTimeRangePickerLocalProps,
  ZDateTimeRangePickerZonedProps
} from '@zadmin/zui';

declare const local: NonNullable<ZDateTimeFieldLocalProps['value']>;
declare const zoned: NonNullable<ZDateTimeFieldZonedProps['value']>;
declare const localRange: NonNullable<ZDateTimeRangePickerLocalProps['value']>;
declare const zonedRange: NonNullable<ZDateTimeRangePickerZonedProps['value']>;

const fieldLocal = { value: local, onValueChange: (value) => value?.hour } satisfies ComponentProps<typeof ZDateTimeField>;
const fieldZoned = { mode: 'zoned', value: zoned, onValueChange: (value) => value?.timeZone } satisfies ComponentProps<typeof ZDateTimeField>;
const pickerInline = { presentation: 'inline', value: local, onCommit: (value) => value?.minute } satisfies ComponentProps<typeof ZDateTimePicker>;
const pickerZonedInline = { mode: 'zoned', presentation: 'inline', value: zoned, onCommit: (value) => value?.timeZone } satisfies ComponentProps<typeof ZDateTimePicker>;
const rangeInline = { presentation: 'inline', value: localRange, onValueChange: (value) => value?.end?.hour } satisfies ComponentProps<typeof ZDateTimeRangePicker>;
const rangeZonedInline = { mode: 'zoned', presentation: 'inline', value: zonedRange, onValueChange: (value) => value?.start?.timeZone } satisfies ComponentProps<typeof ZDateTimeRangePicker>;

// @ts-expect-error inline presentation excludes popup ownership.
const invalidInlineOpen: ComponentProps<typeof ZDateTimePicker> = { presentation: 'inline', open: true, value: local };
// @ts-expect-error zoned range rejects local endpoints.
const invalidZonedRange: ComponentProps<typeof ZDateTimeRangePicker> = { mode: 'zoned', presentation: 'inline', value: localRange };

void [fieldLocal, fieldZoned, pickerInline, pickerZonedInline, rangeInline, rangeZonedInline, invalidInlineOpen, invalidZonedRange];
`
	);
	await write(
		resolve(fixtureRoot, 'src/transfer-component-types.ts'),
		// language=TypeScript
		`import type { ComponentProps } from 'svelte';
import {
  ZTransfer,
  type TransferItem,
  type TransferMoveRequest,
  type ZTransferProps
} from '@zadmin/zui';

const items = [
  { key: 0, label: 'Numeric zero' },
  { key: '0', label: 'String zero' }
] as const satisfies readonly TransferItem[];

const immediate = {
  'aria-label': 'Immediate transfer',
  class: 'external-transfer',
  items,
  onValueChange: (value: readonly (number | string)[]) => value.length,
  ref: null,
  value: [0]
} satisfies ComponentProps<typeof ZTransfer>;
const requested = {
  items,
  moveMode: 'request',
  onMoveRequest: async (request: TransferMoveRequest) => request.destination === 'target',
  value: [0]
} satisfies ComponentProps<typeof ZTransfer>;
const immediatePublic: ZTransferProps = immediate;
const requestedPublic: ZTransferProps = requested;

// @ts-expect-error Request mode requires onMoveRequest.
const missingRequestHandler: ComponentProps<typeof ZTransfer> = { items, moveMode: 'request', value: [0] };
// @ts-expect-error Request mode cannot compete with onValueChange.
const requestWithValueCallback: ComponentProps<typeof ZTransfer> = { items, moveMode: 'request', onMoveRequest: () => true, onValueChange: () => undefined, value: [0] };
// @ts-expect-error Immediate mode cannot declare onMoveRequest.
const immediateWithRequestHandler: ComponentProps<typeof ZTransfer> = { items, onMoveRequest: () => true, value: [0] };

void [immediate, requested, immediatePublic, requestedPublic, missingRequestHandler, requestWithValueCallback, immediateWithRequestHandler];
`
	);
	await write(
		resolve(fixtureRoot, 'testing.mjs'),
		`import { defaultTheme } from '@zadmin/zui/theme';
import { createPluginRouteHandle } from '@zadmin/sveltekit/server';
import {
  createHandleFixture,
  createJsonRouteFixture,
  createRouteRequest,
  createSsrResolveFixture,
  createTestSvelteKitHost
} from '@zadmin/sveltekit/testing';
import {
  assertIcssClassName,
  assertIcssResourcesStable,
  createIcssFixture,
  createTestIcssRuntime
} from '@zadmin/zui/testing';
const harness = createTestIcssRuntime();
const before = harness.snapshot();
assertIcssResourcesStable(before, harness.snapshot());
const fixture = createIcssFixture(harness, defaultTheme, (s) => s.display.flex);
assertIcssClassName(fixture.className);
if (fixture.snapshot.metrics.classes !== 1 || !fixture.snapshot.cssText.includes('display:flex')) {
  throw new Error('External ZUI testing fixture produced an invalid snapshot.');
}
const host = createTestSvelteKitHost();
host.routes.add('fixture', createJsonRouteFixture({ body: { ready: true }, path: '/health' }));
const resolve = createSsrResolveFixture({ html: 'fallback', status: 404 });
const response = await createPluginRouteHandle(host.routes)(
  createHandleFixture(createRouteRequest('/health'), resolve)
);
if (!response.ok || !(await response.json()).ready) {
  throw new Error('External SvelteKit server/testing entries produced an invalid response.');
}
console.log('External ZUI and SvelteKit testing entry acceptance passed.');
`
	);

	await runPnpm(['install', '--no-frozen-lockfile'], fixtureRoot);
	await runPnpm(['install', '--frozen-lockfile'], fixtureRoot);
	await runPnpm(['test:zui'], fixtureRoot);
	await runPnpm(['check'], fixtureRoot);
	await runPnpm(['build'], fixtureRoot);

	for (const file of (
		await readdir(resolve(fixtureRoot, 'build/client'), { recursive: true })
	).filter((name) => name.endsWith('.js'))) {
		const output = await readFile(resolve(fixtureRoot, 'build/client', file), 'utf8');
		if (output.includes(workspaceRoot) || output.includes(workspaceRoot.replaceAll('\\', '/'))) {
			throw new Error(`External client output contains workspace path: ${file}`);
		}
		if (
			/node:async_hooks|@zadmin\/zui\/(?:compiler|testing)|@zadmin\/sveltekit\/(?:server|testing|zui)/u.test(
				output
			)
		) {
			throw new Error(`External client output contains server/compiler code: ${file}`);
		}
		if (output.includes('shiki')) {
			throw new Error(`External root-only client output unexpectedly contains Shiki: ${file}`);
		}
	}

	await write(
		resolve(fixtureRoot, 'src/routes/code/+page.svelte'),
		`<script lang="ts">
import { ZCode } from '@zadmin/zui/code';
const source = 'const ready: boolean = true;';
</script>
<h1>External ZCode</h1><ZCode code={source} lang="typescript" lineNumbers />
`
	);
	await runPnpm(['add', '--save-exact', 'shiki@4.4.3'], fixtureRoot);
	await runPnpm(['check'], fixtureRoot);
	await runPnpm(['build'], fixtureRoot);

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
	const codeResponse = await fetch(`http://127.0.0.1:${port}/code`);
	const codeHtml = await codeResponse.text();
	if (
		!codeResponse.ok ||
		!codeHtml.includes('External ZCode') ||
		!codeHtml.includes('const ready')
	) {
		throw new Error('External ZCode optional-peer route did not render stable SSR output.');
	}

	succeeded = true;
	console.log('External ZUI + SvelteKit tarball SSR acceptance passed.');
} finally {
	cleanupFailure = await cleanupFixture(server, fixtureRoot, succeeded);
}
if (cleanupFailure) throw cleanupFailure;
