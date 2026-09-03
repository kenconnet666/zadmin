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
const productionWorkflow = await readFile(
	resolve(root, '.github/workflows/production-release.yml'),
	'utf8'
);
const ci = await readFile(resolve(root, '.github/workflows/ci.yml'), 'utf8');
const packProducer = await readFile(resolve(root, 'scripts/pack-release-artifacts.mjs'), 'utf8');
const artifactReader = await readFile(resolve(root, 'scripts/read-release-artifact.mjs'), 'utf8');
const releaseCandidate = await readFile(
	resolve(root, 'scripts/check-release-candidate.mjs'),
	'utf8'
);
const releaseHandoff = await readFile(resolve(root, 'scripts/prepare-release-handoff.mjs'), 'utf8');
const releaseCoherence = await readFile(
	resolve(root, 'scripts/check-release-coherence.mjs'),
	'utf8'
);
const docsPackage = JSON.parse(await readFile(resolve(root, 'apps/docs/package.json'), 'utf8'));
const versionedDocsScript = await readFile(
	resolve(root, 'apps/docs/scripts/check-versioned-docs.mjs'),
	'utf8'
).catch(() => '');
const versionedDocsVerifier = await readFile(
	resolve(root, 'apps/docs/scripts/verify-versioned-docs-artifact.mjs'),
	'utf8'
).catch(() => '');
const desktopArtifactVerifier = await readFile(
	resolve(root, 'apps/docs/scripts/verify-desktop-artifact.mjs'),
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
	releaseWorkflowArtifactBinding:
		/verify-artifacts:/u.test(workflow) &&
		/needs:\s*verify-artifacts/u.test(workflow) &&
		/name:\s*release-consumer-artifacts-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/u.test(
			workflow
		) &&
		/name:\s*workspace-build-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/u.test(workflow) &&
		/run-id:\s*\$\{\{ github\.event\.workflow_run\.id \}\}/gu.test(workflow) &&
		/prepare-release-handoff\.mjs[\s\S]*--verify-plan=/u.test(workflow) &&
		/verify-versioned-docs-artifact\.mjs[\s\S]*--revision=/u.test(workflow),
	desktopArtifactReleaseBinding:
		docsPackage.scripts?.['maturity:desktop:verify'] ===
			'node scripts/verify-desktop-artifact.mjs' &&
		/name:\s*desktop-windows-\$\{\{ github\.sha \}\}/u.test(ci) &&
		/name:\s*desktop-windows-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/u.test(workflow) &&
		workflow.includes('run-id: ${{ github.event.workflow_run.id }}') &&
		workflow.includes('node apps/docs/scripts/verify-desktop-artifact.mjs') &&
		desktopArtifactVerifier.includes('validateDesktopEvidenceArtifact') &&
		desktopArtifactVerifier.includes("path !== '.docs/zui/component-maturity.json'") &&
		desktopArtifactVerifier.includes('maturity summary baseline was modified') &&
		desktopArtifactVerifier.includes('runtime maturity baseline was modified'),
	releaseVersionUsesGitCli:
		/uses:\s*changesets\/action\/version@v2[\s\S]*push-with-git-cli:\s*true/u.test(workflow),
	releasePrCiDispatchBound:
		/actions:\s*write/u.test(workflow) &&
		/id:\s*changesets/u.test(workflow) &&
		/steps\.changesets\.outputs\.pr-number/u.test(workflow) &&
		/head_repository=.*head\.repo\.full_name/u.test(workflow) &&
		/test "\$head_repository" = "\$GITHUB_REPOSITORY"/u.test(workflow) &&
		/test "\$base_ref" = 'master'/u.test(workflow) &&
		/return_run_details:\s*true/u.test(workflow) &&
		/X-GitHub-Api-Version:\s*2026-03-10/u.test(workflow) &&
		/actions\/workflows\/ci\.yml\/dispatches/u.test(workflow) &&
		/workflow_dispatch:\s*\n\s*inputs:\s*\n\s*expected-sha:/u.test(ci) &&
		/name:\s*Dispatch revision integrity/u.test(ci) &&
		/ACTUAL_SHA:\s*\$\{\{ github\.sha \}\}/u.test(ci) &&
		/if \[ "\$ACTUAL_SHA" != "\$EXPECTED_SHA" \]/u.test(ci),
	releasePrCiCompletionBound:
		/workflow_run_id/u.test(workflow) &&
		/gh run watch "\$run_id" --exit-status --interval 10/u.test(workflow) &&
		/gh run view "\$run_id" --json event,headSha,conclusion,url/u.test(workflow) &&
		/test .*\.event.* = 'workflow_dispatch'/u.test(workflow) &&
		/test .*\.headSha.* = "\$head_sha"/u.test(workflow) &&
		/test .*\.conclusion.* = 'success'/u.test(workflow) &&
		/test .*\.url.* = "\$run_url"/u.test(workflow),
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
		/ZADMIN_RELEASE_ARTIFACTS_REVISION/u.test(zuiAcceptance) &&
		/ZADMIN_RELEASE_ARTIFACTS_REVISION/u.test(webviewAcceptance) &&
		/ZADMIN_RELEASE_ARTIFACTS_REVISION/u.test(miniappAcceptance) &&
		ci.includes(
			'node scripts/read-release-artifact.mjs --directory="$ZADMIN_RELEASE_ARTIFACTS_DIR" --package=@zadmin/zui'
		) &&
		ci.includes('npm publish "$ZUI_TARBALL" --dry-run --ignore-scripts'),
	releaseArtifactRevisionBound:
		rootPackage.scripts?.['release:coherence'] === 'node scripts/check-release-coherence.mjs' &&
		ci.includes('pnpm release:coherence') &&
		/schemaVersion:\s*2/u.test(packProducer) &&
		/sourceRevision/u.test(packProducer) &&
		/--porcelain=v1/u.test(packProducer) &&
		/manifest\?\.schemaVersion !== 2/u.test(artifactReader) &&
		/expectedRevision !== undefined/u.test(artifactReader) &&
		/--revision="\$ZADMIN_RELEASE_ARTIFACTS_REVISION"/u.test(ci) &&
		/ZADMIN_RELEASE_ARTIFACTS_REVISION=\$\{\{ github\.sha \}\}/u.test(ci) &&
		/evaluateReleaseCoherence/u.test(releaseCoherence),
	releaseCandidateContract:
		rootPackage.scripts?.['release:candidate:check'] ===
			'node scripts/check-release-candidate.mjs' &&
		rootPackage.scripts?.['release:candidate:self-test'] ===
			'node scripts/check-release-candidate.mjs --self-test' &&
		/validateArtifactManifest\(manifest\)/u.test(releaseCandidate) &&
		/workspacePackages/u.test(releaseCandidate) &&
		/releasePackageNames/u.test(releaseCandidate) &&
		/expectedRevision/u.test(releaseCandidate) &&
		/--tag=/u.test(releaseCandidate) &&
		/pnpm release:candidate:self-test/u.test(ci) &&
		/node scripts\/check-release-candidate\.mjs --directory=\.release-artifacts --revision=/u.test(
			ci
		),
	releaseHandoffPlan:
		rootPackage.scripts?.['release:handoff:check'] === 'node scripts/prepare-release-handoff.mjs' &&
		rootPackage.scripts?.['release:handoff:self-test'] ===
			'node scripts/prepare-release-handoff.mjs --self-test' &&
		/status:\s*'validated-plan'/u.test(releaseHandoff) &&
		/executedConsumers:\s*\[\]/u.test(releaseHandoff) &&
		/verifyReleaseHandoff/u.test(releaseHandoff) &&
		/pnpm release:handoff:self-test/u.test(ci) &&
		/--verify-plan=\.release-artifacts-consumer\/release-handoff\.json/u.test(ci) &&
		/steps\.release_handoff_verify\.outcome == 'success'/u.test(ci),
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
	versionedDocsArtifactRoundTrip:
		docsPackage.scripts?.['docs:versioned:verify'] ===
			'node scripts/verify-versioned-docs-artifact.mjs' &&
		docsPackage.scripts?.['docs:versioned:verify:self-test'] ===
			'node scripts/verify-versioned-docs-artifact.mjs --self-test' &&
		/verifyVersionedDocsArtifact/u.test(versionedDocsVerifier) &&
		/bundle checksum mismatch/u.test(versionedDocsVerifier) &&
		/build file set does not match/u.test(versionedDocsVerifier) &&
		/pnpm --filter @zadmin\/docs docs:versioned:verify:self-test/u.test(ci) &&
		/id:\s*versioned_docs_artifact_download/u.test(ci) &&
		/--dist=\.versioned-docs-consumer\/apps\/docs\/dist/u.test(ci) &&
		/--revision="\$\{\{ github\.sha \}\}"/u.test(ci),
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
	releaseBoundSupportMatrix:
		/\.docs\/zui\/support-matrix\.json\s+\.release-artifacts\/support-matrix\.json/u.test(ci) &&
		/supportMatrixFacts/u.test(releaseHandoff) &&
		/\n\s*supportMatrix,/u.test(releaseHandoff) &&
		/artifactPath:\s*'support-matrix\.json'/u.test(releaseHandoff) &&
		/bytes\/checksum\/revision/u.test(releaseHandoff) &&
		/name:\s*release-consumer-artifacts-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/u.test(
			workflow
		) &&
		/prepare-release-handoff\.mjs[\s\S]*--verify-plan=/u.test(workflow) &&
		/support matrix bytes\/checksum\/revision do not match downloaded input/u.test(
			releaseHandoff
		) &&
		/sha256Pattern/u.test(releaseHandoff),
	productionReleaseWorkflowConfigured:
		rootPackage.scripts?.['release:production:check'] ===
			'node scripts/check-production-release-workflow.mjs' &&
		rootPackage.scripts?.['release:production:self-test'] ===
			'node scripts/check-production-release-workflow.mjs --self-test' &&
		rootPackage.scripts?.['release:github-release:self-test'] ===
			'node scripts/probe-github-release.mjs --self-test' &&
		rootPackage.scripts?.['release:npm-registry:self-test'] ===
			'node scripts/probe-npm-registry.mjs --self-test' &&
		rootPackage.scripts?.['release:artifact:self-test'] ===
			'node scripts/read-release-artifact.mjs --self-test' &&
		ci.includes('pnpm release:production:self-test') &&
		ci.includes('pnpm release:production:check') &&
		ci.includes('pnpm release:github-release:self-test') &&
		ci.includes('pnpm release:npm-registry:self-test') &&
		ci.includes('pnpm release:artifact:self-test') &&
		/^on:\n {2}workflow_dispatch:/mu.test(productionWorkflow) &&
		!/^[ ]{2}push:/mu.test(productionWorkflow) &&
		/ci_run_id:/u.test(productionWorkflow) &&
		/expected_sha:/u.test(productionWorkflow) &&
		/zui_version:/u.test(productionWorkflow) &&
		/zui_tag:/u.test(productionWorkflow) &&
		/gh run view.*databaseId,event,status,conclusion,headSha,headBranch,workflowName/u.test(
			productionWorkflow
		) &&
		/npm publish "\$tarball" --access public --provenance/u.test(productionWorkflow) &&
		/actions\/deploy-pages/u.test(productionWorkflow),
	releasePublishTarballReuseConfigured:
		/npm publish "\$tarball" --access public --provenance/u.test(productionWorkflow) &&
		!/pnpm\s+.*pack/u.test(productionWorkflow),
	npmOidcProvenanceConfigured:
		/id-token:\s*write/u.test(productionWorkflow) &&
		/npm publish[\s\S]*--provenance/u.test(productionWorkflow),
	automatedTagAndGithubReleaseConfigured:
		/git tag --annotate/u.test(productionWorkflow) && /gh release create/u.test(productionWorkflow),
	registrySmokeConfigured:
		/probe-npm-registry\.mjs/u.test(productionWorkflow) &&
		/Verify bounded registry propagation/u.test(productionWorkflow) &&
		!/\|\| true/u.test(productionWorkflow),
	versionedDocsDeploymentConfigured:
		/actions\/upload-pages-artifact/u.test(productionWorkflow) &&
		/actions\/deploy-pages/u.test(productionWorkflow)
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
const markdownSource = `# Release Readiness\n\n- Status: **${report.status}**\n- Scope: non-publishing fact report; this command never publishes packages or changes release permissions.\n\n## Passed facts\n\n${passed.map((key) => `- \`${key}\``).join('\n') || '- None'}\n\n## Blocked facts\n\n${blocked.map((key) => `- \`${key}\``).join('\n') || '- None'}\n\n## Public packages\n\n| Package | Version | Changeset target | Package check | External acceptance |\n| --- | --- | --- | --- | --- |\n${packages.map((item) => `| ${item.name} | ${item.version} | ${item.changeset ? 'yes' : 'no'} | ${item.packageCheck ? 'yes' : 'no'} | ${item.name === '@zadmin/zui' && zuiAcceptance.includes("'@zadmin/zui'") ? 'yes (via SvelteKit)' : item.acceptance ? 'yes' : 'no'} |`).join('\n')}\n\n## Release boundary\n\nCI now proves that one checksummed pack is reused by external consumers and the npm publish dry-run. The release candidate contract cross-checks the schema v2 manifest against the exact workspace package set, versions, and CI commit. A portable validated handoff plan is uploaded with those tarballs, verified again after download, and explicitly keeps executedConsumers empty. The versioned Docs dist is likewise downloaded and independently rechecked against its per-file SHA-256, bundle digest, route manifest, package version, revision, and support matrix. The same release gate downloads the Windows WebView2 artifact from the identical workflow run and SHA, then revalidates its structured component evidence, bridge and host identity, runtime DesktopVerified matrix, checked-in baseline, summary, and per-component evidence binding. These are input/artifact contracts, not publish or deployment evidence. The real registry publish still does not consume a release-bound copy of that artifact, and npm OIDC/provenance, automated tags/GitHub Releases, registry post-publish smoke, versioned Docs deployment, and a release-bound support matrix remain unproven.\n`;
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
