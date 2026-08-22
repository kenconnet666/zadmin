# 下一阶段实现蓝图

本文是 ZAdmin 本轮重构的实现蓝图，记录于 **2026-08-22**。蓝图中的目录分类、依赖注入、Workspace HMR和本地安装制品已经实施并通过验收；当前行为以[工作区与架构](./architecture.md)、[插件生命周期](./plugin-lifecycle.md)和[开发态热重载](./development-hmr.md)为准。本文继续保留为决策范围、阶段提交和完成标准记录。

实现过程中如果需要改变本文的固定决策，应先更新本文并单独说明理由，再修改代码，避免代码与架构同时漂移。

## 本轮目标

本轮只建立可持续演进的目录、包入口和最小运行骨架，不展开 Auth、ETL、Approval、ERP、CRM 等业务实现。

唯一需要尽量做完整的是：

1. 动态插件依赖注入；
2. 插件生命周期和依赖图；
3. 插件制品发现、加载、安装、卸载和升级骨架；
4. 开发态自动监听和插件作用域热重载；
5. 服务端路由和客户端页面随插件重载正确撤销、恢复；
6. 热重载失败时保留或恢复上一个可用 revision；
7. 与插件系统风险相称的自动化测试和真实开发服务器验收。

其他模块只保留最少的公开类型、工厂函数、页面或状态接口，用于证明依赖方向和构建链成立。

## 固定架构决策

### 三类工作区

```text
Apps     = 独立产品和启动入口
Packages = 静态安装的 TypeScript/Svelte基础能力
Plugins  = 可动态安装的粗粒度业务扩展
```

明确分类如下：

| 类型     | 成员                                                        |
| -------- | ----------------------------------------------------------- |
| Apps     | Admin、ETL、Docs                                            |
| Packages | Core、SvelteKit、Auth、PostgreSQL、Redis、OSS、ZUI、Drizzle |
| Plugins  | Approval、ERP、CRM                                          |

ETL 和 Docs 不是插件；Auth、PostgreSQL、Redis、OSS 和 SvelteKit 也不是插件。

### 单一调用模型

所有跨 Package、跨 Plugin 的运行时能力都通过同一个依赖注入容器取得。容器返回普通 JavaScript 值，取得后如何调用完全由调用方声明的 TypeScript 类型和实际实现决定。

Core 不区分 Service、Plugin API、Event Bus、Registry、Repository、Command 或 Contribution。它们从容器视角都是：

```text
稳定字符串 ID → 当前 active值
```

不使用内部 HTTP、RPC、Proxy协议或微服务发现。

### 调用方拥有所需类型

调用方在自己的 package 内声明所需的最小结构：

```ts
interface Approval {
	start(request: { type: 'erp.purchase'; subjectId: string; requesterId: string }): Promise<{
		id: string;
		status: string;
	}>;
}
```

然后通过稳定 ID 注入：

```ts
dependencies: {
	approval: injectOptional<Approval>('@zadmin/approval');
}
```

第一阶段不实现全局 `CapabilityMap`、module augmentation或自动类型生成。Provider 可以导出公开类型，但 Consumer 不必依赖它。

### 静态能力与动态插件的重载边界

```text
Apps或 Packages变化
  生产：重新部署并重启 App
  开发：Vite HMR或自动重建 Host，不要求保持 Runtime实例

Plugins变化
  生产：安装新 revision并执行插件作用域热升级
  开发：监听源码构建结果并执行同一插件作用域热重载
```

开发者不需要手工重启，但必须保留两种不同的生命周期语义。

### 第一阶段信任边界

只支持自家可信插件。Manifest 预留 `requiredTrust`，第一阶段只接受 `trusted`。任何未实现的信任级别必须被拒绝，不能静默降级。

不实现恶意代码沙箱、Worker隔离或子进程隔离。

## 目标目录

```text
apps/
  admin/        管理产品和主要插件宿主
  etl/          独立 ETL产品
  docs/         文档、Storybook和插件开发演示

packages/
  core/         DI、Runtime、Artifact、Installer和开发监听
  sveltekit/    SvelteKit宿主、动态路由和客户端插件运行时
  auth/         静态鉴权能力
  postgres/     静态 PostgreSQL能力
  redis/        静态 Redis能力
  oss/          静态对象存储能力
  zui/          通用 Svelte组件库
  drizzle/      通用 Drizzle增强库

plugins/
  approval/     动态审批流插件
  erp/          动态 ERP插件
  crm/          动态 CRM插件
```

目标 package名称：

| 目录                 | Package             |
| -------------------- | ------------------- |
| `apps/admin`         | `@zadmin/admin`     |
| `apps/etl`           | `@zadmin/etl-app`   |
| `apps/docs`          | `@zadmin/docs`      |
| `packages/core`      | `@zadmin/core`      |
| `packages/sveltekit` | `@zadmin/sveltekit` |
| `packages/auth`      | `@zadmin/auth`      |
| `packages/postgres`  | `@zadmin/postgres`  |
| `packages/redis`     | `@zadmin/redis`     |
| `packages/oss`       | `@zadmin/oss`       |
| `packages/zui`       | `@zadmin/zui`       |
| `packages/drizzle`   | `@zadmin/drizzle`   |
| `plugins/approval`   | `@zadmin/approval`  |
| `plugins/erp`        | `@zadmin/erp`       |
| `plugins/crm`        | `@zadmin/crm`       |

Plugin ID 与 package名称相同，不维护第二套标识。

## 依赖方向

```text
apps → packages
apps → Plugin Runtime → plugins
plugins → packages的公开入口
plugins → 其他plugins的公开类型（可选）

packages ─X→ plugins
packages ─X→ apps
plugins ─X→ apps内部路径
apps ─X→ 其他apps内部路径
```

如果 Admin 和 ETL 需要共享实现，应提取到 Package，不能互相导入源码。

建议的初始依赖：

| 消费者   | 静态依赖或运行时要求                                                      |
| -------- | ------------------------------------------------------------------------- |
| Admin    | Core、SvelteKit、Auth、PostgreSQL、Redis、OSS、ZUI、Drizzle               |
| ETL      | Core、SvelteKit、Auth、PostgreSQL、Redis、OSS、ZUI、Drizzle               |
| Docs     | Core、SvelteKit、ZUI、Drizzle和开发测试工具                               |
| Approval | Core、SvelteKit、Auth、PostgreSQL、ZUI；Redis和OSS可选                    |
| ERP      | Core、SvelteKit、Auth、PostgreSQL、ZUI、Drizzle；Approval、Redis和OSS可选 |
| CRM      | Core、SvelteKit、Auth、PostgreSQL、ZUI、Drizzle；Approval、Redis和OSS可选 |

ERP 和 CRM 第一阶段互不依赖，均可在没有 Approval 时启动。

## Core 最小公开模型

### Injection

```ts
declare const injectionType: unique symbol;

export interface Injection<T, Optional extends boolean = false> {
	readonly id: string;
	readonly optional: Optional;
	readonly [injectionType]?: () => T;
}

export function inject<T>(id: string): Injection<T, false>;

export function injectOptional<T>(id: string): Injection<T, true>;

export type ResolveInjection<TInjection> =
	TInjection extends Injection<infer Value, infer Optional>
		? Optional extends true
			? Value | undefined
			: Value
		: never;

export type ResolveInjections<Dependencies extends Record<string, Injection<unknown, boolean>>> = {
	readonly [Key in keyof Dependencies]: ResolveInjection<Dependencies[Key]>;
};
```

Injection 在运行时只包含 ID 和 optional 状态；`injectionType` 是不写入实际对象的 phantom成员，只服务于 TypeScript 推断并保持 `T` 的类型身份。

### Plugin Definition

```ts
export function definePlugin<
	const Id extends string,
	const Dependencies extends Record<string, Injection<unknown, boolean>> = Record<never, never>,
	Api = void
>(definition: {
	readonly id: Id;
	readonly dependencies?: Dependencies;
	readonly setup?: (
		context: PluginContext,
		dependencies: ResolveInjections<Dependencies>
	) => MaybePromise<Api>;
}): PluginDefinition<Id, Api, Dependencies>;
```

`setup()` 返回值自动成为该 Plugin ID 的当前能力值。若插件不公开能力，可以返回 `undefined`，但它仍拥有自己的生命周期、路由和页面贡献。

### Host Provider

Apps 静态创建的能力通过相同容器提供：

```ts
runtime.provide({
	id: '@zadmin/postgres',
	version: '0.1.0',
	value: database
});
```

插件消费时不区分 Provider 来自 Host Package 还是动态 Plugin。

### Runtime 查找规则

Runtime 只通过稳定字符串 ID 查找 Provider，不使用：

- `PluginDefinition` 对象身份；
- Class构造器身份；
- `Symbol()` 身份；
- package模块实例身份。

同一 ID 在一个 Runtime 中只能有一个 active Provider。重复 Provider 必须失败并指出双方所有者。

## 生命周期和依赖图

保留当前已经验证的状态和 Effect 语义：

```text
registered
waiting
starting
active
stopping
stopped
failed
```

保留：

- `AbortSignal`；
- `context.effect()`；
- `context.onDispose()`；
- 后进先出异步清理；
- 串行化 Runtime 操作；
- 依赖拓扑启动；
- 反向拓扑停止；
- 生命周期事件；
- revision 和诊断快照。

依赖图由 `Injection.id` 构造：

```text
Consumer Plugin
  → Injection ID
  → Provider Record
  → Provider owner
```

必需依赖缺失时插件不能进入 active，并给出明确诊断。可选依赖缺失时注入 `undefined`。

Provider 新增、删除或更换 revision 时，所有依赖它的插件都必须重新执行 `setup()`，以免长期持有旧对象引用。

必需依赖环必须拒绝。业务上的双向回调不能形成双向启动依赖；可由单向 Provider 暴露注册函数解决。

## Apps 最小骨架

### Admin

Admin 是第一阶段唯一实现完整插件安装管理的 App。

最小文件职责：

```text
apps/admin/src/lib/server/host.ts
  初始化静态 Packages和 Plugin Runtime

apps/admin/src/lib/server/plugins.ts
  连接 Artifact Provider与 Runtime

apps/admin/src/hooks.server.ts
  分派动态服务端插件路由

apps/admin/src/routes/plugins/+page.svelte
  最小插件状态页

apps/admin/src/routes/[...pluginPath]/+page.svelte
  渲染动态客户端插件页面
```

本轮不实现完整用户、角色、系统设置和精美插件管理界面。插件页只需显示：

- ID；
- version；
- revision；
- enabled；
- lifecycle state；
- error；
- reload/enable/disable最小操作（在对应后端能力完成后）。

### ETL

ETL 是独立 App。原 `plugins/etl` 的页面和状态能力已经迁入 `apps/etl`，`plugins/etl` 已删除。

最小目标：

```text
GET /             ETL骨架页面
GET /api/status   ETL应用状态
```

本轮不实现数据源、调度、执行器和持久化。

### Docs

Docs 保留当前 SvelteKit和 Storybook。只新增目标架构、Plugin SDK、制品和 HMR文档，不重写整个站点或组件示例。

## Packages 最小骨架

Packages 只提供足够证明分类和依赖方向的类型与工厂，不接真实基础设施。

### PostgreSQL

```ts
export interface PostgresOptions {}
export interface PostgresService {}
export function createPostgres(options: PostgresOptions): Promise<PostgresService>;
```

第一阶段不连接真实数据库，不实现迁移和事务。

### Redis

```ts
export interface RedisOptions {}
export interface RedisService {}
export function createRedis(options: RedisOptions): Promise<RedisService>;
```

第一阶段不连接真实 Redis。

### OSS

```ts
export interface OssOptions {}
export interface OssService {}
export function createOss(options: OssOptions): OssService;
```

第一阶段不连接真实 S3/OSS。

### Auth

提供最小 `AuthService` 和静态页面骨架，只证明 Admin/ETL 可以静态初始化并向 Plugin Runtime提供 `@zadmin/auth`。

第一阶段不实现真实用户、会话、角色和权限持久化。

### SvelteKit

这是除 Core 外唯一需要重点完善的 Package，因为它承载插件路由、客户端页面和 HMR链路。

## Plugin 源码模板

三个插件使用同一结构：

```text
plugins/<name>/
  src/
    server/
      index.ts
    client/
      index.ts
      <Name>Page.svelte
    shared/
      types.ts             仅在实际共享时创建
  tests/
    lifecycle.spec.ts
  zadmin.plugin.json
  package.json
  svelte.config.js
  tsconfig.json
  vite.config.ts
```

不要预建空的 service、repository、migration、components 等目录。出现第一个真实文件时再创建。

三个插件的最小可观察行为：

| Plugin   | 页面        | 服务端接口             |
| -------- | ----------- | ---------------------- |
| Approval | `/approval` | `/approval/api/status` |
| ERP      | `/erp`      | `/erp/api/status`      |
| CRM      | `/crm`      | `/crm/api/status`      |

ERP 和 CRM 使用本地声明的可选 Approval 类型，只实现一个测试调用，不实现实际业务。

## Plugin Manifest

每个插件根目录使用 `zadmin.plugin.json`，不把运行时协议混进 `package.json`。

最小格式：

```json
{
	"protocol": 1,
	"id": "@zadmin/approval",
	"version": "0.1.0",
	"displayName": "Approval",
	"requiredTrust": "trusted",
	"entries": {
		"server": "./server/index.js",
		"client": "./client/index.js"
	},
	"requiresHost": {
		"@zadmin/core": "^0.1.0",
		"@zadmin/sveltekit": "^0.1.0"
	},
	"requires": {
		"@zadmin/auth": "^0.1.0",
		"@zadmin/postgres": "^0.1.0"
	},
	"optional": {}
}
```

字段职责：

| 字段             | 说明                                       |
| ---------------- | ------------------------------------------ |
| `protocol`       | Manifest协议版本                           |
| `id`             | Plugin ID，必须等于 package name和定义 ID  |
| `version`        | Plugin版本                                 |
| `requiredTrust`  | 所需执行信任级别；第一阶段只允许 `trusted` |
| `entries.server` | 制品内服务端 ESM入口                       |
| `entries.client` | 制品内客户端 ESM入口，可省略               |
| `requiresHost`   | Host协议和静态 Package兼容范围             |
| `requires`       | 必需注入能力版本范围                       |
| `optional`       | 可选注入能力版本范围                       |

源码仓库中的 `package.json` 与 `zadmin.plugin.json` 必须使用相同的 package name和 version；构建器读取两者并拒绝不一致。上面的 `0.1.0` 是目标插件协议的示例版本，实际实现时必须使用当前 package version，不能靠复制粘贴维持两处元数据。

构建时应交叉检查代码 Injection 与 Manifest：代码使用而 Manifest 未声明是错误；Manifest 声明但代码未使用至少产生明确诊断。

## Plugin Artifact

生产安装制品使用 `.zplugin` 扩展名，本质是预构建压缩归档：

```text
approval-0.1.0.zplugin
  zadmin.plugin.json
  server/
    index.js
    index.js.map
  client/
    index.js
    index.js.map
  assets/
```

第一阶段不在生产 Host 中执行插件的 `prepare`、`postinstall` 或构建脚本。插件必须预构建。

解包至少拒绝：

- 绝对路径；
- `..` 路径穿越；
- 符号链接；
- 重复文件；
- 超出配置上限的文件数或总大小；
- Manifest 与入口不一致；
- 不支持的协议或信任级别。

运行时插件目录位于明确的数据目录，不写仓库：

```text
<zadmin-data>/apps/admin/plugins/
  installed.json
  staging/
  packages/
    @zadmin/
      approval/
        0.1.0/
      erp/
        0.1.0/
      crm/
        0.1.0/
```

默认位置和 `ZADMIN_DATA_DIR` 覆盖规则在实现 Installer 时确定，不使用隐式工作目录保存生产数据。

## Server Plugin 加载

服务端制品是预构建 ESM。每个 revision 使用唯一 URL加载：

```text
file:///.../server/index.js?revision=<content-hash>
```

Revision 使用内容哈希，不只依赖时间戳。加载后的模块必须导出一个合法 Plugin Definition，其 ID 必须与 Manifest一致。

Node.js 不能真正从 ESM缓存移除已经加载的模块。第一阶段“卸载”定义为：

- 插件 Scope 完整 dispose；
- 所有路由、页面和注册项撤销；
- API 从容器移除；
- dependents重新注入；
- 新 revision使用新 URL加载。

多次升级后的旧模块记录可能保留到进程重启，属于可信插件阶段的已知边界。

## Client Plugin 加载

第一阶段优先保证独立安装和可靠卸载，不实现共享 Svelte Runtime或 Module Federation。

Client Artifact 是自包含 ESM，导出：

```ts
export function activate(context: ClientPluginContext): MaybePromise<PluginDisposer>;
```

页面贡献不直接跨 Bundle传递 Svelte Component类型，而是传递 mount/unmount函数：

```ts
context.pages.register({
	path: '/approval',
	mount(target) {
		const component = mount(ApprovalPage, { target });
		return () => unmount(component);
	}
});
```

这样插件可以自包含其 Svelte运行代码，Host 只管理 DOM挂载点和 disposer。代价是每个插件可能重复携带 Svelte/ZUI，第一阶段接受该代价；没有测量证据前不实现共享模块系统。

客户端升级顺序：

```text
预加载新 Client Artifact
  → 调用旧 disposer
  → 移除旧页面、导航和样式
  → activate新 revision
  → 当前路由重新匹配并挂载
```

当前页面局部状态可以在插件 revision重载后重置；不要求 React/Svelte组件级状态保持。

## Artifact Provider

Runtime 不直接依赖文件布局，而是消费统一 Artifact：

```ts
export interface PluginArtifact {
	readonly id: string;
	readonly version: string;
	readonly revision: string;
	readonly manifest: PluginManifest;
	readonly serverEntry: URL;
	readonly clientEntry?: URL;
}
```

两个 Provider：

```text
WorkspacePluginArtifactProvider
  开发态扫描仓库 plugins/*和显式加入的外部目录

InstalledPluginArtifactProvider
  生产态读取安装目录和 installed.json
```

两者产生相同的 revision事件，后续 Runtime reload路径必须共用。

## 开发态热重载要求

开发体验是本轮重点，不以“编译通过”代替真实 HMR验收。

### Apps 和 Packages

- `.svelte` 页面与 ZUI组件优先使用标准 Svelte/Vite HMR；
- Core、PostgreSQL、Redis、OSS、Auth、SvelteKit服务端能力变化时，允许自动重建 Host；
- 自动重建必须先 dispose旧 Host资源；
- 开发者不需要手工停止和重新运行命令。

### Plugins

插件开发 watcher 监听源码，增量生成 server/client artifact。只有成功完成且内容哈希变化的构建才发布新 revision。

热重载协调器必须：

1. 串行处理同一 Runtime 的 reload；
2. 合并短时间连续文件变化，只激活最新完整 revision；
3. 新 revision加载或 setup失败时恢复旧 revision；
4. 反向拓扑停止 dependents；
5. 完整 dispose旧 Scope；
6. 正向拓扑启动 Provider和 dependents；
7. 通知浏览器更新对应 Client Plugin；
8. 保持无关插件 active且 revision不变；
9. 将构建错误、激活错误和回滚状态暴露在诊断快照中。

### 插件集合变化

开发态新增 `plugins/*` 目录时自动发现并加载；删除或禁用目录时自动 dispose并撤销贡献。外部仓库通过后续 CLI：

```text
zadmin plugin dev add <absolute-path>
zadmin plugin dev remove <plugin-id>
```

注册路径保存在用户数据目录，不写仓库根目录。

### 浏览器更新

SvelteKit Host 通过 SSE或等价的单向开发事件通道发送：

```text
plugin-added
plugin-rebuilt
plugin-removed
plugin-failed
```

浏览器只重载受影响 Client Plugin，不全页刷新。加载失败时显示插件级错误，不使整个 Admin Shell失效。

## 生产安装与升级骨架

生产安装使用事务式阶段：

```text
上传 .zplugin
  → 写入 staging
  → 安全解包
  → 校验 Manifest和兼容性
  → 构造候选 Artifact
  → 预加载候选
  → 停止 dependents和旧 Plugin
  → 激活候选
  → 重启 dependents
  → 切换 installed.json
  → 通知 Client Runtime
```

失败时：

```text
dispose候选
  → 恢复旧 Provider
  → 重启旧 dependents
  → 不提交 installed.json新状态
```

本轮只需实现足以验证本地 `.zplugin` 安装、启用、禁用、升级和回滚的后端骨架。上传 UI保持最小，不实现插件市场。

卸载默认保留插件业务数据。删除数据属于未来显式 `purge` 能力，本轮不做。

## 三个 Plugin 的最小范围

### Approval

只实现：

- `/approval` 骨架页面；
- `/approval/api/status`；
- `setup()` 返回一个最小 `start()` 测试 API；
- lifecycle、route、client page和 reload测试。

不实现真实审批定义、实例、节点、待办和迁移。

### ERP

只实现：

- `/erp` 骨架页面；
- `/erp/api/status`；
- 本地声明可选 Approval接口；
- Approval存在时做一次可验证调用，不存在时正常启动。

不实现采购、销售、库存和财务。

### CRM

只实现：

- `/crm` 骨架页面；
- `/crm/api/status`；
- 本地声明可选 Approval接口；
- Approval存在时做一次可验证调用，不存在时正常启动。

不实现客户、线索、商机和跟进。

## 当前仓库迁移表

### 移动到 Packages

```text
plugins/auth       → packages/auth
plugins/postgres   → packages/postgres
plugins/redis      → packages/redis
plugins/oss        → packages/oss
plugins/sveltekit  → packages/sveltekit
```

移动时先保持现有 package name和行为，避免目录移动与 API重构混为一个提交。

### ETL 合并

```text
plugins/etl/src/lib/EtlPage.svelte
  → apps/etl的原生 SvelteKit页面

plugins/etl的状态接口
  → apps/etl/src/routes/api/status/+server.ts

删除 plugins/etl
删除 apps/etl对 @zadmin/etl的依赖
删除 apps/etl的 PluginPageOutlet和动态 ETL组合
```

### 新增 Plugins

```text
plugins/approval
plugins/erp
plugins/crm
```

只创建实际需要的最小文件，不提前创建空目录树。

## 阶段性 Git 提交

### 1. 重新分类静态能力

```text
refactor: classify host capabilities as packages
```

- Git move五个基础能力目录；
- 修复 workspace路径和文档；
- 保持现有运行行为；
- check、test、build通过。

### 2. ETL 成为独立 App

```text
refactor: make etl a standalone application
```

- 合并并删除 `plugins/etl`；
- 使用原生 SvelteKit页面和状态接口；
- 移除动态 ETL路由；
- check、test、build通过。

### 3. 依赖按注入 ID解析

```text
refactor: resolve plugin dependencies by injection id
```

- 实现 `Injection<T>`、`inject()`、`injectOptional()`；
- Runtime依赖图从 definition对象改为字符串 ID；
- 增加 Host Provider；
- 保留并扩展生命周期测试。

### 4. 静态 Packages 正常化

```text
refactor: initialize host capabilities as typed packages
```

- 最小 `createPostgres()`、`createRedis()`、`createOss()`、`createAuth()` 和 SvelteKit Host；
- Apps静态初始化；
- 通过 Runtime Host Provider暴露能力；
- 不实现真实基础设施。

### 5. 建立三个 Plugin 骨架

```text
feat: establish approval erp and crm plugins
```

- Manifest；
- 服务端状态接口；
- 客户端页面；
- ERP/CRM可选 Approval注入；
- 最小生命周期测试。

### 6. Workspace Artifact 和开发 HMR

```text
feat: load workspace plugin revisions
```

- Workspace Provider；
- server/client构建监听；
- revision和 reload队列；
- 服务端和浏览器插件级热重载；
- 失败回滚；
- 真实 dev server验收。

### 7. 安装制品骨架

```text
feat: manage installed plugin artifacts
```

- `.zplugin`；
- staging和安全解包；
- installed状态；
- enable、disable、install、upgrade、uninstall；
- 失败回滚。

### 8. 管理页面、测试和文档收尾

```text
feat: add plugin management diagnostics
```

- 最小 Admin插件状态页；
- 安装和操作入口；
- Playwright验收；
- 更新当前架构、开发、HMR、测试和交接文档。

每个提交都必须保持工作区可安装、可检查和可构建。不要把所有阶段压成一个无法定位回归的大提交。

## 验收矩阵

### 静态结构

- 最终目录与本文一致；
- `plugins/etl` 不存在；
- 五个基础能力位于 `packages/`；
- Approval、ERP、CRM 位于 `plugins/`；
- Packages 不依赖 Plugins或 Apps；
- Apps 不互相导入内部源码。

### DI 和生命周期

- required Injection 缺失时不能 active；
- optional Injection 缺失时注入 `undefined`；
- 重复 Provider被拒绝；
- 必需依赖环被拒绝；
- Plugin `setup()` 返回值可被 Consumer直接调用；
- Provider重载时 dependents获得新对象；
- Effect按后进先出清理；
- setup和 dispose失败都有明确状态。

### 开发 HMR

- 修改 Approval服务端响应，不重启 Admin进程即可看到新响应；
- 只重载 Approval及其 dependents；
- 修改 Approval页面，已打开浏览器自动更新；
- 修改 ERP/CRM后 Approval不重载；
- 禁用 Approval后 ERP/CRM继续 active并获得 `undefined`；
- 重新启用 Approval后 ERP/CRM重新 setup并获得新对象；
- 连续快速保存只激活最终完整 revision；
- 语法错误不卸载当前可用 revision；
- 新 revision setup失败时恢复旧 revision；
- 删除开发插件目录后路由和页面撤销。

### 生产 Artifact

- 安装本地 `.zplugin` 后无需重启 Admin即可出现页面和接口；
- disable后页面和接口撤销；
- enable后恢复；
- 升级后 version和 revision变化；
- 非兼容 Host版本被拒绝；
- 路径穿越归档被拒绝；
- 失败升级不改变 active版本。

### 全量质量

```text
pnpm check
pnpm lint
pnpm test
pnpm build
```

全部通过。涉及真实浏览器 HMR和安装流程时还必须有 Playwright或等价的真实服务器验收，不能只依赖单元测试。

## 本轮明确不做

- 真实 PostgreSQL连接和迁移体系；
- 真实 Redis和 OSS连接；
- 完整 Auth；
- ETL执行器和调度；
- Approval业务模型；
- ERP业务；
- CRM业务；
- BPMN设计器；
- 插件市场和远程搜索；
- 插件签名基础设施；
- 恶意代码沙箱；
- Worker或子进程插件；
- 跨进程 RPC；
- 共享客户端 Svelte Runtime；
- Module Federation；
- 全局 Capability类型生成；
- 插件业务数据 purge。

这些内容不得以“顺手”方式进入本轮实现。

## 完成定义

只有同时满足以下条件，本轮才算完成：

1. 目录和依赖分类完成；
2. ETL 成为独立原生 SvelteKit App；
3. Approval、ERP、CRM 是可加载的最小动态插件；
4. 单一 `inject<T>(id)` 模型替代具体 PluginDefinition依赖；
5. Apps 能提供静态 Package能力；
6. 插件服务端、客户端、依赖图和贡献都能正确热重载；
7. 开发态新增、修改、删除插件不需要手工重启；
8. 本地预构建插件制品可以安装、禁用、启用、升级和回滚；
9. 失败 revision不破坏上一个可用版本；
10. 自动化测试、真实开发服务器验收和文档与行为一致；
11. 其他业务模块仍保持最小骨架，没有过度实现。
