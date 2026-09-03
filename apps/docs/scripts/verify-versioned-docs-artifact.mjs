import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { mkdtempSync as makeTempDirectory } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../../..', import.meta.url));
const isMain = process.argv[1]
	? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
	: false;
const shaPattern = /^[a-f0-9]{64}$/u;
const revisionPattern = /^[a-f0-9]{40}$/u;
const versionPattern = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u;

function portable(value) {
	return value.replaceAll('\\', '/');
}

function digest(bytes) {
	return createHash('sha256').update(bytes).digest('hex');
}

function bundleDigest(files) {
	return digest(files.map(({ path, bytes, sha256 }) => `${path}\0${bytes}\0${sha256}`).join('\n'));
}

function assertInside(base, target, label) {
	const relation = relative(base, target);
	if (
		isAbsolute(relation) ||
		relation === '..' ||
		relation.startsWith('..\\') ||
		relation.startsWith('../')
	)
		throw new Error(`${label} escapes its directory: ${target}.`);
}

function safeBuildPath(value) {
	return (
		typeof value === 'string' &&
		value.length > 0 &&
		!isAbsolute(value) &&
		!value.includes('\\') &&
		!value.includes(':') &&
		!value.includes('\0') &&
		!value.startsWith('/') &&
		value.split('/').every((segment) => segment.length > 0 && segment !== '.' && segment !== '..')
	);
}

function validateManifest(manifest, expectedRouteManifest) {
	if (
		manifest?.schemaVersion !== 1 ||
		manifest.package?.name !== '@zadmin/zui' ||
		typeof manifest.package.version !== 'string' ||
		!versionPattern.test(manifest.package.version) ||
		!revisionPattern.test(manifest.revision ?? '') ||
		!Number.isInteger(manifest.routeManifest?.componentCount) ||
		manifest.routeManifest.componentCount < 1 ||
		!Number.isInteger(manifest.routeManifest?.guideCount) ||
		manifest.routeManifest.guideCount < 1 ||
		!Number.isInteger(manifest.routeManifest?.totalCount) ||
		manifest.routeManifest.totalCount !==
			manifest.routeManifest.componentCount + manifest.routeManifest.guideCount + 1 ||
		!Number.isInteger(manifest.build?.fileCount) ||
		manifest.build.fileCount < 1 ||
		!shaPattern.test(manifest.build.bundleSha256 ?? '') ||
		!Array.isArray(manifest.build.files) ||
		manifest.build.files.length !== manifest.build.fileCount ||
		manifest.supportMatrix?.artifactPath !== 'zui-artifact/support-matrix.json' ||
		manifest.supportMatrix?.sourcePath !== '.docs/zui/support-matrix.json' ||
		!shaPattern.test(manifest.supportMatrix.sha256 ?? '') ||
		!Array.isArray(manifest.supportMatrix.browsers) ||
		manifest.supportMatrix.browsers.length === 0 ||
		new Set(manifest.supportMatrix.browsers).size !== manifest.supportMatrix.browsers.length ||
		manifest.supportMatrix.browsers.some(
			(browser) => typeof browser !== 'string' || browser.length === 0
		) ||
		manifest.deployment?.deployed !== false ||
		manifest.deployment?.provider !== null
	)
		throw new Error('Versioned Docs artifact manifest schema is invalid.');
	if (
		expectedRouteManifest &&
		(['componentCount', 'guideCount', 'totalCount'].some(
			(key) => manifest.routeManifest[key] !== expectedRouteManifest[key]
		) ||
			expectedRouteManifest.totalCount !==
				expectedRouteManifest.componentCount + expectedRouteManifest.guideCount + 1)
	)
		throw new Error('Versioned Docs route manifest does not match the tracked contract.');
	const paths = new Set();
	for (const file of manifest.build.files) {
		if (
			!safeBuildPath(file.path) ||
			file.path.split('/').some((segment) => segment.startsWith('.')) ||
			file.path.startsWith('zui-artifact/') ||
			paths.has(file.path) ||
			!Number.isSafeInteger(file.bytes) ||
			file.bytes < 1 ||
			!shaPattern.test(file.sha256 ?? '')
		)
			throw new Error(`Versioned Docs build file entry is invalid: ${file.path}.`);
		paths.add(file.path);
	}
	const orderedPaths = manifest.build.files.map(({ path }) => path);
	if (orderedPaths.join('\n') !== [...orderedPaths].sort().join('\n'))
		throw new Error('Versioned Docs build file entries must use canonical path order.');
}

async function filesUnder(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = resolve(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await filesUnder(path)));
		else if (entry.isFile()) files.push(path);
	}
	return files;
}

export async function verifyVersionedDocsArtifact({
	dist,
	revision,
	packageVersion,
	expectedRouteManifest
}) {
	const distRoot = resolve(dist);
	const manifestPath = resolve(distRoot, 'zui-artifact/version-manifest.json');
	const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
	validateManifest(manifest, expectedRouteManifest);
	if (revision !== undefined && manifest.revision !== revision)
		throw new Error(`Versioned Docs revision mismatch: ${manifest.revision} != ${revision}.`);
	if (packageVersion !== undefined && manifest.package.version !== packageVersion)
		throw new Error(
			`Versioned Docs package version mismatch: ${manifest.package.version} != ${packageVersion}.`
		);
	const supportPath = resolve(distRoot, manifest.supportMatrix.artifactPath);
	assertInside(distRoot, supportPath, 'Support matrix');
	const supportBytes = await readFile(supportPath);
	if (digest(supportBytes) !== manifest.supportMatrix.sha256)
		throw new Error('Versioned Docs support matrix checksum mismatch.');
	const artifactFiles = (await filesUnder(resolve(distRoot, 'zui-artifact')))
		.map((path) => portable(relative(resolve(distRoot, 'zui-artifact'), path)))
		.sort();
	if (artifactFiles.join('\n') !== ['support-matrix.json', 'version-manifest.json'].join('\n'))
		throw new Error('Versioned Docs metadata artifact set is invalid.');
	const actualFiles = (await filesUnder(distRoot))
		.filter((path) => !portable(relative(distRoot, path)).startsWith('zui-artifact/'))
		.map((path) => portable(relative(distRoot, path)))
		.sort();
	const expectedFiles = manifest.build.files.map(({ path }) => path).sort();
	if (actualFiles.join('\n') !== expectedFiles.join('\n'))
		throw new Error('Versioned Docs build file set does not match its manifest.');
	const facts = [];
	for (const file of manifest.build.files) {
		const path = resolve(distRoot, file.path);
		assertInside(distRoot, path, `Versioned Docs file ${file.path}`);
		const bytes = await readFile(path);
		if (bytes.byteLength !== file.bytes)
			throw new Error(`Versioned Docs byte count mismatch: ${file.path}.`);
		if (digest(bytes) !== file.sha256)
			throw new Error(`Versioned Docs checksum mismatch: ${file.path}.`);
		facts.push(file);
	}
	if (bundleDigest(facts) !== manifest.build.bundleSha256)
		throw new Error('Versioned Docs bundle checksum mismatch.');
	return {
		bundleSha256: manifest.build.bundleSha256,
		fileCount: manifest.build.fileCount,
		package: manifest.package,
		revision: manifest.revision,
		supportMatrixSha256: manifest.supportMatrix.sha256
	};
}

async function selfTest() {
	const directory = makeTempDirectory(resolve(tmpdir(), 'zadmin-versioned-docs-self-test-'));
	const dist = resolve(directory, 'dist');
	const support = Buffer.from('{"browsers":["chromium"]}\n');
	const index = Buffer.from('<main>docs</main>');
	const script = Buffer.from('console.log("docs");');
	const files = [
		{ path: 'assets/app.js', bytes: script.byteLength, sha256: digest(script) },
		{ path: 'index.html', bytes: index.byteLength, sha256: digest(index) }
	];
	const manifest = {
		schemaVersion: 1,
		package: { name: '@zadmin/zui', version: '0.1.0' },
		revision: 'a'.repeat(40),
		routeManifest: { componentCount: 79, guideCount: 8, totalCount: 88 },
		build: { bundleSha256: bundleDigest(files), fileCount: files.length, files },
		supportMatrix: {
			sourcePath: '.docs/zui/support-matrix.json',
			artifactPath: 'zui-artifact/support-matrix.json',
			sha256: digest(support),
			browsers: ['chromium']
		},
		deployment: { deployed: false, provider: null }
	};
	const writeJson = (path, value) => writeFile(path, JSON.stringify(value), 'utf8');
	try {
		await mkdir(resolve(dist, 'assets'), { recursive: true });
		await mkdir(resolve(dist, 'zui-artifact'), { recursive: true });
		await writeJson(resolve(dist, 'zui-artifact/version-manifest.json'), manifest);
		await writeFile(resolve(dist, 'index.html'), index);
		await writeFile(resolve(dist, 'assets/app.js'), script);
		await writeFile(resolve(dist, 'zui-artifact/support-matrix.json'), support);
		await verifyVersionedDocsArtifact({
			dist,
			revision: manifest.revision,
			packageVersion: '0.1.0',
			expectedRouteManifest: manifest.routeManifest
		});
		let cases = 1;
		for (const [label, expectedPattern, mutate] of [
			['a revision mismatch', /revision mismatch/u, (value) => (value.revision = 'b'.repeat(40))],
			[
				'a checksum mismatch',
				/checksum mismatch/u,
				(value) => (value.build.files[0].sha256 = 'b'.repeat(64))
			],
			['an extra build file', /file set does not match/u, (value) => value],
			[
				'an unsafe build path',
				/build file entry is invalid/u,
				(value) => (value.build.files[0].path = '../escape.html')
			]
		]) {
			const changed = structuredClone(manifest);
			mutate(changed);
			await writeJson(resolve(dist, 'zui-artifact/version-manifest.json'), changed);
			if (label === 'an extra build file') await writeFile(resolve(dist, 'extra.js'), 'extra');
			try {
				await verifyVersionedDocsArtifact({
					dist,
					revision: manifest.revision,
					packageVersion: '0.1.0',
					expectedRouteManifest: manifest.routeManifest
				});
				throw new Error(`Versioned Docs self-test accepted ${label}.`);
			} catch (error) {
				if (!expectedPattern.test(String(error)))
					throw new Error(`Versioned Docs self-test received an unexpected ${label} error.`, {
						cause: error
					});
				cases += 1;
			}
			if (label === 'an extra build file') await rm(resolve(dist, 'extra.js'), { force: true });
		}
		await writeJson(resolve(dist, 'zui-artifact/version-manifest.json'), manifest);
		await writeFile(resolve(dist, 'zui-artifact/extra.json'), '{}');
		try {
			await verifyVersionedDocsArtifact({
				dist,
				revision: manifest.revision,
				packageVersion: '0.1.0',
				expectedRouteManifest: manifest.routeManifest
			});
			throw new Error('Versioned Docs self-test accepted an extra metadata artifact.');
		} catch (error) {
			if (!String(error).includes('metadata artifact set')) throw error;
			cases += 1;
		}
		console.log(JSON.stringify({ cases, status: 'passed' }));
	} finally {
		await rm(directory, { force: true, recursive: true });
	}
}

async function main(argv = process.argv.slice(2)) {
	if (argv.includes('--help')) {
		console.log(
			'Usage: node apps/docs/scripts/verify-versioned-docs-artifact.mjs --dist=<downloaded-dist> --revision=<full-sha> [--package-version=<semver>]'
		);
		return;
	}
	if (argv.includes('--self-test')) return selfTest();
	const dist = argv.find((arg) => arg.startsWith('--dist='))?.slice('--dist='.length);
	const revision = argv.find((arg) => arg.startsWith('--revision='))?.slice('--revision='.length);
	const packageVersion = argv
		.find((arg) => arg.startsWith('--package-version='))
		?.slice('--package-version='.length);
	if (!dist || !revision) throw new Error('Both --dist and --revision are required.');
	const contract = JSON.parse(
		await readFile(resolve(workspaceRoot, '.docs/zui/versioned-docs.json'), 'utf8')
	);
	console.log(
		JSON.stringify(
			await verifyVersionedDocsArtifact({
				dist,
				revision,
				packageVersion: packageVersion ?? contract.package?.version,
				expectedRouteManifest: contract.routeManifest
			})
		)
	);
}

if (isMain) await main();
