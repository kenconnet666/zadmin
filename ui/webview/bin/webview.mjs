#!/usr/bin/env node
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const cliPath = fileURLToPath(new URL('../dist/build/cli.js', import.meta.url));
let buildAvailable = true;

try {
	await access(cliPath, constants.R_OK);
} catch {
	buildAvailable = false;
	console.error(
		`@zadmin/webview CLI build is missing at ${cliPath}. Run \`pnpm --filter @zadmin/webview build\` before invoking \`webview\`.`
	);
	process.exitCode = 1;
}

if (buildAvailable) await import(pathToFileURL(cliPath).href);
