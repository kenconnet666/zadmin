import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const isMain = process.argv[1]
	? pathToFileURL(resolve(process.argv[1])).href === import.meta.url
	: false;

function argument(name, argv = process.argv.slice(2)) {
	return argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
}

export function classifyNpmRegistryStatus(status) {
	if (status === 404) return 'absent';
	if (status === 200) return 'present';
	throw new Error(`npm registry probe returned unexpected HTTP status ${status}.`);
}

export function sha512Integrity(bytes) {
	return `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
}

export function validateNpmVersionMetadata(metadata, packageName, version) {
	const published = metadata?.version === version ? metadata : metadata?.versions?.[version];
	const integrity = published?.dist?.integrity;
	if (
		published?.name !== packageName ||
		published?.version !== version ||
		typeof integrity !== 'string' ||
		!/^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(integrity)
	)
		throw new Error('npm registry probe returned incomplete exact-version metadata.');
	return { integrity };
}

export function compareNpmVersionArtifact(metadata, packageName, version, bytes) {
	const { integrity } = validateNpmVersionMetadata(metadata, packageName, version);
	const localIntegrity = sha512Integrity(bytes);
	return { integrity, localIntegrity, match: localIntegrity === integrity };
}

function selfTest() {
	const packageName = '@zadmin/zui';
	const version = '0.1.0';
	const bytes = Buffer.from('zui artifact');
	const integrity = sha512Integrity(bytes);
	const exact = { name: packageName, version, dist: { integrity } };
	let cases = 0;
	if (classifyNpmRegistryStatus(404) !== 'absent')
		throw new Error('npm registry probe self-test misclassified 404.');
	cases += 1;
	if (classifyNpmRegistryStatus(200) !== 'present')
		throw new Error('npm registry probe self-test misclassified 200.');
	cases += 1;
	const comparison = compareNpmVersionArtifact(exact, packageName, version, bytes);
	if (!comparison.match || comparison.integrity !== integrity)
		throw new Error('npm registry probe self-test rejected exact metadata.');
	cases += 1;
	if (
		!compareNpmVersionArtifact({ versions: { [version]: exact } }, packageName, version, bytes)
			.match
	)
		throw new Error('npm registry probe self-test rejected version-map metadata.');
	cases += 1;
	const expectFailure = (callback, label) => {
		try {
			callback();
			throw new Error(`npm registry probe self-test accepted ${label}.`);
		} catch (error) {
			if (String(error).includes('self-test')) throw error;
			cases += 1;
		}
	};
	expectFailure(() => classifyNpmRegistryStatus(500), 'HTTP 500');
	expectFailure(
		() => validateNpmVersionMetadata({ ...exact, name: '@zadmin/other' }, packageName, version),
		'a different package'
	);
	expectFailure(
		() => validateNpmVersionMetadata({ ...exact, version: '0.2.0' }, packageName, version),
		'a different version'
	);
	expectFailure(
		() =>
			validateNpmVersionMetadata(
				{ ...exact, dist: { integrity: 'sha1-deadbeef' } },
				packageName,
				version
			),
		'a non-SHA-512 integrity'
	);
	if (compareNpmVersionArtifact(exact, packageName, version, Buffer.from('other')).match)
		throw new Error('npm registry probe self-test accepted different artifact bytes.');
	cases += 1;
	console.log(JSON.stringify({ cases, status: 'passed' }));
}

async function main(argv = process.argv.slice(2)) {
	if (argv.includes('--self-test')) {
		selfTest();
		return;
	}
	const packageName = argument('package', argv);
	const version = argument('version', argv);
	const tarball = argument('tarball', argv);
	if (!packageName || !version) throw new Error('Both --package and --version are required.');
	const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}/${encodeURIComponent(version)}`;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 15_000);
	let response;
	try {
		response = await fetch(url, {
			headers: { accept: 'application/json' },
			signal: controller.signal
		});
	} catch (error) {
		clearTimeout(timer);
		throw new Error(`npm registry probe failed before an HTTP response: ${error.message}`, {
			cause: error
		});
	}
	let status;
	try {
		status = classifyNpmRegistryStatus(response.status);
	} catch (error) {
		clearTimeout(timer);
		throw error;
	}
	if (status === 'absent') {
		clearTimeout(timer);
		console.log(JSON.stringify({ package: packageName, version, status }));
		return;
	}
	let metadata;
	try {
		metadata = await response.json();
	} finally {
		clearTimeout(timer);
	}
	const result = tarball
		? compareNpmVersionArtifact(metadata, packageName, version, await readFile(tarball))
		: {
				...validateNpmVersionMetadata(metadata, packageName, version),
				localIntegrity: null,
				match: true
			};
	console.log(JSON.stringify({ package: packageName, version, status, ...result }));
}

if (isMain) await main();
