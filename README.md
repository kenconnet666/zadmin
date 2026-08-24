# ZAdmin

ZAdmin 是一个以 SvelteKit、TypeScript 和 pnpm workspace 为基础的全栈脚手架。静态基础能力和动态业务插件运行在同一个进程内，通过强类型 DI 容器直接调用；动态插件可以安装、禁用、升级和局部热替换。

## 工作区

```text
apps/
  admin/       管理宿主，同时装载静态能力与动态插件
  etl/         独立 ETL 应用
  docs/        组件、示例与开发文档应用
  wechat/      Svelte→Taro 微信小程序宿主与验收应用

packages/
  core/        DI 容器、插件 Runtime、Artifact、Installer
  sveltekit/   服务端动态路由与浏览器插件 Runtime
  auth/        鉴权基础能力
  postgres/    PostgreSQL 基础能力
  redis/       Redis 基础能力
  oss/         对象存储基础能力
  zui-core/    平台无关的主题、Token、ICSS 和设计契约
  zui-web/     可供任意 Web 项目使用的 Svelte 组件库
  zui-taro/    微信小程序 ZUI 组件与 ICSS 子集
  svelte-taro/ Svelte compiler、Taro renderer/runtime 和微信平台能力
  drizzle/     可供任意项目使用的 Drizzle 增强库

plugins/
  approval/    审批流插件
  crm/         CRM 插件，类型依赖 Approval
  erp/         ERP 插件，类型依赖 Approval
```

## 开发

```powershell
pnpm install
pnpm dev:admin
```

`dev:admin` 启动：

- 一个 Admin Vite开发服务器；
- 每个动态插件一个 Vite artifact watcher；
- 每个动态插件一个 TypeScript watcher，用于把上游插件类型变化立即传播给下游插件。

其他应用：

```powershell
pnpm dev:etl
pnpm dev:docs
pnpm dev:wechat
```

## 验证

```powershell
pnpm check
pnpm test
pnpm build
pnpm lint
```

动态插件构建还会自动执行：

- Manifest Protocol v2 校验；
- package name/version 校验；
- peerDependencies 与运行时 Injection范围校验；
- 跨插件 runtime import检查；
- server/client 独立 revision计算；
- 标准装饰器降级和产物加载验证。

## 文档

- [文档索引](./apps/docs/content/README.md)
- [架构与目录](./apps/docs/content/architecture.md)
- [DI 容器](./apps/docs/content/dependency-injection.md)
- [插件开发](./apps/docs/content/plugin-development.md)
- [插件生命周期](./apps/docs/content/plugin-lifecycle.md)
- [开发态热重载](./apps/docs/content/development-hmr.md)
- [ZUI ICSS 生产架构](./apps/docs/content/zui-icss.md)
- [ZUI 使用与外部接入](./apps/docs/content/zui-usage.md)
- [Svelte Taro 生产验收](./apps/docs/content/wechat-production-acceptance.md)
- [微信 Fast Refresh](./apps/docs/content/wechat-fast-refresh.md)
- [微信能力报告](./apps/docs/content/wechat-capability-report.md)
- [测试与验收](./apps/docs/content/testing.md)
- [工程倾向](./apps/docs/content/engineering-preferences.md)
- [换设备交接](./apps/docs/content/handoff.md)
