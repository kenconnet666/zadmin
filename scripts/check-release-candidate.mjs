import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateArtifactManifest } from './read-release-artifact.mjs';
import { releasePackageNames } from './release-package-set.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const revisionPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const versionPattern = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u;
const isMain = process.argv[1]
	? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
	: false;

async function workspacePackages(workspaceRoot = root) {
	const facts = new Map();
	for (const directory of ['apps', 'packages', 'plugins', 'ui']) {
		for (const entry of await readdir(resolve(workspaceRoot, directory), { withFileTypes: true })) {
			if (!entry.isDirectory()) continue;
			try {
				const path = resolve(workspaceRoot, directory, entry.name, 'package.json');
				const json = JSON.parse(await readFile(path, 'utf8'));
				if (json.private !== true && typeof json.name === 'string')
					facts.set(json.name, json.version);
			} catch (error) {
				if (error?.code !== 'ENOENT') throw error;
			}
		}
	}
	return facts;
}

export function validateReleaseCandidate({ manifest, workspaceVersions, expectedRevision, tag }) {
	validateArtifactManifest(manifest);
	if (!revisionPattern.test(expectedRevision ?? ''))
		throw new Error(`Release candidate expected revision is invalid: ${expectedRevision}.`);
	if (manifest.sourceRevision !== expectedRevision)
		throw new Error(
			`Release candidate source revision mismatch: ${manifest.sourceRevision} != ${expectedRevision}.`
		);
	const actualNames = manifest.artifacts.map((artifact) => artifact.name).sort();
	const expectedNames = [...releasePackageNames].sort();
	if (actualNames.join('\n') !== expectedNames.join('\n'))
		throw new Error(
			`Release candidate package set mismatch: expected ${expectedNames.join(', ')}, got ${actualNames.join(', ')}.`
		);
	for (const artifact of manifest.artifacts) {
		const version = workspaceVersions.get(artifact.name);
		if (!version || !versionPattern.test(version))
			throw new Error(`Release candidate package is missing from workspace: ${artifact.name}.`);
		if (artifact.version !== version)
			throw new Error(
				`Release candidate version mismatch for ${artifact.name}: ${artifact.version} != ${version}.`
			);
	}
	if (tag !== undefined) {
		const match = tag.match(
			/^(@zadmin\/[a-z0-9][a-z0-9._-]*)@(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)$/u
		);
		if (!match || !releasePackageNames.includes(match[1]))
			throw new Error(`Release candidate tag is not a known package version tag: ${tag}.`);
		const artifact = manifest.artifacts.find((item) => item.name === match[1]);
		if (artifact.version !== match[2])
			throw new Error(
				`Release candidate tag/version mismatch: ${tag} != ${artifact.name}@${artifact.version}.`
			);
	}
	return {
		status: 'passed',
		sourceRevision: manifest.sourceRevision,
		packages: actualNames,
		tag: tag ?? null
	};
}

export async function checkReleaseCandidate({
	directory,
	expectedRevision,
	tag,
	workspaceRoot = root
}) {
	const manifest = JSON.parse(await readFile(resolve(directory, 'manifest.json'), 'utf8'));
	return validateReleaseCandidate({
		manifest,
		workspaceVersions: await workspacePackages(workspaceRoot),
		expectedRevision,
		tag
	});
}

if (isMain && process.argv.includes('--self-test')) {
	const revision = 'a'.repeat(40);
	const workspaceVersions = new Map([
		['@zadmin/core', '0.0.0'],
		['@zadmin/zui', '0.1.0'],
		['@zadmin/sveltekit', '0.0.0'],
		['@zadmin/webview', '0.1.0'],
		['@zadmin/miniapp', '0.1.0']
	]);
	const manifest = {
		schemaVersion: 2,
		producer: 'scripts/pack-release-artifacts.mjs',
		sourceRevision: revision,
		status: 'passed',
		artifacts: releasePackageNames.map((name) => ({
			name,
			filename: `${name.slice('@zadmin/'.length)}.tgz`,
			version: workspaceVersions.get(name),
			bytes: 1,
			sha256: 'a'.repeat(64)
		}))
	};
	let cases = 0;
	function expectFailure(callback, label) {
		try {
			callback();
			throw new Error(`Release candidate self-test accepted ${label}.`);
		} catch (error) {
			if (String(error).includes('self-test')) throw error;
			cases += 1;
		}
	}
	validateReleaseCandidate({
		manifest,
		workspaceVersions,
		expectedRevision: revision,
		tag: '@zadmin/zui@0.1.0'
	});
	cases += 1;
	expectFailure(
		() =>
			validateReleaseCandidate({ manifest, workspaceVersions, expectedRevision: 'b'.repeat(40) }),
		'a revision mismatch'
	);
	expectFailure(
		() =>
			validateReleaseCandidate({
				manifest: { ...manifest, artifacts: manifest.artifacts.slice(1) },
				workspaceVersions,
				expectedRevision: revision
			}),
		'a missing package'
	);
	expectFailure(
		() =>
			validateReleaseCandidate({
				manifest: {
					...manifest,
					artifacts: manifest.artifacts.map((item) =>
						item.name === '@zadmin/zui' ? { ...item, version: '0.2.0' } : item
					)
				},
				workspaceVersions,
				expectedRevision: revision
			}),
		'a package version mismatch'
	);
	expectFailure(
		() =>
			validateReleaseCandidate({
				manifest,
				workspaceVersions,
				expectedRevision: revision,
				tag: '@zadmin/zui@0.2.0'
			}),
		'a tag version mismatch'
	);
	expectFailure(
		() =>
			validateReleaseCandidate({
				manifest,
				workspaceVersions,
				expectedRevision: revision,
				tag: '@zadmin/unknown@0.1.0'
			}),
		'an unknown package tag'
	);
	console.log(JSON.stringify({ cases, status: 'passed' }));
}

if (isMain) {
	const directory = process.argv.find((arg) => arg.startsWith('--directory='))?.slice(12);
	const revision = process.argv.find((arg) => arg.startsWith('--revision='))?.slice(11);
	const tag = process.argv.find((arg) => arg.startsWith('--tag='))?.slice(6);
	if (directory || revision || tag) {
		if (!directory || !revision) throw new Error('--directory and --revision are required.');
		console.log(
			JSON.stringify(await checkReleaseCandidate({ directory, expectedRevision: revision, tag }))
		);
	}
}
