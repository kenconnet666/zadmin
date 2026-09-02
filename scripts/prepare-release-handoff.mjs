import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { checkReleaseCandidate } from './check-release-candidate.mjs';
import { readReleaseArtifact, validateArtifactManifest } from './read-release-artifact.mjs';
import { releasePackageNames } from './release-package-set.mjs';

const executeFile = promisify(execFile);
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const isMain = process.argv[1]
	? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
	: false;
const revisionPattern = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;

function argument(name, argv = process.argv.slice(2)) {
	return argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
}

function requiredRevision(value) {
	if (!revisionPattern.test(value ?? ''))
		throw new Error(`Release handoff revision is invalid: ${value ?? '<missing>'}.`);
	return value;
}

function assertWithin(base, target, label) {
	const relation = relative(base, target);
	if (relation === '..' || relation.startsWith(`..${sep}`) || isAbsolute(relation))
		throw new Error(`${label} must stay within ${base}: ${target}`);
	return target;
}

function requiredZuiTag(value, version) {
	if (value === undefined) return null;
	const expected = `@zadmin/zui@${version}`;
	if (value !== expected) throw new Error(`Release handoff tag must be ${expected}: ${value}.`);
	return value;
}

function buildReleaseHandoffPlan({ manifest, sourceRevision, tag = null }) {
	validateArtifactManifest(manifest);
	const artifacts = Object.fromEntries(
		manifest.artifacts
			.map((artifact) => [
				artifact.name,
				{
					bytes: artifact.bytes,
					filename: artifact.filename,
					sha256: artifact.sha256,
					version: artifact.version
				}
			])
			.sort(([left], [right]) => left.localeCompare(right))
	);
	const zui = artifacts['@zadmin/zui'];
	if (!zui) throw new Error('Release handoff is missing @zadmin/zui.');
	const releaseTag = requiredZuiTag(tag ?? undefined, zui.version);
	const plan = {
		schemaVersion: 1,
		status: 'validated-plan',
		producer: 'scripts/prepare-release-handoff.mjs',
		sourceRevision: requiredRevision(sourceRevision),
		releaseTag,
		tagBound: releaseTag !== null,
		validation: {
			artifactIntegrity: 'passed',
			candidate: 'passed'
		},
		artifacts,
		plannedConsumers: {
			npmPublish: {
				package: '@zadmin/zui',
				requires: ['npm-oidc', 'provenance'],
				sha256: zui.sha256,
				status: 'not-executed',
				tarball: zui.filename
			},
			registrySmoke: {
				package: '@zadmin/zui',
				status: 'blocked-until-publish',
				version: zui.version
			},
			githubRelease:
				releaseTag === null ? null : { sourceRevision, status: 'not-executed', tag: releaseTag },
			versionedDocs: {
				artifactName: 'workspace-build-artifacts',
				manifest: 'zui-artifact/version-manifest.json',
				package: '@zadmin/zui',
				status: 'requires-separate-artifact-validation',
				supportMatrix: 'zui-artifact/support-matrix.json',
				version: zui.version
			}
		},
		executedConsumers: [],
		policy: {
			noExternalSideEffects: true,
			noRepack: true,
			publishRequiresOidc: true,
			registrySmokeAfterPublish: true
		}
	};
	validateReleaseHandoffPlan(plan, manifest);
	return plan;
}

export function validateReleaseHandoffPlan(plan, manifest) {
	validateArtifactManifest(manifest);
	if (plan?.schemaVersion !== 1 || plan.status !== 'validated-plan')
		throw new Error('Release handoff plan schema/status is invalid.');
	if (plan.producer !== 'scripts/prepare-release-handoff.mjs')
		throw new Error(`Release handoff producer is invalid: ${plan.producer}.`);
	if (plan.sourceRevision !== manifest.sourceRevision)
		throw new Error('Release handoff plan revision does not match its manifest.');
	if (!Array.isArray(plan.executedConsumers) || plan.executedConsumers.length !== 0)
		throw new Error('A validated handoff plan cannot claim executed consumers.');
	const actualNames = Object.keys(plan.artifacts).sort();
	const expectedNames = [...releasePackageNames].sort();
	if (actualNames.join('\n') !== expectedNames.join('\n'))
		throw new Error('Release handoff plan package set is invalid.');
	for (const artifact of manifest.artifacts) {
		const planned = plan.artifacts[artifact.name];
		for (const field of ['bytes', 'filename', 'sha256', 'version'])
			if (planned?.[field] !== artifact[field])
				throw new Error(`Release handoff ${artifact.name} ${field} does not match its manifest.`);
	}
	const zui = plan.artifacts['@zadmin/zui'];
	if (
		plan.plannedConsumers?.npmPublish?.tarball !== zui.filename ||
		plan.plannedConsumers?.npmPublish?.sha256 !== zui.sha256
	)
		throw new Error('Release handoff npm publish input is not the validated ZUI tarball.');
	if (
		plan.plannedConsumers?.versionedDocs?.manifest !== 'zui-artifact/version-manifest.json' ||
		plan.plannedConsumers?.versionedDocs?.supportMatrix !== 'zui-artifact/support-matrix.json'
	)
		throw new Error('Release handoff versioned Docs inputs are invalid.');
	const expectedTag = `@zadmin/zui@${zui.version}`;
	if (plan.releaseTag !== null && plan.releaseTag !== expectedTag)
		throw new Error(`Release handoff plan tag must be ${expectedTag}.`);
	if (plan.tagBound !== (plan.releaseTag !== null))
		throw new Error('Release handoff tagBound does not match its tag state.');
	return plan;
}

export async function prepareReleaseHandoff({
	directory,
	expectedRevision,
	tag,
	workspaceRoot = root
}) {
	const sourceRevision = requiredRevision(expectedRevision);
	const artifactDirectory = assertWithin(
		workspaceRoot,
		resolve(directory),
		'Release artifact directory'
	);
	await checkReleaseCandidate({
		directory: artifactDirectory,
		expectedRevision: sourceRevision,
		tag,
		workspaceRoot
	});
	const manifest = JSON.parse(await readFile(resolve(artifactDirectory, 'manifest.json'), 'utf8'));
	for (const name of releasePackageNames)
		await readReleaseArtifact(artifactDirectory, name, sourceRevision);
	return buildReleaseHandoffPlan({ manifest, sourceRevision, tag: tag ?? null });
}

export async function verifyReleaseHandoff({
	directory,
	expectedRevision,
	planPath,
	workspaceRoot = root
}) {
	const sourceRevision = requiredRevision(expectedRevision);
	const artifactDirectory = assertWithin(
		workspaceRoot,
		resolve(directory),
		'Release artifact directory'
	);
	const safePlanPath = assertWithin(artifactDirectory, resolve(planPath), 'Release handoff input');
	const manifest = JSON.parse(await readFile(resolve(artifactDirectory, 'manifest.json'), 'utf8'));
	const plan = JSON.parse(await readFile(safePlanPath, 'utf8'));
	await checkReleaseCandidate({
		directory: artifactDirectory,
		expectedRevision: sourceRevision,
		tag: plan.releaseTag ?? undefined,
		workspaceRoot
	});
	for (const name of releasePackageNames)
		await readReleaseArtifact(artifactDirectory, name, sourceRevision);
	validateReleaseHandoffPlan(plan, manifest);
	return {
		artifacts: [...releasePackageNames],
		executedConsumers: plan.executedConsumers,
		sourceRevision,
		status: 'verified-handoff-plan'
	};
}

async function currentRevision(workspaceRoot = root) {
	const { stdout } = await executeFile('git', ['rev-parse', 'HEAD'], {
		cwd: workspaceRoot,
		encoding: 'utf8'
	});
	return requiredRevision(stdout.trim());
}

function selfTest() {
	const revision = 'a'.repeat(40);
	const versions = new Map([
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
		artifacts: releasePackageNames.map((name, index) => ({
			name,
			filename: `${name.slice('@zadmin/'.length)}.tgz`,
			version: versions.get(name),
			bytes: index + 1,
			sha256: String(index + 1).repeat(64)
		}))
	};
	let cases = 0;
	const plan = buildReleaseHandoffPlan({
		manifest,
		sourceRevision: revision,
		tag: '@zadmin/zui@0.1.0'
	});
	if (plan.executedConsumers.length !== 0 || plan.plannedConsumers.npmPublish.tarball !== 'zui.tgz')
		throw new Error('Release handoff self-test produced an invalid plan.');
	cases += 1;
	const expectFailure = (label, expectedPattern, callback) => {
		try {
			callback();
		} catch (error) {
			if (expectedPattern.test(String(error))) {
				cases += 1;
				return;
			}
			throw new Error(`Release handoff self-test received an unexpected error for ${label}.`, {
				cause: error
			});
		}
		throw new Error(`Release handoff self-test accepted ${label}.`);
	};
	for (const [label, expectedPattern, mutate] of [
		[
			'an executed consumer claim',
			/cannot claim executed consumers/u,
			(value) => value.executedConsumers.push('npmPublish')
		],
		[
			'a repacked tarball path',
			/npm publish input is not the validated ZUI tarball/u,
			(value) => (value.plannedConsumers.npmPublish.tarball = 'other.tgz')
		],
		[
			'a mismatched revision',
			/plan revision does not match its manifest/u,
			(value) => (value.sourceRevision = 'b'.repeat(40))
		],
		[
			'an invalid versioned Docs manifest',
			/versioned Docs inputs are invalid/u,
			(value) => (value.plannedConsumers.versionedDocs.manifest = 'zui-artifact/wrong.json')
		]
	]) {
		const invalid = structuredClone(plan);
		mutate(invalid);
		expectFailure(label, expectedPattern, () => validateReleaseHandoffPlan(invalid, manifest));
	}
	expectFailure('a mismatched package tag', /tag must be @zadmin\/zui@0\.1\.0/u, () =>
		buildReleaseHandoffPlan({
			manifest,
			sourceRevision: revision,
			tag: '@zadmin/zui@0.2.0'
		})
	);
	expectFailure('an escaped path', /must stay within/u, () =>
		assertWithin(resolve('C:/workspace'), resolve('C:/outside'), 'Self-test output')
	);
	console.log(JSON.stringify({ cases, status: 'passed' }));
}

async function main(argv = process.argv.slice(2)) {
	if (argv.includes('--help')) {
		console.log(
			'Usage: node scripts/prepare-release-handoff.mjs [--directory=.release-artifacts] [--revision=<sha>] [--tag=@zadmin/zui@<version>] [--out=.release-artifacts/release-handoff.json] [--verify-plan=.release-artifacts/release-handoff.json] [--force]'
		);
		return;
	}
	if (argv.includes('--self-test')) {
		selfTest();
		return;
	}
	const directory = assertWithin(
		root,
		resolve(root, argument('directory', argv) ?? '.release-artifacts'),
		'Release artifact directory'
	);
	const revision = argument('revision', argv) ?? (await currentRevision());
	const planInput = argument('verify-plan', argv);
	if (planInput) {
		const planPath = assertWithin(directory, resolve(root, planInput), 'Release handoff input');
		console.log(
			JSON.stringify(
				await verifyReleaseHandoff({ directory, expectedRevision: revision, planPath })
			)
		);
		return;
	}
	const tag = argument('tag', argv);
	const plan = await prepareReleaseHandoff({ directory, expectedRevision: revision, tag });
	const output = argument('out', argv);
	if (output) {
		const outputPath = assertWithin(directory, resolve(root, output), 'Release handoff output');
		await mkdir(dirname(outputPath), { recursive: true });
		await writeFile(outputPath, `${JSON.stringify(plan, null, '\t')}\n`, {
			encoding: 'utf8',
			flag: argv.includes('--force') ? 'w' : 'wx'
		});
	}
	console.log(JSON.stringify(plan, null, '\t'));
}

if (isMain) await main();
