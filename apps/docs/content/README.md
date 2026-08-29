# ZAdmin 文档

这里记录当前仓库已经实现和验证的行为。代码、测试和文档必须在同一个提交阶段保持一致；本文档不保存已经放弃的设计草图。

1. [架构与目录](./architecture.md)：工作区边界、静态 Module、动态 Plugin 和服务端/浏览器隔离。
2. [DI 容器](./dependency-injection.md)：Token、Provider、Module、Generation、生命周期、回滚和装饰器。
3. [插件开发](./plugin-development.md)：同仓库或外部仓库开发、类型依赖、Manifest、构建和打包。
4. [插件生命周期](./plugin-lifecycle.md)：安装、等待、激活、升级、禁用、泄漏和关闭。
5. [开发态热重载](./development-hmr.md)：服务端、客户端和上游类型的三条独立更新链。
6. [ZUI ICSS](./zui-icss.md)：单一 class API、运行时 CSS、Svelte 编译优化和生产验收合同。
7. [ZUI 使用与外部接入](./zui-usage.md)：安装、编译器、SSR、CSP、主题和组件示例。
8. [测试与验收](./testing.md)：自动化命令、覆盖矩阵和真实浏览器 HMR步骤。
9. [工程倾向](./engineering-preferences.md)：目录、依赖、代码、提交和文档的长期约束。
10. [换设备交接](./handoff.md)：当前状态、恢复命令、关键入口和已知边界。
11. [Svelte Miniapp 微信直编验收](./wechat-production-acceptance.md)：无 Taro 原生 target、自动化门禁与当前限制。
12. [微信 Fast Refresh](./wechat-fast-refresh.md)：单 watcher、串行合并重建和 build ID。
13. [微信能力报告](./wechat-capability-report.md)：32 项 capability 的稳定性和真实验证等级。
14. [微信 clean-package 验收](./wechat-package-acceptance.md)：Miniapp tarball 的外部安装、类型和直编证据。
15. [微信性能历史基线](./wechat-performance.md)：迁移前与同版本 Taro Solid 的构建对比，仅作历史参考。
16. [微信 renderer 历史验收](./wechat-renderers.md)：迁移前 WebView/Skyline 证据，不替代直编 target 复核。
17. [微信人工真机/账号验收](./wechat-manual-acceptance.md)：支付、手机号、权限和硬件的安全检查表。
18. [C# WebView2 Windows生产验收](./desktop-production-acceptance.md)：协议、CSP、安全、生产/开发smoke、portable发布件和签名边界。
19. [UI 平台重构蓝图](./ui-platform-blueprint.md)：浏览器 ZUI、SvelteKit、独立 Miniapp 微信目标和 C# WebView 多桌面 target 的目标边界、迁移阶段与 MCP 开发基线。
20. [ZUI 运行时 CSS 与组件 API 蓝图](./zui-runtime-css-components-blueprint.md)：ICSS、Theme、recipe、slot recipe、Svelte 组件 Props、目录、无障碍和生产验收。

当前插件协议：`2`。第一阶段只支持自家可信插件，不提供恶意代码沙箱。
