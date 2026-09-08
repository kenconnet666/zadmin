# ZUI production progress

本文件由 `apps/docs/scripts/check-progress-summary.mjs` 从 API、成熟度、稳定性、支持矩阵、版本化 Docs 与发布就绪事实生成；不要手工维护数字。

## 当前事实

| 维度                                           |                    当前值 |                                              总量或边界 |
| ---------------------------------------------- | ------------------------: | ------------------------------------------------------: |
| Public component metadata                      |                       187 |                                                     187 |
| Declared public props                          |                      2679 |                            metadata gaps 0; fallbacks 0 |
| Metadata status stable                         |                       141 | compliant 0; pending execution 141; static violations 0 |
| Browser behavior contracts declared            |                       175 |                                                     187 |
| Visual contracts declared                      |                       161 |                                                     187 |
| Production contracts declared                  |                       179 |                                                     187 |
| SSR contracts declared                         |                       184 |                                                     187 |
| Current-revision browser + production verified |                         0 |                                     187; status pending |
| DesktopVerified execution evidence             |                         0 |                                                     187 |
| Docs routes                                    |                       127 |                   components 117; guides 9; deployed no |
| Browser matrix                                 | chromium, firefox, webkit |                                   Node 24; pnpm 11.22.0 |
| Release checks                                 |                        26 |                                      31; status blocked |

## 下一步优先级

1. **production-contract-assets** (8 remaining): 为缺少production browser/SSR合同资产的组件补明确测试。
2. **current-revision-execution** (187 remaining): 用现有revision-bound执行制品证明当前commit的browser与production合同真实通过；无制品保持pending。
3. **visual-contract-assets** (26 remaining): 补齐组件级几何、computed style或截图合同资产；资产存在不等于视觉执行通过。
4. **stable-promotion** (0 remaining): 逐项审查已满足门禁的experimental组件；禁止自动批量晋级。
5. **desktop-evidence** (187 remaining): 建立组件级WebView2/Desktop证据后再提升DesktopVerified。
6. **release-boundary** (5 remaining): 完成真实publish/OIDC/tag/registry smoke与版本化Docs部署边界。

## 当前外部边界

- `releasePublishTarballReuse`
- `npmOidcProvenance`
- `automatedTagAndGithubRelease`
- `registrySmoke`
- `versionedDocs`
