#!/usr/bin/env node
import { execFile as nodeExecFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

import { buildMiniapp, watchMiniapp } from './compiler/build.ts';

const execFile = promisify(nodeExecFile);

const [command = 'build', ...args] = process.argv.slice(2);
const value = (name: string, fallback: string): string => {
	const inline = args.find((argument) => argument.startsWith(`--${name}=`));
	if (inline !== undefined) return inline.slice(name.length + 3);
	const index = args.indexOf(`--${name}`);
	return index >= 0 ? (args[index + 1] ?? fallback) : fallback;
};
const target = value('target', 'wechat');
if (target !== 'wechat')
	throw new TypeError(`Miniapp v1 only supports --target wechat, got ${target}.`);
const projectRoot = resolve(value('project', process.cwd()));
const outputRoot = value('output', 'dist/wechat');

function runWechatide(args: readonly string[], timeout: number) {
	return process.platform === 'win32'
		? execFile(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'wechatide.cmd', ...args], {
				timeout,
				windowsHide: true
			})
		: execFile('wechatide', args, { timeout, windowsHide: true });
}

function assertWechatide(output: { readonly stdout: string }): void {
	const start = output.stdout.indexOf('{');
	if (start < 0) throw new Error('wechatide returned no JSON result.');
	const result = JSON.parse(output.stdout.slice(start)) as {
		readonly message?: string;
		readonly ok?: boolean;
	};
	if (result.ok !== true) throw new Error(result.message ?? 'wechatide operation failed.');
}

const wait = (milliseconds: number): Promise<void> =>
	new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));

async function refreshDevtools(buildId: string | undefined): Promise<void> {
	const client = process.env.ZADMIN_WECHATIDE_CLIENT;
	if (!client || !buildId) return;
	try {
		await wait(400);
		const cleared = await runWechatide(
			[
				'-c',
				client,
				'debug_clear_cache',
				'--project',
				projectRoot,
				'--action',
				'cleanCompileCache'
			],
			6000
		);
		assertWechatide(cleared);
		await wait(2000);
		const refreshed = await runWechatide(
			['-c', client, 'simulator_refresh', '--project', projectRoot],
			6000
		);
		assertWechatide(refreshed);
		process.stdout.write(`[miniapp] Refreshed DevTools for ${buildId}.\n`);
	} catch (error) {
		process.stderr.write(
			`[miniapp] DevTools refresh unavailable: ${error instanceof Error ? error.message : String(error)}\n`
		);
	}
}

if (command === 'build') {
	const result = await buildMiniapp({ outputRoot, projectRoot, target });
	process.stdout.write(`[miniapp] Built ${result.files.length} files in ${result.outputRoot}.\n`);
} else if (command === 'dev') {
	const close = watchMiniapp({
		dev: true,
		onBuild: async (result) => {
			process.stdout.write(
				`[miniapp] Rebuilt ${result.files.length} files${result.buildId ? ` (${result.buildId})` : ''}.\n`
			);
			await refreshDevtools(result.buildId);
		},
		outputRoot,
		projectRoot,
		target
	});
	const stop = (): void => void close().finally(() => process.exit(0));
	process.once('SIGINT', stop);
	process.once('SIGTERM', stop);
	process.stdout.write(`[miniapp] Watching ${projectRoot}.\n`);
} else {
	throw new TypeError(`Unknown Miniapp command "${command}". Use build or dev.`);
}
