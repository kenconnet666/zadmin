import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFile(resolve(root, path), 'utf8');

function count(source, pattern) {
	return [...source.matchAll(pattern)].length;
}

export function evaluateReleaseCoherence({
	changesetConfig,
	ci,
	manifestProducer,
	manifestReader,
	miniappAcceptance,
	packageJson,
	release,
	sveltekitAcceptance,
	webviewAcceptance
}) {
	const publishLines = [...ci.matchAll(/^\s*[^#\n]*npm publish[^\n]*$/gmu)].map(([line]) =>
		line.trim()
	);
	return {
		packageVersion: /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(packageJson.version),
		changesetPublicMaster:
			changesetConfig.access === 'public' && changesetConfig.baseBranch === 'master',
		ciExactSha: count(ci, /name:\s*release-consumer-artifacts-\$\{\{ github\.sha \}\}/gu) === 2,
		singlePack: count(ci, /pnpm\s+release:pack:artifacts\s+--out=\.release-artifacts/gu) === 1,
		cleanSourceManifest:
			/schemaVersion:\s*2/u.test(manifestProducer) &&
			/sourceRevision/u.test(manifestProducer) &&
			/\['status', '--porcelain=v1', '--untracked-files=all'\]/u.test(manifestProducer) &&
			/validateArtifactManifest\(manifest\)/u.test(manifestProducer),
		manifestValidation:
			/manifest\?\.schemaVersion !== 2/u.test(manifestReader) &&
			/sourceRevisionPattern\.test\(manifest\.sourceRevision/u.test(manifestReader) &&
			/expectedRevision !== undefined/u.test(manifestReader) &&
			/manifest\.sourceRevision !== expectedRevision/u.test(manifestReader) &&
			/readReleaseArtifact/u.test(manifestReader) &&
			/sha256 !== artifact\.sha256/u.test(manifestReader),
		revisionBoundConsumer: ci.includes(
			'node scripts/read-release-artifact.mjs --directory="$ZADMIN_RELEASE_ARTIFACTS_DIR" --package=@zadmin/zui --revision="$ZADMIN_RELEASE_ARTIFACTS_REVISION"'
		),
		externalConsumersRevisionBound:
			[sveltekitAcceptance, webviewAcceptance, miniappAcceptance].every(
				(source) =>
					/ZADMIN_RELEASE_ARTIFACTS_DIR/u.test(source) &&
					/ZADMIN_RELEASE_ARTIFACTS_REVISION/u.test(source) &&
					/readReleaseArtifact\([^\n]*artifactRevision\)/u.test(source)
			) && /ZADMIN_RELEASE_ARTIFACTS_REVISION=\$\{\{ github\.sha \}\}/u.test(ci),
		ciRevisionEnvironment:
			/ZADMIN_RELEASE_ARTIFACTS_DIR=.*release-artifacts-consumer/u.test(ci) &&
			/ZADMIN_RELEASE_ARTIFACTS_REVISION=\$\{\{ github\.sha \}\}/u.test(ci),
		dryRunOnly:
			publishLines.length === 1 &&
			publishLines[0]?.includes('--dry-run') === true &&
			!/^\s*[^#\n]*npm publish[^\n]*$/mu.test(release),
		releaseUsesWorkflowSha: /ref:\s*\$\{\{ github\.event\.workflow_run\.head_sha \}\}/u.test(
			release
		),
		releaseRequiresSuccessfulMasterPush:
			/workflow_run\.conclusion == 'success'/u.test(release) &&
			/workflow_run\.event == 'push'/u.test(release) &&
			/workflow_run\.head_branch == 'master'/u.test(release),
		releaseArtifactBinding:
			/verify-artifacts:/u.test(release) &&
			/needs:\s*verify-artifacts/u.test(release) &&
			/name:\s*release-consumer-artifacts-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/u.test(
				release
			) &&
			/name:\s*workspace-build-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/u.test(release) &&
			/run-id:\s*\$\{\{ github\.event\.workflow_run\.id \}\}/gu.test(release),
		desktopArtifactBinding:
			/name:\s*desktop-windows-\$\{\{ github\.event\.workflow_run\.head_sha \}\}/u.test(release) &&
			/run-id:\s*\$\{\{ github\.event\.workflow_run\.id \}\}/u.test(release) &&
			/verify-desktop-artifact\.mjs/u.test(release) &&
			/name:\s*desktop-windows-\$\{\{ github\.sha \}\}/u.test(ci),
		releaseVersionUsesGitCli:
			/uses:\s*changesets\/action\/version@v2[\s\S]*push-with-git-cli:\s*true/u.test(release),
		releasePrCiDispatchBound:
			/actions:\s*write/u.test(release) &&
			/id:\s*changesets/u.test(release) &&
			/steps\.changesets\.outputs\.pr-number/u.test(release) &&
			/head_repository=.*head\.repo\.full_name/u.test(release) &&
			/test "\$head_repository" = "\$GITHUB_REPOSITORY"/u.test(release) &&
			/test "\$base_ref" = 'master'/u.test(release) &&
			/return_run_details:\s*true/u.test(release) &&
			/X-GitHub-Api-Version:\s*2026-03-10/u.test(release) &&
			/actions\/workflows\/ci\.yml\/dispatches/u.test(release) &&
			/workflow_dispatch:\s*\n\s*inputs:\s*\n\s*expected-sha:/u.test(ci) &&
			/name:\s*Dispatch revision integrity/u.test(ci) &&
			/ACTUAL_SHA:\s*\$\{\{ github\.sha \}\}/u.test(ci) &&
			/if \[ "\$ACTUAL_SHA" != "\$EXPECTED_SHA" \]/u.test(ci),
		releasePrCiCompletionBound:
			/workflow_run_id/u.test(release) &&
			/gh run watch "\$run_id" --repo "\$GITHUB_REPOSITORY" --exit-status --interval 10/u.test(
				release
			) &&
			/gh run view "\$run_id" --repo "\$GITHUB_REPOSITORY" --json event,headSha,conclusion,url/u.test(
				release
			) &&
			/test .*\.event.* = 'workflow_dispatch'/u.test(release) &&
			/test .*\.headSha.* = "\$head_sha"/u.test(release) &&
			/test .*\.conclusion.* = 'success'/u.test(release) &&
			/test .*\.url.* = "\$run_url"/u.test(release)
	};
}

const sources = {
	ci: await read('.github/workflows/ci.yml'),
	release: await read('.github/workflows/release.yml'),
	packageJson: JSON.parse(await read('ui/zui/package.json')),
	changesetConfig: JSON.parse(await read('.changeset/config.json')),
	manifestProducer: await read('scripts/pack-release-artifacts.mjs'),
	manifestReader: await read('scripts/read-release-artifact.mjs'),
	sveltekitAcceptance: await read('ui/sveltekit/scripts/accept-zui-package.mjs'),
	webviewAcceptance: await read('ui/webview/scripts/accept-package.mjs'),
	miniappAcceptance: await read('ui/miniapp/scripts/accept-package.mjs')
};
const checks = evaluateReleaseCoherence(sources);
const failed = Object.entries(checks)
	.filter(([, value]) => !value)
	.map(([key]) => key);
if (failed.length) throw new Error(`Release coherence checks failed: ${failed.join(', ')}`);

if (process.argv.includes('--self-test')) {
	const negativeCases = [
		{
			check: 'revisionBoundConsumer',
			input: {
				ci: sources.ci.replace(' --revision="$ZADMIN_RELEASE_ARTIFACTS_REVISION"', '')
			}
		},
		{
			check: 'externalConsumersRevisionBound',
			input: {
				webviewAcceptance: sources.webviewAcceptance.replace(', artifactRevision', '')
			}
		},
		{
			check: 'ciRevisionEnvironment',
			input: { ci: sources.ci.replace('ZADMIN_RELEASE_ARTIFACTS_REVISION=${{ github.sha }}', '') }
		},
		{
			check: 'releaseUsesWorkflowSha',
			input: {
				release: sources.release.replaceAll(
					'github.event.workflow_run.head_sha',
					'github.event.workflow_run.head_branch'
				)
			}
		},
		{
			check: 'manifestValidation',
			input: {
				manifestReader: sources.manifestReader.replace('schemaVersion !== 2', 'schemaVersion !== 1')
			}
		},
		{
			check: 'cleanSourceManifest',
			input: { manifestProducer: sources.manifestProducer.replace("'--porcelain=v1'", "'--short'") }
		},
		{
			check: 'dryRunOnly',
			input: { ci: sources.ci.replace(' --dry-run', '') }
		},
		{
			check: 'desktopArtifactBinding',
			input: {
				release: sources.release.replace(
					'desktop-windows-${{ github.event.workflow_run.head_sha }}',
					'desktop-windows-${{ github.event.workflow_run.head_branch }}'
				)
			}
		},
		{
			check: 'releaseVersionUsesGitCli',
			input: {
				release: sources.release.replace('push-with-git-cli: true', 'push-with-git-cli: false')
			}
		},
		{
			check: 'releasePrCiDispatchBound',
			input: {
				release: sources.release.replace('return_run_details: true', 'return_run_details: false')
			}
		},
		{
			check: 'releasePrCiCompletionBound',
			input: {
				release: sources.release.replace(
					'gh run watch "$run_id" --repo "$GITHUB_REPOSITORY" --exit-status --interval 10',
					''
				)
			}
		}
	];
	for (const { check, input } of negativeCases) {
		const result = evaluateReleaseCoherence({ ...sources, ...input });
		if (result[check] !== false)
			throw new Error(`Release coherence self-test did not reject ${check}.`);
	}
	console.log(JSON.stringify({ negativeCases: negativeCases.length, status: 'passed' }));
	process.exit(0);
}

console.log(
	JSON.stringify({
		package: sources.packageJson.name,
		version: sources.packageJson.version,
		checks,
		status: 'passed',
		publishing: false
	})
);
