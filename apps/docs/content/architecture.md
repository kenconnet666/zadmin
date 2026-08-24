# 架构与目录

## 总体形态

ZAdmin是一个 pnpm workspace中的多应用、可复用 Package和动态 Plugin系统。SvelteKit同时承担页面、SSR和服务端入口，不拆分单独 Java后端或 HTTP微服务层。

`packages/zui-web`的样式层使用运行时 ICSS和Svelte编译优化双轨架构。公开调用只返回class字符串；可追踪的Svelte响应式叶子在编译时提升为inline CSS自定义属性，结构CSS由运行时确定性生成和缓存。完整合同见[ZUI ICSS生产架构](./zui-icss.md)。

微信小程序不是 Web renderer 的条件分支。`@zadmin/zui-core`只保存跨目标设计合同，`@zadmin/zui-web`和`@zadmin/zui-taro`拥有各自薄 Svelte模板；`@zadmin/svelte-taro`独立承担 Taro framework plugin、compiler、renderer、App/Page runtime、微信平台能力与开发态监督器所需协议。默认生产目标是WebView，Skyline单独分级。

```text
apps/
  admin/       宿主应用和插件控制面
  etl/         独立 ETL 应用，不是动态插件
  docs/        ZUI/文档/演示应用
  wechat/      Svelte→Taro 微信小程序宿主、能力实验室和验收入口

packages/
  core/        DI、Plugin Runtime、Artifact、Installer
  sveltekit/   动态服务端路由、浏览器页面 Runtime
  auth/        可选鉴权 Module
  postgres/    可选数据库 Module
  redis/       可选缓存 Module
  oss/         可选对象存储 Module
  zui-core/    平台无关的主题、Token、ICSS 和设计契约
  zui-web/     Web UI 库
  zui-taro/    Taro UI 库和严格 ICSS 子集
  svelte-taro/ Taro framework plugin、renderer/runtime/platform/module/native
  drizzle/     公共 ORM增强库

plugins/
  approval/    动态业务插件
  crm/         动态业务插件
  erp/         动态业务插件
```

## Web 与微信依赖边界

```text
                         @zadmin/zui-core
                          ▲             ▲
                          │             │
               @zadmin/zui-web   @zadmin/zui-taro

                               @zadmin/svelte-taro ──→ Taro 4.2.1

apps/admin, apps/docs ──→ zui-web
apps/wechat           ──→ zui-taro + svelte-taro
```

- `zui-core`不依赖Svelte、Taro、DOM、wx、Node或任一renderer。
- `zui-web`和`zui-taro`互不依赖；Web没有因本轮增加组件或公开API。
- `svelte-taro`不依赖ZUI。它的`platform.raw`保留完整Taro类型，managed层只包装权限、错误、资源owner和服务端安全边界。
- 微信端前后端不拆成两个项目；小程序包只包含客户端代码，登录code兑换、手机号兑换、支付签名/回调等仍由现有服务端package/plugin负责。
- 微信业务module在构建时静态合入小程序。开发时可以监听外部package realpath，生产安装/升级后必须重新构建、审核和发布，不能从网络加载可执行JavaScript。

## Svelte Taro编译与运行时

```text
.svelte
  → 固定 Svelte 5.56.10 custom-renderer compiler
  → Taro native element marker + external CSS
  → @zadmin/svelte-taro/renderer
  → Taro document/TaroNode
  → base.wxml + WXSS + page JS
```

- Taro Node plugin是CJS；其余公开运行时是ESM。
- Taro CLI封闭的framework类型由`defineSvelteConfig()`接收`svelte`，运行时适配为Taro官方`none`以跳过内置React/Vue/Solid plugin，再显式加载本framework plugin。
- 原生标签经marker和`onParseCreateElement`进入Taro模板；未知浏览器标签在编译期拒绝。
- App/Page各有`ResourceScope`；Page卸载自动释放listener、session、connection和context。
- 固定Svelte runtime在package build时生成一个tree-shakeable dev/prod ESM。Taro产物仍只有一个Svelte runtime，生产图由246–247个transform module降到141–142个。
- 第一阶段Fast Refresh是增量重建+开发者工具reload，不承诺保留组件局部状态的HMR。

完整生产边界见[Svelte Taro生产验收](./wechat-production-acceptance.md)。

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
