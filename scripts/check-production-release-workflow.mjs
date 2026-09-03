import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const workflowPath = resolve(root, '.github/workflows/production-release.yml');
const source = await readFile(workflowPath, 'utf8');

export function evaluateProductionReleaseWorkflow(value) {
	const privilegedJobs = value.slice(value.indexOf('\n  publish:'));
	return {
		dispatchOnly: /^on:\n {2}workflow_dispatch:/mu.test(value) && !/^ {2}push:/mu.test(value),
		requiredInputs: ['ci_run_id', 'expected_sha', 'zui_version', 'zui_tag'].every((input) =>
			new RegExp(`^      ${input}:`, 'mu').test(value)
		),
		provenance:
			/gh run view --repo "\$GITHUB_REPOSITORY" "\$RUN_ID" --json databaseId,event,status,conclusion,headSha,headBranch,workflowName/u.test(
				value
			) &&
			/\.conclusion.*success/u.test(value) &&
			/\.headSha.*\$EXPECTED_SHA/u.test(value) &&
			/\.headBranch.*master/u.test(value) &&
			/\.workflowName.*CI/u.test(value),
		exactArtifacts:
			/release-consumer-artifacts-\$\{\{ (?:steps\.provenance\.outputs\.sha|needs\.preflight\.outputs\.sha) \}\}/u.test(
				value
			) &&
			/workspace-build-\$\{\{ (?:steps\.provenance\.outputs\.sha|needs\.preflight\.outputs\.sha|needs\.publish\.outputs\.sha) \}\}/u.test(
				value
			) &&
			/desktop-windows-\$\{\{ (?:steps\.provenance\.outputs\.sha|needs\.preflight\.outputs\.sha) \}\}/u.test(
				value
			) &&
			/run-id: \$\{\{ (?:steps\.provenance\.outputs\.run_id|needs\.(?:preflight|publish)\.outputs\.run_id) \}\}/u.test(
				value
			) &&
			!/release-consumer-artifacts-\$\{\{ github\.sha \}\}/u.test(value),
		downstreamValidatedOutputs:
			privilegedJobs.length > 0 &&
			!/\$\{\{ inputs\./u.test(privilegedJobs) &&
			/needs\.preflight\.outputs\.sha/u.test(privilegedJobs) &&
			/needs\.publish\.outputs\.sha/u.test(privilegedJobs),

		preflightVerification:
			/prepare-release-handoff\.mjs[\s\S]*--verify-plan=/u.test(value) &&
			/verify-versioned-docs-artifact\.mjs[\s\S]*--revision=/u.test(value) &&
			/verify-desktop-artifact\.mjs[\s\S]*--revision=/u.test(value),
		npmTrustedPublishing:
			/publish:\s*[\s\S]*?id-token:\s*write/u.test(value) &&
			/npm publish "\$tarball" --access public --provenance/u.test(value) &&
			!/pnpm\s+.*pack/u.test(value),
		registrySmoke:
			/Verify bounded registry propagation/u.test(value) && /probe-npm-registry\.mjs/u.test(value),
		tagAfterPublish: /npm publish[\s\S]*?git tag --annotate/u.test(value),
		pagesAfterRelease:
			/gh release create[\s\S]*?actions\/upload-pages-artifact/u.test(value) &&
			/actions\/deploy-pages@v4/u.test(value),
		productionBoundary:
			/environment: production/u.test(value) &&
			/group: production-release/u.test(value) &&
			/cancel-in-progress: false/u.test(value),
		jobBoundaries:
			value.includes('needs: preflight') &&
			value.includes('needs: publish') &&
			value.includes('permissions: { contents: read, actions: read }') &&
			value.includes('permissions: { contents: write, actions: read, id-token: write }') &&
			value.includes(
				'permissions: { contents: read, actions: read, pages: write, id-token: write }'
			),
		dynamicTarball:
			/read-release-artifact\.mjs[\s\S]*--package=@zadmin\/zui[\s\S]*\.zui-tarball-path/u.test(
				value
			) &&
			/npm publish "\$tarball"/u.test(value) &&
			!/npm publish \.release-artifacts\/zui\.tgz/u.test(value),
		idempotentPublish:
			value.includes('probe-npm-registry.mjs') &&
			value.includes('--tarball=') &&
			value.includes('npm publish'),
		exactTagReuse:
			value.includes('git ls-remote --exit-code --tags origin') &&
			value.includes('^{commit}') &&
			value.includes('probe-github-release.mjs'),
		attachmentReuse:
			/gh release create[\s\S]*cat \.zui-tarball-path[\s\S]*release-handoff\.json[\s\S]*support-matrix\.json/u.test(
				value
			),
		registryProbe:
			/probe-npm-registry\.mjs/u.test(value) && !/npm view[\s\S]*\|\| true/u.test(value),
		boundedPollFailsInfrastructure:
			/status="\$\(jq -er \.status <<<"\$probe"\)"[\s\S]*test "\$status" = absent/u.test(value) &&
			!/probe="\$\(node scripts\/probe-npm-registry\.mjs[^\n]*2>\/dev\/null/u.test(value),
		tagPeel:
			/git fetch --quiet origin "\+?refs\/tags\/\$TAG:refs\/tags\/\$TAG"/u.test(value) &&
			/\$TAG\^\{commit\}/u.test(value),
		pagesEnvironment:
			/name: github-pages[\s\S]*url:/u.test(value) &&
			/id: deployment[\s\S]*actions\/deploy-pages@v4/u.test(value),
		githubReleaseProbe:
			/probe-github-release\.mjs[\s\S]*status.*absent/u.test(value) &&
			/--verify-tag/u.test(value) &&
			!/gh release view/u.test(value),
		releaseAssetIntegrity:
			/--tarball="\$tarball_path"/u.test(value) &&
			/--handoff=\.release-artifacts\/release-handoff\.json/u.test(value) &&
			/--support=\.release-artifacts\/support-matrix\.json/u.test(value) &&
			/test "\$\(jq -er \.match <<<"\$release_probe"\)" = true/u.test(value),
		candidateVersionBinding:
			/check-release-candidate\.mjs[\s\S]*--tag=/u.test(value) &&
			/\.artifacts\[\][\s\S]*@zadmin\/zui[\s\S]*\.version/u.test(value),
		peeledTagStatus:
			/git ls-remote --exit-code/u.test(value) &&
			/tag_status=\$\?/u.test(value) &&
			/\[ "\$tag_status" -eq 2 \]/u.test(value),
		pagesOutputUrl: /url: \$\{\{ steps\.deployment\.outputs\.page_url \}\}/u.test(value),
		privilegedJobsNoInstall:
			privilegedJobs.length > 0 &&
			!/setup-workspace|pnpm install|npm (?:ci|install)/u.test(privilegedJobs) &&
			/registry-url: https:\/\/registry\.npmjs\.org/u.test(value) &&
			(value.match(/package-manager-cache: false/gu) ?? []).length === 3,
		npmTrustedPublishingVersion:
			/Verify npm version for trusted publishing/u.test(value) && /npm >= 11\.5\.1/u.test(value)
	};
}

const checks = evaluateProductionReleaseWorkflow(source);
const failed = Object.entries(checks)
	.filter(([, passed]) => !passed)
	.map(([name]) => name);
if (process.argv.includes('--self-test')) {
	const cases = [
		['push trigger', 'on:\n  workflow_dispatch:', 'on:\n  push:', 'dispatchOnly'],
		['missing required input', '      ci_run_id:', '      removed_ci_run_id:', 'requiredInputs'],
		[
			'unbound workflow provenance',
			'.workflowName\' <<<"$run_json")" = CI',
			'.workflowName\' <<<"$run_json")" = Other',
			'provenance'
		],
		[
			'missing exact SHA artifact binding',
			'release-consumer-artifacts-${{ steps.provenance.outputs.sha }}',
			'release-consumer-artifacts-${{ github.sha }}',
			'exactArtifacts'
		],
		[
			'missing preflight handoff verification',
			'node scripts/prepare-release-handoff.mjs',
			'node scripts/prepare-release-handoff-disabled.mjs',
			'preflightVerification'
		],
		[
			'unproven npm publish',
			'npm publish "$tarball" --access public --provenance',
			'npm publish "$tarball" --access public',
			'npmTrustedPublishing'
		],
		[
			'missing post-publish tag',
			'git tag --annotate "$TAG" "$SHA"',
			'echo skipped-tag',
			'tagAfterPublish'
		],
		[
			'missing production environment',
			'environment: production',
			'environment: staging',
			'productionBoundary'
		],
		['hardcoded tarball', 'read-release-artifact.mjs', 'echo no-resolver', 'dynamicTarball'],
		[
			'raw input reused after preflight',
			'needs.preflight.outputs.sha',
			'inputs.expected_sha',
			'downstreamValidatedOutputs'
		],
		['single privileged job', 'needs: preflight', 'needs: removed', 'jobBoundaries'],
		['non-idempotent registry path', 'probe-npm-registry.mjs', 'npm view', 'idempotentPublish'],
		[
			'unpeeled annotated tag',
			'git rev-list -n 1 "$TAG^{commit}"',
			'git rev-list -n 1 "$TAG"',
			'exactTagReuse'
		],
		[
			'missing release attachments',
			'.release-artifacts/support-matrix.json',
			'echo no-support',
			'attachmentReuse'
		],
		[
			'missing release asset integrity input',
			'--support=.release-artifacts/support-matrix.json',
			'--support=missing-support.json',
			'releaseAssetIntegrity'
		],
		[
			'missing GitHub release probe',
			'probe-github-release.mjs',
			'probe-github-release-disabled.mjs',
			'githubReleaseProbe'
		],
		[
			'missing candidate version binding',
			'\'.artifacts[] | select(.name == "@zadmin/zui") | .version\'',
			'\'.packages[] | select(.name == "@zadmin/zui") | .version\'',
			'candidateVersionBinding'
		],
		['missing tag status branch', 'tag_status=$?', 'tag_status=0', 'peeledTagStatus'],
		[
			'missing Pages environment URL',
			'url: ${{ steps.deployment.outputs.page_url }}',
			'environment-url-removed',
			'pagesOutputUrl'
		],
		[
			'privileged job installs dependencies',
			'actions/setup-node@v7',
			'./.github/actions/setup-workspace',
			'privilegedJobsNoInstall'
		],
		[
			'missing npm trusted publishing version gate',
			'npm >= 11.5.1',
			'npm >= 10.0.0',
			'npmTrustedPublishingVersion'
		],
		[
			'poll hides registry failure',
			'probe="$(node scripts/probe-npm-registry.mjs --package=@zadmin/zui --version="$VERSION" --tarball="$(cat .zui-tarball-path)")"',
			'probe="$(node scripts/probe-npm-registry.mjs --package=@zadmin/zui --version="$VERSION" --tarball="$(cat .zui-tarball-path)" 2>/dev/null)"',
			'boundedPollFailsInfrastructure'
		],
		[
			'missing bounded registry step',
			'Verify bounded registry propagation and integrity',
			'Registry check removed',
			'registrySmoke'
		],
		[
			'missing Pages deployment',
			'actions/deploy-pages@v4',
			'actions/disabled-pages@v4',
			'pagesAfterRelease'
		]
	];
	for (const [label, replacement, mutation, key] of cases) {
		const mutated = [
			'exactArtifacts',
			'preflightVerification',
			'dynamicTarball',
			'jobBoundaries',
			'idempotentPublish',
			'exactTagReuse',
			'attachmentReuse',
			'releaseAssetIntegrity',
			'githubReleaseProbe',
			'candidateVersionBinding',
			'peeledTagStatus',
			'pagesOutputUrl',
			'privilegedJobsNoInstall',
			'npmTrustedPublishingVersion'
		].includes(key)
			? source.replaceAll(replacement, mutation)
			: source.replace(replacement, mutation);
		if (evaluateProductionReleaseWorkflow(mutated)[key])
			throw new Error(`Production release workflow self-test accepted ${label}.`);
	}
	console.log(JSON.stringify({ cases: cases.length, status: 'passed' }));
	process.exit(0);
}
if (failed.length)
	throw new Error(`Production release workflow checks failed: ${failed.join(', ')}`);
console.log(JSON.stringify({ checks, status: 'passed', publishing: 'configured-only' }));
