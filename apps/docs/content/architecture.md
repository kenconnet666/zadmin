# 工作区与架构

## 总体模型

ZAdmin 是 SvelteKit、TypeScript 和 pnpm workspace 项目，明确分为三层：

```text
Apps     独立产品和启动入口
Packages 静态安装、可直接依赖的基础能力
Plugins  可动态安装和热重载的粗粒度业务扩展
```

服务端 Package 和 Plugin 之间使用同进程依赖注入与普通 JavaScript 对象调用，不使用内部 HTTP、RPC 或微服务发现。

## 目录

```text
apps/
  admin/        管理产品、静态能力组合和主要插件宿主
  etl/          独立 ETL应用
  docs/         文档、Storybook和开发演示

packages/
  core/         DI、Runtime、Manifest、Artifact Provider和Installer
  sveltekit/    动态路由、客户端插件运行时和页面出口
  auth/         静态鉴权骨架
  postgres/     静态 PostgreSQL骨架
  redis/        静态 Redis骨架
  oss/          静态对象存储骨架
  zui/          通用 Svelte组件库
  drizzle/      通用 Drizzle增强库

plugins/
  approval/     审批流插件骨架
  erp/          ERP插件骨架
  crm/          CRM插件骨架
```

ETL 和 Docs 是 App；Auth、SvelteKit、PostgreSQL、Redis、OSS 是 Package；Approval、ERP、CRM 是 Plugin。

## 依赖方向

```text
apps → packages
apps → Plugin Runtime → plugins
plugins → packages公开入口

packages ─X→ plugins
packages ─X→ apps
plugins ─X→ apps内部源码
apps ─X→ 其他apps内部源码
```

Admin 和 ETL 需要共享的实现必须提取到 Package。

## 静态 Host 能力

Admin 使用普通工厂创建基础能力：

```ts
const web = createSvelteKitHost();
const database = createPostgres();
const cache = createRedis();
const storage = createOss();
const auth = createAuth({ database, cache, web });
```

然后把对象提供给 Plugin Runtime：

```ts
runtime.provide({ id: '@zadmin/postgres', version: '0.0.0', value: database });
```

静态能力不支持生产态动态卸载；Package 变化需要重启 App，开发态由 Vite 自动重建 Host。

## 动态依赖注入

插件不导入 Provider 实例。调用方在自己的 package 中声明需要的最小结构：

```ts
interface Approval {
	start(subjectId: string): { id: string; status: string };
}
```

通过稳定字符串 ID 声明依赖：

```ts
dependencies: {
	approval: injectOptional<Approval>('@zadmin/approval');
}
```

Runtime 只用 ID 查找当前 active 值。Provider 是静态 Package 还是动态 Plugin，对 Consumer 没有区别。

必需依赖缺失时 Plugin 进入 `waiting`；可选依赖缺失时注入 `undefined`。Provider 新增、删除或替换时，dependents 会重新执行 `setup()` 并取得新对象。

## 服务端插件

每个插件是一个预构建 ESM Artifact，默认导出 `PluginDefinition`。`setup()` 返回值成为该 Plugin ID 的 Provider。

动态路由由 `@zadmin/sveltekit` 注册，并归属 `PluginScope`。插件停止、失败、禁用或升级时，路由随 Effect 自动撤销。

当前动态接口：

```text
/approval/api/status
/erp/api/status
/crm/api/status
```

## 客户端插件

Client Artifact 导出：

```ts
activate(context: ClientPluginContext): PluginDisposer
```

插件向 `ClientPageStore` 注册 mount/unmount 函数。客户端 Bundle 第一阶段自包含 Svelte Runtime，Host 不跨 Bundle 传递 Svelte Component对象。

当前动态页面：

```text
/approval
/erp
/crm
```

Auth 是静态 Package，但其 `/auth` 页面注册到同一个 ClientPageStore。

## Artifact 来源

Core 有两个实现相同接口的来源：

```text
WorkspacePluginArtifactProvider
  开发态扫描 plugins/*/dist

InstalledPluginArtifactProvider
  生产态读取 ZADMIN_DATA_DIR 下 installed.json和版本目录
```

二者都输出 `PluginArtifact`，后续 Manifest 校验、SemVer 检查、动态 import、Runtime reconcile 和 Client reload 共用同一路径。

## 安装状态

生产数据不写仓库。默认使用系统应用数据目录，也可用绝对路径环境变量 `ZADMIN_DATA_DIR` 覆盖。

```text
<data>/apps/admin/plugins/
  installed.json
  staging/
  packages/
    %40zadmin%2Fapproval/
      0.0.0/
```

安装新版本不覆盖旧目录；`activate(id, version)` 可以切回旧版本。Uninstall 删除安装状态但保留版本文件和业务数据，便于恢复。

## 信任边界

当前只接受 `requiredTrust: "trusted"`。插件在 Admin 进程权限下运行，尚无恶意代码沙箱。Manifest 声明其他信任级别会被拒绝。

Admin 生产 mutation API 要求 `ZADMIN_PLUGIN_ADMIN_TOKEN` Bearer token；未配置时返回 503。真正的 Auth 管理员权限接入属于后续业务阶段。

## 当前业务边界

插件系统、Artifact、Installer 和开发 HMR 已实现；PostgreSQL、Redis、OSS、Auth、ETL、Approval、ERP、CRM 仍然只是最小骨架，不应描述为业务可用。
