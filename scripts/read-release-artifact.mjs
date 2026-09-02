import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const artifactProducer = 'scripts/pack-release-artifacts.mjs';

export function validateArtifactManifest(manifest) {
	if (
		manifest?.schemaVersion !== 1 ||
		manifest.producer !== artifactProducer ||
		manifest.status !== 'passed' ||
		!Array.isArray(manifest.artifacts) ||
		manifest.artifacts.length === 0
	)
		throw new Error('Invalid release artifact manifest schema or status.');
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
			artifact.filename.length <= '.tgz'.length ||
			!artifact.filename.endsWith('.tgz') ||
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

export function readReleaseArtifact(directory, packageName) {
	const manifest = JSON.parse(readFileSync(resolve(directory, 'manifest.json'), 'utf8'));
	validateArtifactManifest(manifest);
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

if (process.argv.includes('--self-test')) {
	const directory = mkdtempSync(resolve(tmpdir(), 'zadmin-release-artifact-self-test-'));
	const valid = {
		schemaVersion: 1,
		producer: artifactProducer,
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
	try {
		writeFileSync(
			resolve(directory, 'manifest.json'),
			JSON.stringify({ ...valid, artifacts: [artifact] })
		);
		writeFileSync(resolve(directory, 'zui.tgz'), bytes);
		readReleaseArtifact(directory, '@zadmin/zui');
		for (const invalid of [
			{ ...artifact, filename: '../escape.tgz' },
			{ ...artifact, bytes: artifact.bytes + 1 },
			{ ...artifact, sha256: 'b'.repeat(64) }
		]) {
			writeFileSync(
				resolve(directory, 'manifest.json'),
				JSON.stringify({ ...valid, artifacts: [invalid] })
			);
			try {
				readReleaseArtifact(directory, '@zadmin/zui');
				throw new Error('Release artifact self-test accepted invalid artifact.');
			} catch (error) {
				if (String(error).includes('self-test')) throw error;
			}
		}
	} finally {
		rmSync(directory, { force: true, recursive: true });
	}
	console.log(JSON.stringify({ cases: 4, status: 'passed' }));
}

const directoryArgument = process.argv.find((argument) => argument.startsWith('--directory='));
const packageArgument = process.argv.find((argument) => argument.startsWith('--package='));
if (Boolean(directoryArgument) !== Boolean(packageArgument))
	throw new Error('Both --directory and --package are required when selecting an artifact.');
if (directoryArgument && packageArgument) {
	console.log(
		readReleaseArtifact(
			directoryArgument.slice('--directory='.length),
			packageArgument.slice('--package='.length)
		)
	);
}
