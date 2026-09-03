import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const artifactProducer = 'scripts/pack-release-artifacts.mjs';
const sourceRevisionPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const isMain = process.argv[1]
	? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
	: false;

export function validateArtifactManifest(manifest) {
	if (
		manifest?.schemaVersion !== 2 ||
		manifest.producer !== artifactProducer ||
		manifest.status !== 'passed' ||
		!Array.isArray(manifest.artifacts) ||
		manifest.artifacts.length === 0
	)
		throw new Error('Invalid release artifact manifest schema or status.');
	if (!sourceRevisionPattern.test(manifest.sourceRevision ?? ''))
		throw new Error('Release artifact manifest sourceRevision is invalid.');
	const names = new Set();
	for (const artifact of manifest.artifacts) {
		if (
			typeof artifact.name !== 'string' ||
			!/^@zadmin\/[a-z0-9][a-z0-9._-]*$/u.test(artifact.name) ||
			names.has(artifact.name)
		)
			throw new Error(
				`Release artifact manifest has duplicate or invalid package: ${artifact.name}.`
			);
		if (
			typeof artifact.filename !== 'string' ||
			!/^[A-Za-z0-9][A-Za-z0-9._-]*\.tgz$/u.test(artifact.filename) ||
			isAbsolute(artifact.filename) ||
			artifact.filename.includes(':') ||
			artifact.filename.includes('..') ||
			artifact.filename.includes('/') ||
			artifact.filename.includes('\\')
		)
			throw new Error(`Release artifact filename is unsafe: ${artifact.filename}.`);
		if (
			!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(artifact.version) ||
			!Number.isSafeInteger(artifact.bytes) ||
			artifact.bytes < 1
		)
			throw new Error(`Release artifact metadata is invalid for ${artifact.name}.`);
		if (!/^[a-f0-9]{64}$/u.test(artifact.sha256))
			throw new Error(`Release artifact SHA-256 is invalid for ${artifact.name}.`);
		names.add(artifact.name);
	}
}

export function readReleaseArtifact(directory, packageName, expectedRevision) {
	const manifest = JSON.parse(readFileSync(resolve(directory, 'manifest.json'), 'utf8'));
	validateArtifactManifest(manifest);
	if (expectedRevision !== undefined) {
		if (!sourceRevisionPattern.test(expectedRevision))
			throw new Error(`Requested release artifact revision is invalid: ${expectedRevision}.`);
		if (manifest.sourceRevision !== expectedRevision)
			throw new Error(
				`Release artifact source revision mismatch: ${manifest.sourceRevision} != ${expectedRevision}.`
			);
	}
	const artifact = manifest.artifacts?.find((entry) => entry.name === packageName);
	if (!artifact) throw new Error(`Release artifact manifest has no ${packageName}.`);
	const path = resolve(directory, artifact.filename);
	const relativePath = relative(resolve(directory), path);
	if (isAbsolute(relativePath) || relativePath.startsWith('..'))
		throw new Error(`Release artifact path escapes its directory: ${artifact.filename}.`);
	if (!existsSync(path))
		throw new Error(`Release artifact file is missing for ${packageName}: ${path}.`);
	const bytes = readFileSync(path);
	if (bytes.byteLength !== artifact.bytes)
		throw new Error(
			`Release artifact byte count mismatch for ${packageName}: ${bytes.byteLength} != ${artifact.bytes}.`
		);
	const sha256 = createHash('sha256').update(bytes).digest('hex');
	if (sha256 !== artifact.sha256) {
		throw new Error(
			`Release artifact checksum mismatch for ${packageName}: ${sha256} != ${artifact.sha256}.`
		);
	}
	return pathToFileURL(path).href;
}

if (isMain && process.argv.includes('--self-test')) {
	const directory = mkdtempSync(resolve(tmpdir(), 'zadmin-release-artifact-self-test-'));
	const valid = {
		schemaVersion: 2,
		producer: artifactProducer,
		sourceRevision: 'a'.repeat(40),
		status: 'passed',
		artifacts: [
			{
				name: '@zadmin/zui',
				filename: 'zui.tgz',
				version: '0.1.0',
				bytes: 1,
				sha256: 'a'.repeat(64)
			}
		]
	};
	const bytes = Buffer.from('artifact');
	const artifact = {
		...valid.artifacts[0],
		bytes: bytes.byteLength,
		sha256: createHash('sha256').update(bytes).digest('hex')
	};
	let cases = 0;
	function expectFailure(callback, label) {
		try {
			callback();
			throw new Error(`Release artifact self-test accepted ${label}.`);
		} catch (error) {
			if (String(error).includes('self-test')) throw error;
			cases += 1;
		}
	}
	try {
		writeFileSync(
			resolve(directory, 'manifest.json'),
			JSON.stringify({ ...valid, artifacts: [artifact] })
		);
		writeFileSync(resolve(directory, 'zui.tgz'), bytes);
		readReleaseArtifact(directory, '@zadmin/zui');
		cases += 1;
		readReleaseArtifact(directory, '@zadmin/zui', valid.sourceRevision);
		cases += 1;
		for (const invalid of [
			{ ...artifact, filename: '../escape.tgz' },
			{ ...artifact, filename: 'zui package.tgz' },
			{ ...artifact, filename: 'zui.tgz\nmalicious' },
			{ ...artifact, bytes: artifact.bytes + 1 },
			{ ...artifact, sha256: 'b'.repeat(64) }
		]) {
			writeFileSync(
				resolve(directory, 'manifest.json'),
				JSON.stringify({ ...valid, artifacts: [invalid] })
			);
			expectFailure(() => readReleaseArtifact(directory, '@zadmin/zui'), 'an invalid artifact');
		}
		writeFileSync(
			resolve(directory, 'manifest.json'),
			JSON.stringify({ ...valid, sourceRevision: 'invalid', artifacts: [artifact] })
		);
		expectFailure(() => readReleaseArtifact(directory, '@zadmin/zui'), 'an invalid revision');
		writeFileSync(
			resolve(directory, 'manifest.json'),
			JSON.stringify({ ...valid, artifacts: [artifact] })
		);
		expectFailure(
			() => readReleaseArtifact(directory, '@zadmin/zui', 'b'.repeat(40)),
			'a mismatched revision'
		);
	} finally {
		rmSync(directory, { force: true, recursive: true });
	}
	console.log(JSON.stringify({ cases, status: 'passed' }));
}

if (isMain) {
	const directoryArgument = process.argv.find((argument) => argument.startsWith('--directory='));
	const packageArgument = process.argv.find((argument) => argument.startsWith('--package='));
	const revisionArgument = process.argv.find((argument) => argument.startsWith('--revision='));
	if (Boolean(directoryArgument) !== Boolean(packageArgument))
		throw new Error('Both --directory and --package are required when selecting an artifact.');
	if (revisionArgument && !directoryArgument)
		throw new Error('--revision requires --directory and --package.');
	if (directoryArgument && packageArgument) {
		console.log(
			readReleaseArtifact(
				directoryArgument.slice('--directory='.length),
				packageArgument.slice('--package='.length),
				revisionArgument?.slice('--revision='.length)
			)
		);
	}
}
