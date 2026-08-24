# 架构与目录

## 总体形态

ZAdmin是一个 pnpm workspace中的多应用、可复用 Package和动态 Plugin系统。SvelteKit同时承担页面、SSR和服务端入口，不拆分单独 Java后端或 HTTP微服务层。

`packages/zui-web`的样式层使用运行时 ICSS和Svelte编译优化双轨架构。公开调用只返回class字符串；可追踪的Svelte响应式叶子在编译时提升为inline CSS自定义属性，结构CSS由运行时确定性生成和缓存。完整合同见[ZUI ICSS生产架构](./zui-icss.md)。

```text
apps/
  admin/       宿主应用和插件控制面
  etl/         独立 ETL 应用，不是动态插件
  docs/        ZUI/文档/演示应用

packages/
  core/        DI、Plugin Runtime、Artifact、Installer
  sveltekit/   动态服务端路由、浏览器页面 Runtime
  auth/        可选鉴权 Module
  postgres/    可选数据库 Module
  redis/       可选缓存 Module
  oss/         可选对象存储 Module
  zui-core/    平台无关的主题、Token、ICSS 和设计契约
  zui-web/     Web UI 库
  drizzle/     公共 ORM增强库

plugins/
  approval/    动态业务插件
  crm/         动态业务插件
  erp/         动态业务插件
```

## Provider、Module与Plugin

所有可注入能力都是 Provider，但不是所有 Module都是动态 Plugin。

```text
ServiceContainer
  ├─ Host ServiceModule generation
  │    ├─ @zadmin/sveltekit
  │    ├─ @zadmin/postgres
  │    ├─ @zadmin/redis
  │    ├─ @zadmin/oss
  │    └─ @zadmin/auth
  └─ Dynamic Plugin generation
       ├─ @zadmin/approval
       ├─ @zadmin/crm
       └─ @zadmin/erp
```

- Host Module随 Admin Host启动和关闭；修改静态 Package后完整重建 Host。
- Dynamic Plugin来自 workspace或已安装 artifact，可以独立安装、禁用和升级。
- Host Module和Plugin使用同一个 Provider图、同一个 Scope语义和同一个异步释放机制。
- Artifact扫描、版本兼容和客户端入口只属于 Plugin控制面。

## 公开与私有能力

每个动态 Plugin必须有一个 primary Provider，ID与 Plugin ID完全一致：

```text
Plugin:          @zadmin/crm
Primary Service: @zadmin/crm
Internal Bean:   @zadmin/crm/customer-index
```

- 跨插件默认只能注入 primary Provider。
- 插件内部 Provider必须位于 `plugin-id/`命名空间，且默认私有。
- Host Module只有显式列入 `exports`的 Provider才能被其他 Module注入。
- Host Module不能依赖动态 Plugin；动态 Plugin可以依赖 Host Module或其他 Plugin。
- Dynamic Plugin之间允许 Module层面互相出现依赖，只要实际 Provider/Bean图仍是有向无环图。这支持“不同 Bean分别调用、并没有构造循环”的场景。

## 插件 package就是类型来源

不拆分独立 API package。上游插件导出：

```ts
export const approvalPlugin = definePlugin({ ... });
export type ApprovalPlugin = typeof approvalPlugin;
export type { ApprovalApi, ApprovalRecord } from './contract.ts';
```

下游插件：

```ts
import type { ApprovalPlugin } from '@zadmin/approval';

const dependencies = {
	approval: injectOptionalPlugin<ApprovalPlugin>('@zadmin/approval')
};
```

`import type`在产物中消失；运行时只保留字符串 ID和 DI查找。Vite构建策略会 externalize Manifest中的 runtime dependency，一旦发现实际 JavaScript import就直接构建失败。

## 服务端与浏览器隔离

服务端 Container可以持有数据库、Redis、OSS、鉴权、路由和后台任务。浏览器端只有：

- 页面 contribution；
- mount/unmount disposer；
- client artifact revision；
  -批量替换和失败回滚。

浏览器端不是服务端 Container的 child scope，不能解析数据库或凭据。两端只共享：

- Plugin ID；
- Manifest；
- public TypeScript类型；
  -分别计算的 server/client revision。

## Artifact与安装

Plugin build输出：

```text
dist/
  server/index.js
  client/index.js
  types/*.d.ts
  zadmin.plugin.json
```

Artifact具有三个内容身份：

- `revision`：完整 artifact，用于同版本不可变安装检查；
- `serverRevision`：忽略 client和types，只决定服务端 generation；
- `clientRevision`：忽略 server和types，只决定浏览器插件更新。

因此：

- 只改 server：重建该 Plugin及其服务端 dependents，浏览器不重载；
- 只改 client：浏览器局部替换，服务端 generation保持原对象；
- 只改公开类型：TypeScript watcher检查下游，不制造运行时 revision。

## 信任边界

Protocol v2当前只接受 `requiredTrust: "trusted"`。动态 import的是同进程 JavaScript，拥有 Host进程权限。所谓卸载是：

-撤销 Provider Registry；
-撤销路由和页面；
-停止任务和订阅；
-触发 AbortSignal；
-释放 Scope资源。

Node.js ESM Module Record不能真正从进程缓存中删除。恶意代码沙箱、进程隔离和权限模型不在当前实现范围内。
