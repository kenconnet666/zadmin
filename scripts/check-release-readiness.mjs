import { access, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const reportDir = resolve(root, '.docs/zui');
const jsonPath = resolve(reportDir, 'release-readiness.json');
const mdPath = resolve(reportDir, 'release-readiness.md');
const write = process.argv.includes('--write');

async function packageFacts() {
	const roots = ['apps', 'packages', 'plugins', 'ui'];
	const facts = [];
	for (const directory of roots) {
		for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
			if (!entry.isDirectory()) continue;
			const path = resolve(root, directory, entry.name, 'package.json');
			try {
				const packageJson = JSON.parse(await readFile(path, 'utf8'));
				if (typeof packageJson.name !== 'string' || typeof packageJson.version !== 'string') {
					throw new Error(`Package metadata is missing name/version: ${path}.`);
				}
				if (packageJson.private !== true) {
					facts.push({
						name: packageJson.name,
						version: packageJson.version,
						changeset: false,
						packageCheck: Boolean(packageJson.scripts?.['package:check']),
						acceptance: Boolean(
							packageJson.scripts?.['test:package'] || packageJson.scripts?.['test:zui-package']
						)
					});
				}
			} catch (error) {
				if (error?.code === 'ENOENT') continue;
				throw error;
			}
		}
	}
	return facts.sort((left, right) => left.name.localeCompare(right.name));
}

const rootPackage = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const changesetConfig = JSON.parse(await readFile(resolve(root, '.changeset/config.json'), 'utf8'));
const workflow = await readFile(resolve(root, '.github/workflows/release.yml'), 'utf8');
const ci = await readFile(resolve(root, '.github/workflows/ci.yml'), 'utf8');
const packProducer = await readFile(resolve(root, 'scripts/pack-release-artifacts.mjs'), 'utf8');
const artifactReader = await readFile(resolve(root, 'scripts/read-release-artifact.mjs'), 'utf8');
const docsPackage = JSON.parse(await readFile(resolve(root, 'apps/docs/package.json'), 'utf8'));
const versionedDocsScript = await readFile(
	resolve(root, 'apps/docs/scripts/check-versioned-docs.mjs'),
	'utf8'
).catch(() => '');
const versionedDocsContractSource = await readFile(
	resolve(root, '.docs/zui/versioned-docs.json'),
	'utf8'
).catch(() => '');
const versionedDocsContract = versionedDocsContractSource
	? JSON.parse(versionedDocsContractSource)
	: null;
const zuiAcceptance = await readFile(
	resolve(root, 'ui/sveltekit/scripts/accept-zui-package.mjs'),
	'utf8'
);
const webviewAcceptance = await readFile(
	resolve(root, 'ui/webview/scripts/accept-package.mjs'),
	'utf8'
);
const miniappAcceptance = await readFile(
	resolve(root, 'ui/miniapp/scripts/accept-package.mjs'),
	'utf8'
);
const changeFiles = (await readdir(resolve(root, '.changeset'))).filter((name) =>
	name.endsWith('.md')
);
const changePackages = new Set();
for (const file of changeFiles) {
	const source = await readFile(resolve(root, '.changeset', file), 'utf8');
	for (const match of source.matchAll(/^['"]?(@[^'"\s]+)['"]?:/gmu)) changePackages.add(match[1]);
}
const packages = await packageFacts();
for (const packageFact of packages) {
	packageFact.changeset = changePackages.has(packageFact.name);
	if (packageFact.name === '@zadmin/zui')
		packageFact.acceptance = zuiAcceptance.includes("'@zadmin/zui'");
}

const checks = {
	workflowChecksExactSha: /ref:\s*\$\{\{ github\.event\.workflow_run\.head_sha \}\}/u.test(
		workflow
	),
	workflowRequiresCiSuccess: /workflow_run\.conclusion == 'success'/u.test(workflow),
	changesetsConfigured:
		changesetConfig.access === 'public' && changesetConfig.baseBranch === 'master',
	changesetTargetsKnown:
		changePackages.size > 0 &&
		[...changePackages].every((name) => packages.some((item) => item.name === name)),
	packageCheckPresent: packages
		.filter((item) => item.name === '@zadmin/zui')
		.every((item) => item.packageCheck),
	externalAcceptancePresent:
		packages
			.filter((item) =>
				['@zadmin/sveltekit', '@zadmin/webview', '@zadmin/miniapp'].includes(item.name)
			)
			.every((item) => item.acceptance) && zuiAcceptance.includes("'@zadmin/zui'"),
	ciRunsPackageAcceptance: /test:zui-package|test:package/u.test(ci),
	singlePackChecksumReuse:
		/pnpm\s+release:pack:artifacts\s+--out=\.release-artifacts/u.test(ci) &&
		/uses:\s*actions\/upload-artifact@/u.test(ci) &&
		/uses:\s*actions\/download-artifact@/u.test(ci) &&
		/include-hidden-files:\s*true/u.test(ci) &&
		/id:\s*release_artifacts_select/u.test(ci) &&
		/ZADMIN_RELEASE_ARTIFACTS_DIR=.*release-artifacts-consumer/u.test(ci) &&
		/sha256/u.test(packProducer) &&
		/validateArtifactManifest/u.test(packProducer) &&
		/readReleaseArtifact/u.test(artifactReader) &&
		/ZADMIN_RELEASE_ARTIFACTS_DIR/u.test(zuiAcceptance) &&
		/ZADMIN_RELEASE_ARTIFACTS_DIR/u.test(webviewAcceptance) &&
		/ZADMIN_RELEASE_ARTIFACTS_DIR/u.test(miniappAcceptance) &&
		ci.includes(
			'node scripts/read-release-artifact.mjs --directory="$ZADMIN_RELEASE_ARTIFACTS_DIR" --package=@zadmin/zui'
		) &&
		ci.includes('npm publish "$ZUI_TARBALL" --dry-run --ignore-scripts'),
	releasePublishTarballReuse: false,
	npmOidcProvenance:
		/id-token:\s*write/iu.test(workflow) && /provenance|trusted publishing/iu.test(workflow),
	automatedTagAndGithubRelease:
		/git tag/iu.test(workflow) && /gh release|GitHub Release|create-release/iu.test(workflow),
	registrySmoke: /npm (view|install|pack)\s+@/u.test(workflow),
	versionedDocsArtifactContract:
		versionedDocsContract?.revision === 'SOURCE_REVISION' &&
		Number.isInteger(versionedDocsContract?.routeManifest?.componentCount) &&
		versionedDocsContract.routeManifest.componentCount > 0 &&
		Number.isInteger(versionedDocsContract?.routeManifest?.guideCount) &&
		versionedDocsContract.routeManifest.guideCount > 0 &&
		versionedDocsContract?.routeManifest?.totalCount ===
			versionedDocsContract.routeManifest.componentCount +
				versionedDocsContract.routeManifest.guideCount +
				1 &&
		versionedDocsContract?.deployment?.deployed === false &&
		(await access(resolve(root, '.docs/zui/versioned-docs.md')).then(
			() => true,
			() => false
		)) &&
		docsPackage.scripts?.['docs:versioned:check'] === 'node scripts/check-versioned-docs.mjs' &&
		docsPackage.scripts?.['docs:versioned:emit'] ===
			'node scripts/check-versioned-docs.mjs --emit' &&
		docsPackage.scripts?.['audit:system']?.includes('check-versioned-docs.mjs') === true &&
		ci.includes('pnpm --filter @zadmin/docs docs:versioned:emit') &&
		ci.includes('apps/*/dist') &&
		versionedDocsScript.includes('bundleSha256') &&
		versionedDocsScript.includes("resolve(emittedRoot, 'support-matrix.json')"),
	versionedDocs: false,
	supportMatrixDocumented:
		(
			await Promise.all(
				[
					'.docs/zui/support-matrix.json',
					'.docs/zui/support-matrix.md',
					'apps/docs/scripts/check-support-matrix.mjs'
				].map((path) =>
					access(resolve(root, path)).then(
						() => true,
						() => false
					)
				)
			)
		).every(Boolean) &&
		docsPackage.scripts?.['audit:system']?.includes('check-support-matrix.mjs') === true &&
		/pnpm --filter @zadmin\/docs audit:system/u.test(ci),
	releaseBoundSupportMatrix: false
};
const blocked = Object.entries(checks)
	.filter(([, value]) => !value)
	.map(([key]) => key);
const report = {
	schemaVersion: 1,
	status: blocked.length === 0 ? 'ready' : 'blocked',
	rootPackageManager: rootPackage.packageManager,
	ci: {
		releaseWorkflow: '.github/workflows/release.yml',
		ciWorkflow: '.github/workflows/ci.yml',
		exactSha: checks.workflowChecksExactSha,
		requiresCiSuccess: checks.workflowRequiresCiSuccess
	},
	changesets: {
		config: '.changeset/config.json',
		count: changeFiles.length,
		packages: [...changePackages].sort(),
		publicAccess: changesetConfig.access === 'public',
		baseBranch: changesetConfig.baseBranch
	},
	packages,
	checks,
	blocked
};

const passed = Object.entries(checks)
	.filter(([, value]) => value)
	.map(([key]) => key);
const markdownSource = `# Release Readiness\n\n- Status: **${report.status}**\n- Scope: non-publishing fact report; this command never publishes packages or changes release permissions.\n\n## Passed facts\n\n${passed.map((key) => `- \`${key}\``).join('\n') || '- None'}\n\n## Blocked facts\n\n${blocked.map((key) => `- \`${key}\``).join('\n') || '- None'}\n\n## Public packages\n\n| Package | Version | Changeset target | Package check | External acceptance |\n| --- | --- | --- | --- | --- |\n${packages.map((item) => `| ${item.name} | ${item.version} | ${item.changeset ? 'yes' : 'no'} | ${item.packageCheck ? 'yes' : 'no'} | ${item.name === '@zadmin/zui' && zuiAcceptance.includes("'@zadmin/zui'") ? 'yes (via SvelteKit)' : item.acceptance ? 'yes' : 'no'} |`).join('\n')}\n\n## Release boundary\n\nCI now proves that one checksummed pack is reused by external consumers and the npm publish dry-run. The real registry publish still does not consume a release-bound copy of that artifact, and npm OIDC/provenance, automated tags/GitHub Releases, registry post-publish smoke, versioned Docs deployment, and a release-bound support matrix remain unproven.\n`;
const prettierConfig = (await prettier.resolveConfig(jsonPath)) ?? {};
const markdown = await prettier.format(markdownSource, {
	...prettierConfig,
	filepath: mdPath,
	parser: 'markdown'
});
const serializedJson = await prettier.format(JSON.stringify(report), {
	...prettierConfig,
	filepath: jsonPath,
	parser: 'json'
});

if (write) {
	await writeFile(jsonPath, serializedJson, 'utf8');
	await writeFile(mdPath, markdown, 'utf8');
	console.log(`Wrote ${jsonPath} and ${mdPath}.`);
} else {
	const currentJson = await readFile(jsonPath, 'utf8').catch(() => '');
	const currentMd = await readFile(mdPath, 'utf8').catch(() => '');
	if (currentJson !== serializedJson || currentMd !== markdown) {
		throw new Error('Release readiness reports are stale. Run `pnpm release:readiness:update`.');
	}
	console.log(JSON.stringify({ status: report.status, blocked, publicPackages: packages.length }));
}
