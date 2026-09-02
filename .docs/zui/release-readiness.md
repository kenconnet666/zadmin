# Release Readiness

- Status: **blocked**
- Scope: non-publishing fact report; this command never publishes packages or changes release permissions.

## Passed facts

- `workflowChecksExactSha`
- `workflowRequiresCiSuccess`
- `changesetsConfigured`
- `changesetTargetsKnown`
- `packageCheckPresent`
- `externalAcceptancePresent`
- `ciRunsPackageAcceptance`
- `singlePackChecksumReuse`
- `releaseArtifactRevisionBound`
- `releaseCandidateContract`
- `versionedDocsArtifactContract`
- `supportMatrixDocumented`

## Blocked facts

- `releasePublishTarballReuse`
- `npmOidcProvenance`
- `automatedTagAndGithubRelease`
- `registrySmoke`
- `versionedDocs`
- `releaseBoundSupportMatrix`

## Public packages

| Package           | Version | Changeset target | Package check | External acceptance |
| ----------------- | ------- | ---------------- | ------------- | ------------------- |
| @zadmin/approval  | 0.0.0   | no               | no            | no                  |
| @zadmin/auth      | 0.0.0   | no               | no            | no                  |
| @zadmin/core      | 0.0.0   | no               | no            | no                  |
| @zadmin/crm       | 0.0.0   | no               | no            | no                  |
| @zadmin/drizzle   | 0.0.0   | no               | no            | no                  |
| @zadmin/erp       | 0.0.0   | no               | no            | no                  |
| @zadmin/miniapp   | 0.1.0   | no               | no            | yes                 |
| @zadmin/oss       | 0.0.0   | no               | no            | no                  |
| @zadmin/postgres  | 0.0.0   | no               | no            | no                  |
| @zadmin/redis     | 0.0.0   | no               | no            | no                  |
| @zadmin/sveltekit | 0.0.0   | no               | no            | yes                 |
| @zadmin/webview   | 0.1.0   | no               | no            | yes                 |
| @zadmin/zui       | 0.1.0   | yes              | yes           | yes (via SvelteKit) |

## Release boundary

CI now proves that one checksummed pack is reused by external consumers and the npm publish dry-run. The release candidate contract additionally cross-checks the schema v2 manifest against the exact workspace package set and versions, binds it to the CI commit, and supports version-tag checks without publishing. The real registry publish still does not consume a release-bound copy of that artifact, and npm OIDC/provenance, automated tags/GitHub Releases, registry post-publish smoke, versioned Docs deployment, and a release-bound support matrix remain unproven.
