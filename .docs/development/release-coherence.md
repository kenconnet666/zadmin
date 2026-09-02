# Release coherence dry-run contract

`pnpm release:coherence` 是不需要外部密钥的发布前事实门禁。它只验证 package version、Changesets 配置、CI exact-SHA 取证、single-pack/checksum manifest、artifact reader 和 npm dry-run 是否存在一致的可执行链路。

single-pack producer 只接受没有 tracked 或 untracked 变化的干净 checkout。它生成 schema v2 `manifest.json`，把 `sourceRevision`（Git HEAD）、每个 package version、tarball bytes 与 SHA-256 固定在同一个不可变事实中。CI 下载后把同一个 `github.sha` 写入 `ZADMIN_RELEASE_ARTIFACTS_REVISION`；SvelteKit、WebView、Miniapp acceptance 以及 npm dry-run 都必须把该 env 传给 `readReleaseArtifact(..., expectedRevision)` 或命令行 `--revision`，逐一验证 manifest 来自同一提交，防止脏工作树伪装成 HEAD，或不同提交的 tarball 被交叉使用。校验失败不会触发发布，只会阻断后续 acceptance。

`pnpm release:coherence:self-test` 会分别破坏 revision consumer、release checkout SHA、manifest schema、clean-checkout gate 与 npm dry-run，确认门禁确实拒绝每一种失配，而不是只扫描到若干关键词。

该命令不会创建 tag、GitHub Release、发布 npm 包或修改任何发布权限。真实 release workflow 仍以 `workflow_run.head_sha` checkout 已验证提交；真实部署和 registry publish 不由此命令宣称完成。
