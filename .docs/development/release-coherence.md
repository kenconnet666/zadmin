# Release coherence dry-run contract

`pnpm release:coherence` 是不需要外部密钥的发布前事实门禁。它只验证 package version、Changesets 配置、CI exact-SHA 取证、single-pack/checksum manifest、artifact reader、CI artifact 跨 workflow_run 绑定和 npm dry-run 是否存在一致的可执行链路。

single-pack producer 只接受没有 tracked 或 untracked 变化的干净 checkout。它生成 schema v2 `manifest.json`，把 `sourceRevision`（Git HEAD）、每个 package version、tarball bytes 与 SHA-256 固定在同一个不可变事实中。CI 下载后把同一个 `github.sha` 写入 `ZADMIN_RELEASE_ARTIFACTS_REVISION`；SvelteKit、WebView、Miniapp acceptance 以及 npm dry-run 都必须把该 env 传给 `readReleaseArtifact(..., expectedRevision)` 或命令行 `--revision`，逐一验证 manifest 来自同一提交，防止脏工作树伪装成 HEAD，或不同提交的 tarball 被交叉使用。校验失败不会触发发布，只会阻断后续 acceptance。

`pnpm release:coherence:self-test` 会分别破坏 revision consumer、release checkout SHA、manifest schema、clean-checkout gate 与 npm dry-run，确认门禁确实拒绝每一种失配，而不是只扫描到若干关键词。

Static CI 先运行 `pnpm release:candidate:self-test` 的正负例；single-pack 完成后再以真实 manifest、workspace 和 `github.sha` 运行 `scripts/check-release-candidate.mjs`。它复用 schema v2 manifest，不创建第二份清单：校验公开 release package 集合没有缺漏或多余项、每个版本与当前 workspace `package.json` 完全一致、`sourceRevision` 等于 CI commit，并在传入 Changesets 独立包 tag（例如 `--tag=@zadmin/zui@0.1.0`）时只验证该包与对应 artifact/version 的映射。该合同只读且离线，不执行 publish、tag、GitHub Release 或 OIDC 写入。

`scripts/prepare-release-handoff.mjs` 在同一 manifest 上生成路径可移植的 `validated-plan`：只保存 tarball 文件名、版本、bytes 和 SHA-256，不保存 runner 绝对路径；`executedConsumers` 必须为空。CI 上传并重新下载后用 `--verify-plan` 再校验 candidate、每个 tarball 和 handoff schema，只有验证成功，外部消费与 npm dry-run 才继续。`plannedConsumers` 只是未来 npm OIDC publish、registry smoke、GitHub Release 和版本化 Docs 的输入要求，不代表这些外部动作已经执行。

Release PR workflow 的 `verify-artifacts` job 使用 `workflow_run.id` 与 `workflow_run.head_sha` 从同一成功的 CI run 下载 `release-consumer-artifacts-<head_sha>`、`workspace-build-<head_sha>` 和 `desktop-windows-<head_sha>`，分别执行 handoff plan、versioned Docs verifier 与 `verify-desktop-artifact.mjs`。Desktop verifier 会再次校验 normalized evidence、WebView2 host/bridge、runtime maturity 与 checked-in base matrix 的 identity、summary、DesktopVerified count 及逐组件 evidence path/detail；除 DesktopVerified 增量外，基线不得被篡改。Changesets `version` job 依赖该 job，并只在自身 job 申请 `contents`/`pull-requests` 写权限。该绑定只验证 release 输入，不启用 npm OIDC、publish、tag、GitHub Release、Pages 或部署。

Changesets v2 的版本 PR 使用 `push-with-git-cli: true`，以保留 shebang CLI 等 Git tree 文件语义并避开 GitHub Contents API 对 executable/symlink commit 的限制；它仍使用显式 `github-token`，且当前 workflow 只有 version PR 子 action，没有 publish 或 tag 步骤。

由 `GITHUB_TOKEN` 创建或更新的版本 PR，其普通 `pull_request` CI 会进入待人工批准状态。因此 version job 只输出 Changesets 的 PR 编号，后续最小权限 `dispatch-release-pr-ci` job 再校验 head repository 与 `master` base，并用 `workflow_dispatch` 为该 PR 的精确 head SHA 主动触发 CI；CI 的 `dispatch-integrity` gate 会在任何重型 job 前校验 `github.sha === expected-sha`。这只补齐 release PR 验证，不授予 publish、tag 或部署权限，也不使用 `pull_request_target` 执行 PR 代码。

该命令不会创建 tag、GitHub Release、发布 npm 包或修改任何发布权限。真实 release workflow 仍以 `workflow_run.head_sha` checkout 已验证提交；真实部署和 registry publish 不由此命令宣称完成。

公开 API、Docs catalog、maturity、stability、support、versioned Docs、release readiness 和 progress 的 tracked facts 使用 `pnpm zui:artifacts:update` 按依赖顺序统一刷新；`progress` 必须在 release readiness 之后生成，避免前一步更新后立即产生陈旧摘要。
