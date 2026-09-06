# ZUI production progress

本文件由 `apps/docs/scripts/check-progress-summary.mjs` 从 API、成熟度、稳定性、支持矩阵、版本化 Docs 与发布就绪事实生成；不要手工维护数字。

## 当前事实

| 维度                      |                    当前值 |                            总量或边界 |
| ------------------------- | ------------------------: | ------------------------------------: |
| Public component metadata |                       177 |                                   177 |
| Declared public props     |                      2304 |          metadata gaps 0; fallbacks 0 |
| Stable                    |                       141 |                          violations 0 |
| BrowserBehaviorVerified   |                       165 |                                   177 |
| VisuallyVerified          |                       159 |                                   177 |
| ProductionVerified        |                       169 |                                   177 |
| DesktopVerified           |                         0 |                                   177 |
| Docs routes               |                       117 | components 107; guides 9; deployed no |
| Browser matrix            | chromium, firefox, webkit |                 Node 24; pnpm 11.22.0 |
| Release checks            |                        26 |                    31; status blocked |

## 下一步优先级

1. **production-evidence** (8 remaining): 为尚未ProductionVerified的组件补真实production browser/SSR合同。
2. **visual-evidence** (18 remaining): 补齐组件级几何、computed style或截图证据；普通浏览器交互断言不再冒充视觉验证。
3. **stable-promotion** (21 remaining): 逐项审查已满足门禁的experimental组件；禁止自动批量晋级。
4. **desktop-evidence** (177 remaining): 建立组件级WebView2/Desktop证据后再提升DesktopVerified。
5. **release-boundary** (5 remaining): 完成真实publish/OIDC/tag/registry smoke与版本化Docs部署边界。

## 当前外部边界

- `releasePublishTarballReuse`
- `npmOidcProvenance`
- `automatedTagAndGithubRelease`
- `registrySmoke`
- `versionedDocs`
