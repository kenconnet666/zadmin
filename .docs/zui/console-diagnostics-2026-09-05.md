# Docs 控制台错误与布局阻塞修复

审查基线：`46a891876aed6157a140b660ac9fc65a8d1b6c22`。用户先要求判断日志，再授权当前检查与必要修复。本轮不调整主题/组件产品范围，不屏蔽 console 或 window error。

## 已确认并修复

1. **favicon.ico 404**：原 SVG 返回 200，但 ICO 返回 404。复用原 SVG 生成真实 16px/32px PNG-frame ICO（1503 bytes），保留 SVG；HTML 使用相对 favicon URL 以配合 Vite `base: './'`。本机 HTTP 验证 ICO 现为 200、`image/x-icon`。
2. **重复节滚动**：一次 States 跳转分别从 router-runtime 和 AppShell 调用两次 scrollIntoView。Router 现在只持有 hash 路由状态；AppShell 在目标文档加载/挂载完成后统一处理节滚动或回到顶部，并在路由变化时取消旧帧。新增冷启动深链接、同页跳转、跨页同名节、快速切换回归。
3. **Table 同步强制布局**：原 `$effect` 与 mount 都立即读取 scrollWidth；切页时会在 DOM/样式批次中强制计算布局。改为 ResizeObserver 布局回调测量，去掉双重立即读取；缺少 ResizeObserver 时保留合并到 animation frame 的 resize fallback。实际溢出时仍提供 region/键盘焦点，包括 1px 溢出。
4. **上阶段 Accordion 文档加载回归**：CI `33941808088` 报 root teaching 含不存在的 appearance。该属性属于 ZAccordionTrigger，误放入 ZAccordion teaching 会让整个文档加载失败，连带造成页面标题回退和示例定位失败。已移除错误 root teaching；Trigger metadata、成员 API 和 inline demo 保留。

## 性能探测

环境：新的无扩展 Chromium，Vite 开发服务器 `http://localhost:5174`，1440×900；访问 Button → List → Card → Button。使用临时浏览器 getter 采样，只统计 ZTable wrapper 的 scrollWidth 读取；探测未写入应用源码。

| 观测                       |  修复前 | 修复后 |
| -------------------------- | ------: | -----: |
| Table scrollWidth 读取次数 |      75 |     25 |
| 单次该读取的最大耗时       | 111.7ms |  0.5ms |
| 本轮该读取超过 1ms         |    3 次 |   0 次 |
| 单次 States 目标滚动次数   |       2 |      1 |
| 修复后探测的 pageerror     |       — |      0 |

这些是局部开发环境样本，说明已消除定位到的同步布局入口；不能推断所有页面、设备或生产构建的完整导航耗时，也不宣称原日志的 275ms 在任何环境都已消失。

## VM startTime 异常边界

此前已找到 [GoogleChrome/web-vitals #792](https://github.com/GoogleChrome/web-vitals/issues/792)，其 `reportAllChanges` / `n.timeout` 堆栈与用户日志的 19429 / 5652 偏移高度吻合，报告涉及 DevTools 注入脚本的 soft navigation。项目源码与锁文件未发现 web-vitals；新的独立浏览器未复现此异常。

未取得用户那次 VM 源码，因此保留“高度疑似 DevTools 上游”的判断；未改写浏览器内部脚本、未添加忽略异常代码，也未声称已经修复 Chrome。

## 验证

- Docs catalog/router：19 项通过，确认所有文档可实例化且 Accordion 配置错误已消除。
- 新 router runtime 单元：1 项通过，确认监听器唯一与销毁，不在 hash handler 提前读取布局/滚动。
- Table/布局/文档组合 Chromium 定向测试通过；另有阻止 eager layout read 的受控 observer 回归及无 observer fallback 覆盖。
- Docs Chromium 7 项通过：SVG/ICO、单次正确文档滚动、API 表格滚动区域、浏览器前进后退、Accordion axe、节深链接和手机导航。
- API/系统静态审计通过；类型、lint 与最新提交 CI 状态以交付消息为准。
