import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
const publicEntrypoints = (await readdir(resolve(packageRoot, 'src/entrypoints')))
	.filter((name) => name.endsWith('.ts'))
	.map((name) => name.slice(0, -3))
	.sort();
if (publicEntrypoints.length === 0)
	throw new Error('ZUI package has no public source entrypoints.');
const publishExports = packageJson.publishConfig?.exports;
if (!publishExports || typeof publishExports !== 'object') {
	throw new Error('ZUI package must declare publishConfig.exports.');
}

const targets = [];
for (const [specifier, conditions] of Object.entries(publishExports)) {
	if (!conditions || typeof conditions !== 'object') {
		throw new Error(`ZUI export ${specifier} must declare condition targets.`);
	}
	for (const condition of ['types', 'svelte', 'default']) {
		const target = conditions[condition];
		if (typeof target !== 'string' || !target.startsWith('./dist/')) {
			throw new Error(`ZUI export ${specifier}.${condition} must target ./dist/.`);
		}
		if (target.includes('*')) {
			if (specifier !== './*') throw new Error(`Unexpected wildcard export target: ${target}.`);
			for (const entrypoint of publicEntrypoints) {
				targets.push(target.replace('*', entrypoint));
			}
		} else targets.push(target);
	}
}

for (const target of new Set(targets)) {
	try {
		await access(resolve(packageRoot, target.slice(2)));
	} catch {
		throw new Error(`ZUI published export target is missing: ${target}. Build the package first.`);
	}
}
for (const required of ['README.md', 'LICENSE']) {
	try {
		await access(resolve(packageRoot, required));
	} catch {
		throw new Error(`ZUI package is missing required publish file: ${required}.`);
	}
}

console.log(
	JSON.stringify({
		package: packageJson.name,
		version: packageJson.version,
		exports: Object.keys(publishExports),
		publicEntrypoints,
		checkedTargets: [...new Set(targets)].length,
		status: 'passed'
	})
);
