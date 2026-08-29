#!/usr/bin/env node
import { resolve } from 'node:path';

import { buildWebviewTargets, devWebviewTarget, loadWebviewConfig } from './runner.js';
import type { WebviewTarget } from './config.js';

const [command, ...args] = process.argv.slice(2);
const value = (name: string) => {
	const index = args.indexOf(name);
	return index >= 0 ? args[index + 1] : undefined;
};
const projectRoot = resolve(value('--project') ?? process.cwd());
const target = (value('--target') ?? 'windows-x64') as WebviewTarget | 'all';
const config = await loadWebviewConfig(projectRoot, value('--config'));

if (command === 'build') {
	await buildWebviewTargets({ config, projectRoot, target });
} else if (command === 'dev') {
	if (target === 'all') throw new Error('webview dev requires one target.');
	await devWebviewTarget({
		config,
		projectRoot,
		smokeReportPath: value('--smoke-report'),
		target
	});
} else {
	throw new Error('Usage: webview <build|dev> --target <windows-x64|windows-arm64|all>');
}
