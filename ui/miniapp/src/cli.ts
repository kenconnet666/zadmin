#!/usr/bin/env node
import { buildMiniapp, watchMiniapp } from './compiler/build.ts';

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
const projectRoot = value('project', process.cwd());
const outputRoot = value('output', 'dist/wechat');

if (command === 'build') {
	const result = await buildMiniapp({ outputRoot, projectRoot, target });
	process.stdout.write(`[miniapp] Built ${result.files.length} files in ${result.outputRoot}.\n`);
} else if (command === 'dev') {
	const close = watchMiniapp({ dev: true, outputRoot, projectRoot, target });
	const stop = (): void => void close().finally(() => process.exit(0));
	process.once('SIGINT', stop);
	process.once('SIGTERM', stop);
	process.stdout.write(`[miniapp] Watching ${projectRoot}.\n`);
} else {
	throw new TypeError(`Unknown Miniapp command "${command}". Use build or dev.`);
}
