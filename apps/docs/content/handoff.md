# 换设备开发交接

更新时间：2026-08-23。

## 当前结论

DI容器、Plugin Module、上下游插件类型传播、服务端/客户端独立HMR、Artifact安装和构建验证已经实现并完成真实浏览器验收。后续业务开发直接在此基础上添加真实数据库、鉴权、ERP/CRM/审批流业务，不需要再设计第二套插件调用方式。

ZUI下一阶段已经冻结[ICSS生产架构](./zui-icss.md)：公开API只有class字符串；Svelte编译器把动态叶子提升为inline CSS变量；运行时负责结构CSS、普通TS回退、SSR Registry和HMR。该文档是实现合同，不再回到`{ class, style }`或完整静态提取路线。

关键代码检查点：

```text
cbd4c12 feat: add generation-aware service container
857e4a1 refactor: run host and plugins through service modules
587d393 feat: harden plugin builds and hot replacement
```

最终文档提交之后请用下面命令确认实际HEAD：

```powershell
git log -5 --oneline
git status --short --branch
```

## 新设备恢复

```powershell
cd C:\code\zadmin
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm lint
```

如果仓库位于其他路径，命令不依赖 `C:\code\zadmin`；只有本文档中的示例路径需要替换。

启动Admin：

```powershell
pnpm dev:admin
```

打开：

```text
http://localhost:5173/
http://localhost:5173/plugins
http://localhost:5173/approval
http://localhost:5173/erp
http://localhost:5173/crm
```

运行时诊断：

```text
GET /__zadmin/runtime
GET /__zadmin/health
GET /__zadmin/plugins/client
GET /__zadmin/plugins/installed
```

## 当前目录

```text
apps/
  admin/
  docs/
  etl/

packages/
  auth/
  core/
  drizzle/
  oss/
  postgres/
  redis/
  sveltekit/
  zui/

plugins/
  approval/
  crm/
  erp/
```

根目录没有独立 `config/`或 `tooling/`目录。

`packages/core/src/`已经整理为：

```text
app/
artifact/
container/
plugin/
cli.ts
di.ts
index.ts
plugin.ts
```

旧版 `runtime.ts`、`types.ts`、`injection.ts`等顶层转发文件已删除，不能按旧路径继续实现。

## 关键入口

| 责任                        | 文件                                                   |
| --------------------------- | ------------------------------------------------------ |
| ServiceContainer事务        | `packages/core/src/container/container.ts`             |
| Provider图和可见性          | `packages/core/src/container/graph.ts`                 |
| Scope和资源回调             | `packages/core/src/container/context.ts`               |
| Provider与`@service`        | `packages/core/src/container/provider.ts`              |
| Token/Injection             | `packages/core/src/container/token.ts`、`injection.ts` |
| Plugin定义                  | `packages/core/src/container/module.ts`                |
| PluginRuntime               | `packages/core/src/plugin/runtime.ts`                  |
| Artifact Manager            | `packages/core/src/plugin/manager.ts`                  |
| Manifest/Definition校验     | `packages/core/src/plugin/validation.ts`               |
| Artifact扫描与revision      | `packages/core/src/artifact/workspace.ts`              |
| 安装器                      | `packages/core/src/artifact/installed.ts`              |
| Plugin构建策略              | `packages/core/src/artifact/vite.ts`                   |
| Package/Manifest校验        | `packages/core/src/artifact/validation.ts`             |
| Admin组合和HMR              | `apps/admin/src/lib/server/host.ts`                    |
| EventSource/Client Artifact | `apps/admin/src/lib/server/plugins.ts`                 |
| 服务端动态路由              | `packages/sveltekit/src/lib/routes.ts`                 |
| 浏览器Plugin Runtime        | `packages/sveltekit/src/lib/client-runtime.ts`         |
| Approval公开类型            | `plugins/approval/src/server/contract.ts`              |
| CRM上游类型依赖示例         | `plugins/crm/src/server/contract.ts`、`service.ts`     |

## 当前调用方式

默认：下游 package依赖上游Plugin package，类型自然传播：

```ts
import type { ApprovalPlugin } from '@zadmin/approval';

approval: injectPlugin<ApprovalPlugin>('@zadmin/approval');
```

少量并行编译或弱耦合场景：

```ts
interface ApprovalStarter {
	start(id: string): { readonly id: string };
}

approval: inject<ApprovalStarter>('@zadmin/approval');
```

两种形式运行时都进入同一个Provider图；禁止直接import上游Plugin实现值。

## 当前生命周期

-所有 Provider为Module generation单例，启动时全部构造。
-candidate先create/prepare/health。
-旧版本deactivate后原子切换Registry。
-candidate activate失败恢复旧Registry。
-旧版本dispose失败标记leaked并阻止后续热升级。
-Host Module不能依赖Dynamic Plugin。
-Plugin primary是唯一默认公开能力，内部Provider私有。
-Module依赖可以互相出现，实际Provider图不能成环。

## HMR实测结论

2026-08-23在Windows本机完成：

-服务端Approval变化只重建Approval、CRM、ERP；Host generation保持。
-client revision不随server变化。
-客户端Approval变化通过EventSource更新当前DOM，不重启server generation。
-Host HMR会close旧EventSource stream，浏览器自动重连刷新。
-Approval类型签名变化会被CRM、ERP watcher同时发现，恢复后自动清错。
-正常 `dev:admin`只有7个相关Node进程，不再倍增watcher。

详见 [开发态热重载](./development-hmr.md)。

## Artifact与数据目录

开发Artifact：

```text
plugins/*/dist
```

生产安装状态默认：

```text
Windows: %LOCALAPPDATA%\ZAdmin\apps\admin\plugins
Linux:   $XDG_DATA_HOME/ZAdmin/apps/admin/plugins
```

可通过绝对路径环境变量覆盖：

```powershell
$env:ZADMIN_DATA_DIR = 'D:\zadmin-data'
```

生产修改插件安装状态还需要：

```powershell
$env:ZADMIN_PLUGIN_ADMIN_TOKEN = '<secret>'
```

不要把token写入仓库、命令输出或文档。

## 已知且刻意保留的边界

-只支持可信插件；没有沙箱。
-Node ESM Module Record不能真正卸载，业务资源和Registry可以卸载。
-没有transient/request/resolution scope；短生命周期用显式factory或SvelteKit RequestEvent。
-没有multi-binding、AOP、自动扫描、property/parameter injection和循环代理。
-Admin已安装插件当前只使用Plugin `defaultConfig`，尚无业务配置UI和schema持久化。
-卸载删除安装记录但保留历史版本目录，方便回滚和诊断；磁盘清理策略需在真实运维需求出现后单独设计。
-真实PostgreSQL、Redis和OSS客户端仍是基础骨架，后续业务接入不能把DI/HMR测试误当成真实外部服务验收。

这些不是未完成的DI路线图；除非出现明确业务需求，不添加占位接口。

## 下一位开发者的第一步

1. 先运行四条全仓验证命令。
2. 阅读 `dependency-injection.md`和`plugin-development.md`。
3. 业务插件优先扩展自己的primary API和内部Provider，不开放内部Bean ID。
4. 修改Runtime/HMR后按 `testing.md`执行真实浏览器验收。
5. 阶段性提交并更新本交接文件。
