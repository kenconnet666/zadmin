# ZAdmin 换设备开发交接

更新日期：**2026-08-22**。当前实现基线以本次最终文档提交为准；换设备前使用 `git log -1 --oneline` 记录实际 HEAD。

## 环境

- Node.js：已验证 `v24.18.0`；
- pnpm：`11.22.0`，由根 `package.json` 固定；
- 当前骨架不需要 Docker、PostgreSQL、Redis或 OSS服务；
- Playwright Chromium 缺失时执行 `pnpm --filter @zadmin/docs exec playwright install chromium`。

```powershell
corepack enable
corepack prepare pnpm@11.22.0 --activate
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm lint
```

## 当前结构

```text
apps/       admin、etl、docs
packages/   core、sveltekit、auth、postgres、redis、oss、zui、drizzle
plugins/    approval、erp、crm
```

ETL 是原生 SvelteKit App；Approval、ERP、CRM 是动态插件；基础能力是静态 Package。

## 日常命令

```powershell
pnpm dev:admin
pnpm dev:etl
pnpm dev:docs
```

`dev:admin` 同时启动 Admin和三个 Plugin build watcher。若只需要自定义 Admin端口，直接运行：

```powershell
pnpm --filter @zadmin/admin exec vite dev --port 5174
```

注意：直接启动 Admin不会同时启动插件 watcher，适合只调试 App；完整插件 HMR必须用根命令。

## 已完成

- Apps/Packages/Plugins目录重新分类；
- ETL移除 Plugin Runtime，改为独立 App；
- 字符串 ID强类型 Injection；
- Host和Plugin统一 Provider容器；
- required/optional依赖图和 dependent重启；
- 服务端和客户端失败 revision回滚；
- Workspace插件自动构建、发现和 HMR；
- 自包含 Svelte Client Artifact动态页面；
- Manifest、SemVer和信任级别校验；
- `.zplugin` pack、安全解包和版本目录；
- install、enable、disable、activate、uninstall；
- Installed Provider和生产启动冒烟；
- 最小 Admin插件诊断页面和 mutation API。

## 仍是骨架

- PostgreSQL、Redis、OSS没有真实连接；
- Auth没有真实用户、会话和权限；
- ETL没有数据源、作业、调度和执行器；
- Approval、ERP、CRM只有页面、状态接口和最小调用；
- 没有插件签名、市场和恶意代码沙箱；
- 生产管理 UI尚未接真实 Auth，mutation API临时使用 `ZADMIN_PLUGIN_ADMIN_TOKEN`。

## 关键入口

| 目的                   | 文件                                                      |
| ---------------------- | --------------------------------------------------------- |
| Injection与 Plugin定义 | `packages/core/src/injection.ts`、`definition.ts`         |
| Runtime和依赖图        | `packages/core/src/runtime.ts`、`graph.ts`                |
| Manifest和Manager      | `packages/core/src/manifest.ts`、`manager.ts`             |
| Workspace监听          | `packages/core/src/workspace.ts`                          |
| 安装制品               | `packages/core/src/installed.ts`、`cli.ts`                |
| 服务端路由             | `packages/sveltekit/src/lib/routes.ts`                    |
| Client Runtime         | `packages/sveltekit/src/lib/client-runtime.ts`            |
| Admin Host             | `apps/admin/src/lib/server/host.ts`                       |
| Admin Plugin桥         | `apps/admin/src/lib/server/plugins.ts`、`hooks.server.ts` |
| 插件示例               | `plugins/approval`、`plugins/erp`、`plugins/crm`          |

## 生产数据

默认插件数据位于系统应用数据目录。部署时建议显式设置绝对路径：

```powershell
$env:ZADMIN_DATA_DIR = 'D:\zadmin-data'
$env:ZADMIN_PLUGIN_ADMIN_TOKEN = '<secret-from-secure-store>'
```

不要提交这些值。`.env*` 已忽略；密钥通过部署系统或安全凭据存储提供。

## 下一业务顺序

1. PostgreSQL + Drizzle真实纵向切片；
2. Auth最小用户/会话/权限闭环，并保护诊断与管理接口；
3. Approval最小审批闭环和迁移；
4. ERP或CRM选择一个最小业务闭环；
5. Redis、OSS按真实需求接入；
6. ETL最小可执行作业；
7. 插件签名、权限声明和更高信任级别。

继续开发前先读[工作区与架构](./architecture.md)、[插件开发](./plugin-development.md)、[插件生命周期](./plugin-lifecycle.md)和[开发态热重载](./development-hmr.md)。
