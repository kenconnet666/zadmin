# ZAdmin 文档

这里记录当前仓库已经实现和验证的行为。代码、测试和文档必须在同一个提交阶段保持一致；本文档不保存已经放弃的设计草图。

1. [架构与目录](./architecture.md)：工作区边界、静态 Module、动态 Plugin 和服务端/浏览器隔离。
2. [DI 容器](./dependency-injection.md)：Token、Provider、Module、Generation、生命周期、回滚和装饰器。
3. [插件开发](./plugin-development.md)：同仓库或外部仓库开发、类型依赖、Manifest、构建和打包。
4. [插件生命周期](./plugin-lifecycle.md)：安装、等待、激活、升级、禁用、泄漏和关闭。
5. [开发态热重载](./development-hmr.md)：服务端、客户端和上游类型的三条独立更新链。
6. [测试与验收](./testing.md)：自动化命令、覆盖矩阵和真实浏览器 HMR步骤。
7. [工程倾向](./engineering-preferences.md)：目录、依赖、代码、提交和文档的长期约束。
8. [换设备交接](./handoff.md)：当前状态、恢复命令、关键入口和已知边界。

当前插件协议：`2`。第一阶段只支持自家可信插件，不提供恶意代码沙箱。
