import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const argument = (name) =>
	process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const repository = argument('repository') ?? process.env.GITHUB_REPOSITORY;
const tag = argument('tag');
const assets = argument('assets')?.split(',').filter(Boolean) ?? [];
const localPaths = [argument('tarball'), argument('handoff'), argument('support')];
const token = process.env.GH_TOKEN;
const headers = {
	accept: 'application/vnd.github+json',
	'x-github-api-version': '2026-03-10',
	...(token ? { authorization: `Bearer ${token}` } : {})
};
export function validateReleaseMetadata(release, expectedTag, expectedAssets) {
	if (expectedAssets.length !== 3 || new Set(expectedAssets).size !== expectedAssets.length)
		throw new Error('GitHub release expected asset names must be exact and unique.');
	if (release?.tag_name !== expectedTag || release.draft !== false || release.prerelease !== false)
		throw new Error('GitHub release metadata is not the exact stable release requested.');
	const actualAssets = Array.isArray(release.assets) ? release.assets : [];
	const expected = [...expectedAssets].sort();
	const actual = actualAssets.map((asset) => asset.name).sort();
	if (actual.join('\n') !== expected.join('\n'))
		throw new Error(
			`GitHub release assets mismatch: expected ${expected.join(', ')}, got ${actual.join(', ')}.`
		);
	return expectedAssets.map((name) => {
		const asset = actualAssets.find((entry) => entry.name === name);
		if (
			!asset ||
			asset.state !== 'uploaded' ||
			!Number.isSafeInteger(asset.size) ||
			typeof asset.digest !== 'string' ||
			!/^sha256:[a-f0-9]{64}$/u.test(asset.digest)
		)
			throw new Error(`GitHub release asset metadata is incomplete for ${name}.`);
		return { name, size: asset.size, digest: asset.digest };
	});
}
if (process.argv.includes('--self-test')) {
	const digest = `sha256:${'a'.repeat(64)}`;
	const release = {
		tag_name: '@zadmin/zui@0.1.0',
		draft: false,
		prerelease: false,
		assets: ['zui.tgz', 'release-handoff.json', 'support-matrix.json'].map((name) => ({
			name,
			state: 'uploaded',
			size: 1,
			digest
		}))
	};
	let cases = 0;
	const expectFailure = (callback, label) => {
		try {
			callback();
			throw new Error(`GitHub release probe self-test accepted ${label}.`);
		} catch (error) {
			if (String(error).includes('self-test')) throw error;
			cases += 1;
		}
	};
	validateReleaseMetadata(
		release,
		release.tag_name,
		release.assets.map((asset) => asset.name)
	);
	cases += 1;
	for (const [mutation, label] of [
		[{ tag_name: 'wrong' }, 'wrong tag'],
		[{ draft: true }, 'draft release'],
		[{ expectedAssets: ['zui.tgz', 'zui.tgz', 'support-matrix.json'] }, 'duplicate expected asset'],
		[{ assets: release.assets.map((asset) => ({ ...asset, state: 'new' })) }, 'unuploaded asset'],
		[{ assets: release.assets.slice(0, 2) }, 'missing asset'],
		[
			{ assets: release.assets.map((asset) => ({ ...asset, digest: 'sha1:' + 'a'.repeat(40) })) },
			'bad digest'
		]
	])
		expectFailure(
			() =>
				validateReleaseMetadata(
					{ ...release, ...mutation },
					release.tag_name,
					mutation.expectedAssets ?? release.assets.map((asset) => asset.name)
				),
			label
		);
	console.log(JSON.stringify({ cases, status: 'passed' }));
	process.exit(0);
}
if (
	!repository ||
	!/^[-.A-Za-z0-9_]+\/[-.A-Za-z0-9_]+$/u.test(repository) ||
	!/^@zadmin\/zui@[0-9]+\.[0-9]+\.[0-9]+$/u.test(tag ?? '') ||
	assets.length !== 3 ||
	new Set(assets).size !== assets.length ||
	localPaths.some((path) => !path)
)
	throw new Error('repository, tag and exactly three local assets are required.');
const localChecks = [];
for (const path of localPaths) {
	const name = path.split(/[\\/]/u).pop();
	if (!assets.includes(name) || localChecks.some((entry) => entry.name === name))
		throw new Error(`Local asset does not match the exact expected asset set: ${name}.`);
	const bytes = await readFile(path);
	localChecks.push({
		name,
		size: bytes.byteLength,
		digest: `sha256:${createHash('sha256').update(bytes).digest('hex')}`
	});
}
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 15_000);
let response;
try {
	response = await fetch(
		`https://api.github.com/repos/${repository}/releases/tags/${encodeURIComponent(tag)}`,
		{ headers, signal: controller.signal }
	);
} catch (error) {
	clearTimeout(timer);
	throw new Error(`GitHub release probe failed before an HTTP response: ${error.message}`, {
		cause: error
	});
}
if (response.status === 404) {
	clearTimeout(timer);
	console.log(JSON.stringify({ repository, tag, status: 'absent' }));
	process.exit(0);
}
if (response.status !== 200) {
	clearTimeout(timer);
	throw new Error(`GitHub release probe returned unexpected HTTP status ${response.status}.`);
}
let release;
try {
	release = await response.json();
} finally {
	clearTimeout(timer);
}
if (release.assets?.some((asset) => asset.state !== 'uploaded'))
	throw new Error('GitHub release contains an asset that is not uploaded.');
const checks = validateReleaseMetadata(release, tag, assets);
for (const local of localChecks) {
	const name = local.name;
	const check = checks.find((entry) => entry.name === name);
	if (!check) throw new Error(`No GitHub release asset matches local file ${name}.`);
	if (local.size !== check.size || local.digest !== check.digest)
		throw new Error(`GitHub release asset integrity mismatch for ${name}.`);
}
console.log(JSON.stringify({ repository, tag, status: 'present', assets: checks, match: true }));
