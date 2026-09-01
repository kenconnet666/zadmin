import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const testsRoot = join(packageRoot, 'tests');
const failures = [];

for (const entry of readdirSync(testsRoot, { withFileTypes: true })) {
	if (!entry.isFile() || !entry.name.endsWith('.browser.spec.ts')) continue;
	const path = join(testsRoot, entry.name);
	const source = readFileSync(path, 'utf8');
	const usesDirectMount = /\bmount\s*\(/u.test(source);
	const usesDirectUnmount = /\bunmount\s*\(/u.test(source);
	if (/import\s*\{[^}]*\b(?:mount|unmount)\b[^}]*\}\s*from\s*['"]svelte['"]/su.test(source)) {
		failures.push(`${entry.name} imports imperative lifecycle functions directly from svelte.`);
	}
	if ((usesDirectMount || usesDirectUnmount) && !source.includes("from './browser-lifecycle.js'")) {
		failures.push(
			`${entry.name} uses imperative mount/unmount without the tracked lifecycle adapter.`
		);
	}
}

const setupPath = join(testsRoot, 'browser.setup.ts');
const setup = readFileSync(setupPath, 'utf8');
for (const required of ['cleanupDirectMounts', 'cleanup()', 'vi.restoreAllMocks()']) {
	if (!setup.includes(required)) failures.push(`browser.setup.ts does not invoke ${required}.`);
}

if (failures.length > 0) {
	throw new Error(
		`Browser lifecycle audit failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`
	);
}

console.log(
	`Browser lifecycle audit passed (${relative(packageRoot, testsRoot).replaceAll('\\', '/')} imperative mounts are tracked).`
);
