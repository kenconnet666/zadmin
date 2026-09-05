import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;

function pnpmCommand(args) {
	const path = process.env.npm_execpath;
	if (!path)
		throw new Error('Run through pnpm release:version to use the workspace package manager.');
	return /\.[cm]?js$/iu.test(path)
		? { command: process.execPath, args: [path, ...args] }
		: { command: path, args };
}

async function versionPackages({ readVersion, run }) {
	const previous = await readVersion();
	await run(['exec', 'changeset', 'version']);
	const current = await readVersion();
	if (!stableVersion.test(current))
		throw new Error('ZUI release preparation requires a stable x.y.z package version.');
	if (current !== previous) {
		await run(['--filter', '@zadmin/zui', 'metadata:since:materialize', current]);
	}
	// Versions participate in support, route and release contracts. Regenerate in the
	// same release commit, after metadata is materialized, even for sibling package bumps.
	await run(['zui:artifacts:update']);
}

async function selfTest() {
	const simulate = async (versions, failOn) => {
		const calls = [];
		let readIndex = 0;
		let failure;
		try {
			await versionPackages({
				readVersion: async () => versions[readIndex++],
				run: async (args) => {
					calls.push(args);
					if (calls.length === failOn) throw new Error('step failed');
				}
			});
		} catch (error) {
			failure = error;
		}
		return { calls, failure };
	};
	const changed = await simulate(['0.1.0', '0.2.0']);
	assert.equal(changed.failure, undefined);
	assert.deepEqual(changed.calls, [
		['exec', 'changeset', 'version'],
		['--filter', '@zadmin/zui', 'metadata:since:materialize', '0.2.0'],
		['zui:artifacts:update']
	]);
	const unchanged = await simulate(['0.1.0', '0.1.0']);
	assert.equal(unchanged.failure, undefined);
	assert.deepEqual(unchanged.calls, [['exec', 'changeset', 'version'], ['zui:artifacts:update']]);
	for (const step of [1, 2, 3]) {
		const failed = await simulate(['0.1.0', '0.2.0'], step);
		assert.match(failed.failure?.message ?? '', /step failed/u);
		assert.equal(failed.calls.length, step);
	}
	for (const invalid of ['0.2.0-beta.1', undefined, 'invalid']) {
		const failed = await simulate(['0.1.0', invalid]);
		assert.match(failed.failure?.message ?? '', /stable x.y.z/u);
		assert.equal(failed.calls.length, 1);
	}
	const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
	assert.equal(manifest.scripts['release:version'], 'node scripts/version-packages.mjs');
	assert.equal(
		manifest.scripts['release:version:self-test'],
		'node scripts/version-packages.mjs --self-test'
	);
	const workflow = await readFile(
		new URL('../.github/workflows/release.yml', import.meta.url),
		'utf8'
	);
	assert.match(workflow, /script: pnpm release:version\s/u);
	const ci = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
	assert.ok(ci.includes('pnpm release:version:self-test'));
	const launcher = pnpmCommand(['--version']);
	const probe = spawnSync(launcher.command, launcher.args, {
		cwd: root,
		env: process.env,
		encoding: 'utf8'
	});
	if (probe.error) throw probe.error;
	assert.equal(probe.status, 0, 'The current pnpm launcher must execute without a shell.');
	assert.match(probe.stdout.trim(), /^\d+\.\d+\.\d+/u);
	console.log('Release version orchestration self-test passed (no files versioned or published).');
}

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--self-test') {
	await selfTest();
} else if (args.length !== 0) {
	throw new Error('Usage: pnpm release:version or pnpm release:version:self-test');
} else {
	pnpmCommand([]);
	await versionPackages({
		readVersion: async () =>
			JSON.parse(await readFile(new URL('../ui/zui/package.json', import.meta.url), 'utf8'))
				.version,
		run: async (commandArgs) => {
			const launcher = pnpmCommand(commandArgs);
			const result = spawnSync(launcher.command, launcher.args, {
				cwd: root,
				env: process.env,
				stdio: 'inherit'
			});
			if (result.error) throw result.error;
			if (result.status !== 0)
				throw new Error(
					`Release preparation failed: pnpm ${commandArgs.join(' ')} (exit ${result.status ?? result.signal}).`
				);
		}
	});
}
