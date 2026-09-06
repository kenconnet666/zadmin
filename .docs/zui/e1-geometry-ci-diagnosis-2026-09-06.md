# E1 几何 CI 失败：视口前置条件修正

日期：2026-09-06；历史提交 `424128d6fd5c6e73cbe5a99bc50b8845591bcf0f`，读取已完成的 [run 34017484365 / Workspace component tests](https://github.com/kenconnet666/zadmin/actions/runs/34017484365/job/101443758590)。本次不轮询新 CI，不运行本地测试或构建。

## 确认根因

本地已安装 Vitest 4.1.11 的 config resolve 源码中，`browser.viewport.width` 未配置时为 414，高为 896。仓库 `ui/zui/vite.config.ts` 没有覆盖该配置。

`component-defaults-visual.browser.spec.ts` 的 Dialog 实际宽度，在 Chromium/WebKit 为 372.59375、Firefox 为 372.6000061035156。`ZDialogContent` 的实际合同是 `width:90%` 加 `max-width` 尺寸 token，因此 `414 × 90% = 372.6` 正好解释三个引擎的结果与子像素差异。该 fixture 明确 `motion="reduced"`，没有证据支持“400px 面板仍处于入场 scale 中间帧”的解释。

`ResponsiveGridFixture` 将 `ZContainer` 的 inline width 从 320 改为 640，但 `size="full"` 保留 `max-width:100%`。在 414px 视口中，实际容器尺寸不能达到 fixture 的 medium 断点 `31.25rem`（默认根字号下为 500px），维持四列符合 CSS 容器查询合同。

`ZContainer` 直接把初始合并样式给 DOM，再由 `applyIcssRootStyle.update()` 更新样式；该 action 在 authored style 变化时写入 `node.style.cssText` 并重建 ICSS variable 快照。它与 wrapper 将冻结后的初始 style 继续传给子组件的缺陷不同。本次没有修改 Container、root-style runtime 或 Dialog 生产源码。

## 修改内容

- Grid 宽屏几何用例显式设置 1024 × 768 的测试 iframe，保留精确 320/640px、4/8 列和 span 几何预期。增加 `container.style.width` 与实际边框盒宽度的断言，分别捕获 prop/action 没有更新和 CSS 合理限制两个不同问题。
- 增加 414px 窄视口用例：请求 inline width 必须实际更新为 640px，真实容器仍受窄视口限制，Grid 维持四列且无横向溢出。
- Dialog defaults 用例单独设置 1024 × 768，确保 400 和 768 的 max-width token 都能实际到达；保留原有精确宽度与 Portal/显式覆盖断言。额外断言 reduced-motion、0s 过渡、opacity=1 和 transform scale=1，避免把将来的动效回归混同尺寸合同。
- 使用当前 [Vitest page.viewport API](https://vitest.dev/api/browser/context.html#page) 调整测试 iframe；在 afterEach/finally 恢复原视口。没有修改全局配置、延长 timeout 或放宽宽度容差。

## 验证边界

本批仅修改两份针对性浏览器测试与该说明，未修改生产源码、Steps/E2 新组件或 generated。完成 Node Prettier、diff 空白检查和 WebStorm 局部诊断；测试结果需要后续 CI 执行，不将源码分析当作测试通过。
