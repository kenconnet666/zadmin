# ZAdmin 换设备开发交接

本文用于在新设备上恢复当前开发现场，并说明已经完成的边界、关键代码入口和建议的后续顺序。它记录的是 **2026-08-22** 的仓库基线；继续开发前应先比较本文中的提交号与实际 `HEAD`。

## 当前基线

- 分支：`master`
- 实现基线提交：`7c76ef2`（`docs: document plugin architecture and preferences`）；本文的交接提交位于它之后
- 包管理器：`pnpm@11.22.0`，由根目录 `package.json` 固定
- 已验证运行时：Node.js `v24.18.0`
- 工作区：pnpm workspace，所有应用、公共包和插件位于同一个仓库
- 当前不依赖 Docker、PostgreSQL、Redis 或对象存储服务即可完成安装、检查、测试和构建

若实际仓库已经包含本文之后的提交，以较新的 Git 历史和代码为准，同时更新本文，避免交接信息继续漂移。

## 项目方向与不可轻易改变的决策

ZAdmin 是以 SvelteKit 为宿主的全栈插件化脚手架，不把前后端拆成两个系统。一个插件对应一个较粗粒度业务域，可以同时提供服务端能力、Svelte 页面和动态路由。

当前约束如下：

1. 根目录保持 `apps/`、`packages/`、`plugins/` 三类工作区，不增加没有明确收益的顶层配置或工具目录。
2. `packages/core` 只承载插件运行时、生命周期和通用基础约定；插件之间直接通过 TypeScript 包依赖获得完整类型，不建立一份臃肿的公共 RPC API。
3. `packages/zui` 和 `packages/drizzle` 是可以被任意外部项目依赖的公开库，不绑定 ZAdmin 宿主。
4. `plugins/sveltekit` 是 SvelteKit 集成插件；业务插件也采用 SvelteKit 全栈模式组织，不拆分独立前端包和后端包。
5. 第一阶段只运行自家可信插件。协议以后可以增加信任级别，但当前没有恶意代码沙箱，不能把未知第三方插件当作安全代码加载。
6. 开发时，工作区插件源码直接参与 Vite 模块图，实现业务代码和插件定义热更新；生产时使用正常的构建产物。
7. 优先采用较新的兼容依赖、简洁代码、少冗余和可维护的直接设计。抽象必须解决已经存在的职责，不为未来猜测预先堆层次。
8. 变更采用阶段性 Git 提交，并在提交前执行与风险相称的验证。

更完整的设计理由见[工作区与架构](./architecture.md)和[工程倾向与决策原则](./engineering-preferences.md)。

## 新设备恢复步骤

### 1. 准备工具

安装 Git 和 Node.js 24.x。当前验证版本是 Node.js 24.18.0；若采用更新的 Node.js 版本，应重新运行完整验证。

通过 Corepack 启用仓库固定的 pnpm 版本：

```powershell
corepack enable
corepack prepare pnpm@11.22.0 --activate
node --version
pnpm --version
```

期望 `pnpm --version` 输出 `11.22.0`。如果系统策略不允许 Corepack 写入全局目录，也可以用自己可信的 Node/pnpm 版本管理器安装同一版本。

### 2. 获取并进入仓库

```powershell
git clone <repository-url> C:\code\zadmin
Set-Location C:\code\zadmin
git status --short --branch
git log -1 --oneline
```

如果使用文件同步或移动硬盘复制仓库，应连同 `.git` 目录一起复制，并确认 `git status` 没有意外修改。不要复制旧设备上的 `node_modules`、应用 `build` 或包 `dist`；这些内容应在新设备重新生成。

### 3. 安装和验证

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm test
pnpm build
```

当前已验证结果：

- `pnpm check` 通过；空的 ZUI、PostgreSQL、Redis、OSS 包可能提示没有 `.svelte` 输入，这是预期提示，不是错误。
- `pnpm lint` 通过。
- `pnpm test` 通过，共 10 个测试文件、32 个测试。
- `pnpm build` 通过，三个应用和所有可构建包都能生成产物。

如果 Playwright 浏览器尚未下载，先执行：

```powershell
pnpm --filter @zadmin/docs exec playwright install chromium
```

当前没有必需的环境变量，也没有需要迁移的本地数据库。`.env*` 文件不会进入 Git；以后增加真实凭据时，需要通过安全渠道单独迁移，不能写入仓库或交接文档。

## 日常开发命令

在仓库根目录运行：

```powershell
pnpm dev:admin
pnpm dev:etl
pnpm dev:docs
```

- `pnpm dev:admin`：管理宿主，安装 SvelteKit、PostgreSQL、Redis、OSS 和 Auth 插件。
- `pnpm dev:etl`：ETL 宿主，安装 SvelteKit、PostgreSQL、Redis、OSS 和 ETL 插件。
- `pnpm dev:docs`：ZUI、文档和 Storybook 相关的演示工作区；目前仍保留初始 SvelteKit/Storybook 示例，尚未整理成最终文档站。

Vite 会在终端显示实际端口。如果默认端口被占用，可以向应用脚本继续传参，例如：

```powershell
pnpm --filter @zadmin/admin exec vite dev --port 5174
```

## 已实现能力

### 插件运行时

`packages/core` 已实现：

- 强类型 `definePlugin`、`defineApp` 和插件 API 推断；
- 插件依赖拓扑排序、缺失依赖、重复插件和循环依赖检查；
- `configure`、`start`、`stop`、`reload`、`reconcile`、`dispose`；
- `registered`、`waiting`、`starting`、`active`、`stopping`、`stopped`、`failed` 状态；
- `AbortSignal` 和后进先出的 Effect 清理；
- 生命周期事件和只读运行时快照；
- 开发态运行时复用，以及 Core 更新时的安全重建。

### SvelteKit 集成

`plugins/sveltekit` 已实现：

- 服务端动态路由注册和分派；
- 静态路径、`:param` 参数和 `*wildcard` 通配符；
- Svelte 客户端页面注册和 `PluginPageOutlet`；
- 插件停止或重载时自动撤销所属路由和页面。

当前示例路由：

| 宿主  | 页面    | 服务接口           | 诊断接口            |
| ----- | ------- | ------------------ | ------------------- |
| Admin | `/auth` | `/auth/api/status` | `/__zadmin/runtime` |
| ETL   | `/etl`  | `/etl/api/status`  | `/__zadmin/runtime` |

### 开发态热更新

应用的 Vite 配置对 `@zadmin/*` 工作区包启用 SSR 源码处理，并统一 Svelte 实例。应用服务端模块使用 HMR 接受和运行时协调逻辑：

- 修改业务插件定义时，宿主进程不重启，运行时 ID 保持不变，受影响插件的 revision 增加并完成清理、重启和依赖协调。
- 修改 `packages/core` 运行时代码时，创建新的运行时并重新激活应用插件，运行时 ID 会变化。
- 修改插件里的 `.svelte` 组件时，浏览器页面通过 Svelte HMR 更新，通常不需要手动刷新。

详细机制和验收方法见[开发态热重载](./development-hmr.md)。

## HMR 快速验收

启动 Admin：

```powershell
pnpm dev:admin
```

然后执行以下检查：

1. 打开 `/auth`，确认出现 Authentication 页面。
2. 请求 `/auth/api/status`，确认返回 Auth 插件的 active 状态。
3. 请求 `/__zadmin/runtime`，记录 runtime ID 和 Auth revision。
4. 修改 `plugins/auth/src/lib/index.ts` 中可观察的接口内容，确认接口响应更新、runtime ID 不变、Auth revision 增加。
5. 修改 `plugins/auth/src/lib/AuthPage.svelte` 的标题，确认已打开的页面自动更新。
6. 还原临时文案后，修改 `packages/core/src/runtime.ts` 中一个无行为影响的源码位置，确认 runtime ID 变化且插件恢复 active。

不要提交为验收而添加的临时文案。若 HMR 行为异常，先看终端是否出现编译错误，再检查 `apps/admin/vite.config.ts` 中的 `resolve.dedupe` 和 `ssr.noExternal` 是否仍然存在。

## 生产构建冒烟

构建并启动 Admin：

```powershell
pnpm --filter @zadmin/admin build
Set-Location apps\admin
$env:HOST = '127.0.0.1'
$env:PORT = '3100'
node build
```

另开终端检查：

```powershell
Invoke-WebRequest http://127.0.0.1:3100/ -UseBasicParsing
Invoke-RestMethod http://127.0.0.1:3100/auth/api/status
Invoke-RestMethod http://127.0.0.1:3100/__zadmin/runtime
```

验证结束后，在服务终端按 `Ctrl+C` 停止进程。SvelteKit 的 shutdown 事件会触发运行时清理。

## 关键代码入口

| 目的                 | 文件                                                                    |
| -------------------- | ----------------------------------------------------------------------- |
| 插件声明和类型推断   | `packages/core/src/definition.ts`、`packages/core/src/types.ts`         |
| 依赖图与错误         | `packages/core/src/graph.ts`、`packages/core/src/errors.ts`             |
| 生命周期运行时       | `packages/core/src/runtime.ts`、`packages/core/src/scope.ts`            |
| 开发态运行时协调     | `packages/core/src/hmr.ts`                                              |
| 动态服务路由         | `plugins/sveltekit/src/lib/routes.ts`                                   |
| 动态 Svelte 页面     | `plugins/sveltekit/src/lib/pages.ts`、`PluginPageOutlet.svelte`         |
| Auth 示例插件        | `plugins/auth/src/lib/index.ts`、`client.ts`、`AuthPage.svelte`         |
| ETL 示例插件         | `plugins/etl/src/lib/index.ts`、`client.ts`、`EtlPage.svelte`           |
| Admin 组装和请求入口 | `apps/admin/src/lib/server/zadmin.ts`、`apps/admin/src/hooks.server.ts` |
| ETL 组装和请求入口   | `apps/etl/src/lib/server/zadmin.ts`、`apps/etl/src/hooks.server.ts`     |
| 核心行为测试         | `packages/core/tests/`、`plugins/sveltekit/tests/`                      |

阅读代码时建议从 `packages/core/src/types.ts`、`definition.ts`、`runtime.ts` 开始，再看 `plugins/sveltekit` 和两个应用的 `zadmin.ts`。

## 尚未实现的边界

以下内容目前只有目录、最小包入口或概念位置，不应被描述为已经完成：

- PostgreSQL 真实连接、Drizzle schema、迁移和事务边界；
- Redis 连接、命名空间、序列化和重连策略；
- OSS/S3 客户端、上传策略、签名 URL 和凭据管理；
- Auth 的用户、会话、角色、权限、登录页面和安全策略；
- ETL 作业模型、调度、执行器、状态持久化和管理界面；
- 插件包下载、安装、卸载、升级、版本求解、持久化配置和管理 UI；
- 独立仓库插件的发现、开发目录监听和发布流程；
- 插件签名、信任级别执行策略和恶意代码沙箱；
- `/__zadmin/runtime` 的生产鉴权或禁用策略；
- ZUI 真实组件、Drizzle 增强能力以及最终文档站内容；
- 部署、日志、指标、追踪、备份和生产密钥方案。

当前所谓“安装插件”是应用在 TypeScript 中直接依赖插件包，并由 `defineApp` 静态列出定义；它还不是面向最终用户的在线插件市场。

## 下一阶段建议顺序

1. **PostgreSQL + Drizzle 纵向切片**：实现配置校验、连接生命周期、迁移约定和一个真实 schema；用 runtime Effect 确认重载和退出都能关闭连接。
2. **Auth 最小闭环**：基于 PostgreSQL 完成用户、会话、登录和路由保护，同时为 `/__zadmin/runtime` 加开发环境限制或鉴权。
3. **Redis 与 OSS 提供者**：沿用相同的配置、生命周期和测试模式，不提前抽象统一“资源插件基类”。
4. **ETL 业务闭环**：先做一个可持久化、可执行、可观察的最小作业，再扩展调度和插件能力。
5. **独立仓库插件工作流**：在真实外部插件出现后，补充 workspace/file/tarball 开发安装、目录监听、版本和升级协议。
6. **ZUI 和文档站**：以实际 Admin/Auth/ETL 界面沉淀组件，逐步删除脚手架示例。
7. **生产插件管理**：最后设计安装状态持久化、签名、信任等级和运维界面；第一阶段仍坚持可信插件边界。

这一顺序优先验证最关键的全栈边界，不需要重新推翻现有插件模型。

## 常见问题

### 工作区包更新后应用没有热重载

确认应用的 `vite.config.ts` 仍然包含：

- `resolve.dedupe: ['svelte']`
- `ssr.noExternal: [/^@zadmin\//]`

同时确认应用的 `zadmin.ts` 仍接受 HMR，并通过 `packages/core/src/hmr.ts` 获取运行时，而不是在每次模块求值时无条件创建孤立运行时。

### Node.js 直接加载 TypeScript 时出现语法错误

部分工作区源码会被 Node/Vite 直接处理，应避免 Node strip-only 模式不支持的 TypeScript 运行时语法，例如构造函数参数属性。包源码内部使用 `.ts` 相对导入；TypeScript 构建通过 `rewriteRelativeImportExtensions` 生成发布用 `.js` 引用。

### 构建后测试被重复执行或进入发布包

测试应放在包级 `tests/`，不要放进会被打包的 `src/`。若怀疑旧产物污染结果，先确认具体包的 `dist` 所有权和内容，再运行该包现有的 clean/build 流程；不要用宽泛删除命令清理整个工作区。

### 升级 TypeScript 或其他最新依赖后 peer dependency 冲突

当前固定 TypeScript 6.0.3，因为已验证的 Svelte、ESLint 和相关工具链 peer 范围尚未共同支持 TypeScript 7。升级前先执行 `pnpm peers check`，再运行 check、lint、test、build；“最新”必须服从完整兼容性。

### Git 报 dubious ownership

这通常是仓库由另一个 Windows 账户创建。只读检查可使用命令级安全目录：

```powershell
git -c safe.directory=C:/code/zadmin status
```

不要仅为绕过一次检查就修改全局 Git 配置。若新设备上的仓库确实归当前账户所有，再按 Git 官方建议处理目录所有权。

## 提交前清单

```powershell
git status --short
pnpm check
pnpm lint
pnpm test
pnpm build
git diff --check
```

根据改动规模可以先跑包级测试再跑全量，但涉及 Core、SvelteKit 集成、依赖版本或工作区配置时应执行完整清单。提交应保持单一主题，并把文档与对应行为放在同一阶段提交或紧邻提交中。

## 新设备继续开发的最短清单

1. 确认 `git log -1` 不早于本文基线提交。
2. 确认 Node 24.x 和 pnpm 11.22.0。
3. 执行 `pnpm install --frozen-lockfile`。
4. 执行 check、lint、test、build，记录任何与本文不同的结果。
5. 启动 Admin，验证 `/auth`、`/auth/api/status` 和 `/__zadmin/runtime`。
6. 阅读架构、插件开发、生命周期和 HMR 文档。
7. 从“下一阶段建议顺序”选择一个纵向切片，完成后同步更新本文的基线、已完成能力和未完成边界。
