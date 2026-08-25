# 换设备开发交接

更新时间：2026-08-25。

## 当前结论

DI容器、Plugin Module、上下游插件类型传播、服务端/客户端独立HMR、Artifact安装和构建验证已经实现并完成真实浏览器验收。后续业务开发直接在此基础上添加真实数据库、鉴权、ERP/CRM/审批流业务，不需要再设计第二套插件调用方式。

ZUI ICSS和五个基础组件已经按[ICSS生产架构](./zui-icss.md)完成生产验收：公开API只有class字符串；Svelte编译器把安全动态叶子提升为inline CSS变量；运行时负责结构CSS、普通TS回退、SSR Registry和HMR。不要回到`{ class, style }`或完整静态提取路线。外部接入见[ZUI使用与外部接入](./zui-usage.md)。

2026-08-25 已把平台无关的Theme、Token、ICSS Program和设计Props提取到`@zadmin/zui-core`，原Web能力迁移为`@zadmin/zui-svelte`；Web API与行为未扩展，两个tarball已完成隔离安装、check、build和SSR回归。

Svelte→Taro微信链路也已完成默认WebView生产验收：`@zadmin/svelte-taro`提供CJS framework plugin、compiler、renderer、App/Page runtime、静态Taro module、native types和scoped WeChat platform；`@zadmin/zui-taro`提供五个基础组件、三个流程组件和严格ICSS子集；`apps/wechat`是受版本控制的验收宿主。Fast Refresh、外部tarball、能力报告和Taro Solid性能对比均已落库。不要把Skyline build-verified或账号/硬件mock证据写成真机验收。

2026-08-25 补充真实模拟器验收时发现从原生`tap`同步调用Taro路由会让目标Svelte Page越过context初始化边界。`@zadmin/svelte-taro`现提供Promise-first强类型`platform.navigation`，把五种页面切换延迟到原生事件分发结束后的下一任务；首页到能力页、三个安全探针和空控制台已经复核。不要在事件处理器里延迟调用`getWeChatPlatform()`，应在组件初始化时捕获platform。

同日完成受监督Android真机验收：Xiaomi 22081212C / Android API 35 / WeChat 8.0.76 / base library 3.17.1。首页渲染正常，真机WXML树确认导航到`pages/capabilities/index`；network=`wifi`、临时storage roundtrip/removal、只读privacy=`no pending consent`通过，Console始终为空，服务正常且等待/未确认消息均为0。该次只提升这三个capability到device-verified；没有触发账号、商户、权限或硬件能力。

第一批安全能力随后完成：新增Support、System、Session、Files、Worker正式探针，连同原三项共8个capability达到device-verified。Files验证唯一临时文件写/读/unlink及删除后不存在；Worker连续两次create/message/terminate通过，返回首页后WXML恢复且Console为空。Worker源码变化由supervisor自动restart Taro child，实测12.1–12.2秒。生产构建使用`--no-check`避开Taro Doctor网络schema/离线旧schema漂移，先清空`dist`并在构建后验证Worker声明与文件。

关键代码检查点：

```text
cbd4c12 feat: add generation-aware service container
857e4a1 refactor: run host and plugins through service modules
587d393 feat: harden plugin builds and hot replacement
ddcc4f9 feat(zui): compile dynamic icss values to inline variables
547f0e3 feat(zui): harden sveltekit ssr and hmr integration
a613cb4 feat(zui): add provider and foundational components
fecc5a2 docs(zui): replace starter content with zui documentation
1d65349 docs(wechat): approve Svelte Taro production blueprint
976e0d6 chore(workspace): isolate the WeChat toolchain
4dc0450 refactor(zui): extract platform-neutral core
ece5528 refactor(zui): isolate the Web renderer package
33a9cdf feat(svelte-taro): add typed Taro framework plugin
cf0d2f4 feat(svelte-taro): compile Svelte through the Taro renderer
38a6395 feat(wechat): add Svelte app and page runtime
bc9f939 feat(zui-taro): add foundational components and ICSS
19124a1 feat(svelte-taro): add scoped WeChat platform capabilities
7ec35b3 feat(wechat): add supervised Fast Refresh
edd8ad7 test(wechat): complete Svelte Taro production acceptance
41ff750 docs(wechat): finalize Svelte Taro architecture and handoff
b75e46f fix(svelte-taro): defer typed page navigation
ab7df4c docs(wechat): record supervised device acceptance
4803a9f feat(wechat): add safe platform probes
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
pnpm build:wechat
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
  desktop/
  docs/
  etl/
  wechat/

packages/
  auth/
  core/
  drizzle/
  oss/
  postgres/
  redis/

ui/
  sveltekit/
  svelte-taro/
  tauri/
  zui-core/
  zui-taro/
  zui-svelte/

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
| 服务端动态路由              | `ui/sveltekit/src/lib/routes.ts`                       |
| 浏览器Plugin Runtime        | `ui/sveltekit/src/lib/client-runtime.ts`               |
| Approval公开类型            | `plugins/approval/src/server/contract.ts`              |
| CRM上游类型依赖示例         | `plugins/crm/src/server/contract.ts`、`service.ts`     |
| ICSS Runtime与Registry      | `ui/zui-svelte/src/lib/icss/`                          |
| Svelte ICSS编译器           | `ui/zui-svelte/src/lib/compiler/`                      |
| SvelteKit ICSS SSR          | `ui/zui-svelte/src/lib/sveltekit/`                     |
| ZUI基础组件                 | `ui/zui-svelte/src/lib/components/`                    |
| ZUI接入文档                 | `apps/docs/content/zui-usage.md`                       |
| Taro framework plugin       | `ui/svelte-taro/src/plugin/index.cts`                  |
| Svelte Taro compiler        | `ui/svelte-taro/src/compiler/`                         |
| Taro renderer/runtime       | `ui/svelte-taro/src/renderer/`、`runtime/`             |
| WeChat platform/catalog     | `ui/svelte-taro/src/platform/`                         |
| WeChat安全页面导航          | `ui/svelte-taro/src/platform/service.ts`               |
| WeChat安全探针              | `apps/wechat/src/pages/capabilities/probes.ts`         |
| WeChat安全Worker            | `apps/wechat/src/workers/safe-probe.js`                |
| Taro module/native/testing  | `ui/svelte-taro/src/module/`、`native/`、`testing/`    |
| ZUI Taro                    | `ui/zui-taro/src/`                                     |
| Tauri 系统能力              | `ui/tauri/src/api/`、`runtime/`、`testing/`            |
| Tauri Svelte组件            | `ui/tauri/src/components/`                             |
| Windows桌面宿主             | `apps/desktop/src/`、`src-tauri/`                      |
| tauri-specta bindings       | `apps/desktop/src/lib/generated/tauri.ts`              |
| WeChat supervisor           | `apps/wechat/config/supervisor.mjs`                    |
| 微信生产验收                | `apps/docs/content/wechat-production-acceptance.md`    |

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

## ZUI实测结论

2026-08-24在Windows本机完成：

- Chromium、Firefox、WebKit的ZUI测试全部通过；
- 10,000次响应式状态变化只更新inline变量，class/rule/style tag数量不增长；
- Compiler branch coverage 91.06%，ICSS branch coverage 93.47%；
- 50个并发SvelteKit SSR请求无Registry串扰，hydration不重复插入规则；
- CSP nonce、header hash和prerender meta hash均有测试；
- 真实Vite HMR将背景结构从primary改为danger时，rule维持9、style tag维持1；
- `@zadmin/zui-svelte@0.1.0`发布tarball在仓库外SvelteKit工程安装、check、build和SSR通过；
- 外部fixture的ZUI页面节点gzip 10,243 bytes，客户端没有compiler/server模块；
- Docs、Storybook和Playwright动态示例全部通过。

ZUI重点命令：

```powershell
pnpm --filter @zadmin/zui-svelte test:coverage
pnpm --filter @zadmin/docs test:e2e
pnpm --filter @zadmin/docs build-storybook
```

## 微信实测结论

2026-08-25在Windows本机完成：

-生产Taro build使用142个transform modules，内部构建约7.8秒；先清空旧产物，Worker复制/声明有构建后验证，产物不含buildId、supervisor、fake driver、testing入口或workspace绝对路径；
-Svelte Taro 13个test files/43项测试、微信宿主7项Node+4项TS探针测试、ZUI Taro 2个files/4项测试通过，两条100-cycle释放链回到基线；
-WebView模拟器中组件、state/if/keyed list/theme/dynamic ICSS、流程`open-type`和强类型页面导航通过；指定Android真机进一步确认首页渲染、导航/卸载及8个明确capability；
-32项capability逐项记录等级；支付/手机号/SOTER/硬件等没有被无人值守真实触发；
-四个tarball空目录安装、frozen reinstall、外部module/native/ZUI类型、单runtime和Taro build通过；
-同场景Taro Solid/Svelte三轮交替冷构建中位比1.018x，达到≤1.25x；
-Fast Refresh的App/ZUI/platform变化约1.5–2.8秒；compiler/config完整重启约11.4秒；Worker自动重启/复制约12.1–12.2秒，仍未达到最初的8/10秒总链目标；
-WebView为simulator-verified；Skyline补齐`glass-easel`、`navigationStyle: custom`、`lazyCodeLoading: requiredComponents`和`rendererOptions.skyline`后build通过，但当前DevTools中Svelte与Taro Solid对照页均呈黑色画布，automator/inspectee均在`MPPage.getCurrent`失败，因此仅build-verified。

重点命令：

```powershell
pnpm --filter @zadmin/wechat-app setup:local -- C:\Users\lionheart\WeChatProjects\miniprogram-1
pnpm build:wechat
pnpm dev:wechat
pnpm --filter @zadmin/svelte-taro test:package
pnpm --filter @zadmin/svelte-taro benchmark
```

`setup:local`只生成被忽略的`project.private.config.json`，不打印AppID。换设备时把最后一个参数替换为该设备上已经授权的微信项目目录。

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
-ZUI编译器只优化可证明安全的本地数据流；循环、switch中的动态声明、factory局部值、兄弟/祖先selector和未知组件边界会使用完整class-rule回退。
\-`inline-vars`要求CSP允许`style-src-attr`；严格禁止inline attribute时使用`dynamicValues: 'class-rules'`。
-当前ZUI组件范围只有Provider、Box、Stack、Text和Button；旧Vue组件库不是待机械迁移清单。
-微信默认生产目标是WebView；Skyline不是simulator-verified。
-固定Svelte artifact的boundary `failed/pending` snippet存在上游compiler崩溃；当前支持并测试`<svelte:boundary onerror>`，坏路径有提前诊断。
-微信完整dev audit有21项固定工具链advisory，但`pnpm audit --prod`无已知漏洞，开发supervisor不启动Vite HTTP服务。
-Taro 4.2.1 Doctor依赖远程schema且离线fallback不接受插件的`framework: none`；所有宿主/外部fixture构建固定使用`--no-check`，由包级配置校验、清空旧dist、真实目标构建和产物验证取代。
-真机启动时微信内部广告调优可能报告`WAServiceMainContext invalid scope`，远程调试也可能报告`/usr/app.js.map`截断；本地无广告API且7个map均可解析。记录并清空这些环境消息后，8项探针及卸载阶段Console保持为空。
-没有执行微信upload、审核、支付、手机号、订阅、权限弹窗、云写入或真实硬件操作。
-当前Taro 4.2.1/DevTools Stable 2.02.2608040/基础库3.17.1组合下，Skyline在Svelte与Taro Solid对照页都出现黑色模拟器画布；升级Taro、DevTools或基础库后必须按renderer验收文档重测，不能从build通过推断可发布。
-四个失败的clean-package诊断目录因宿主递归删除策略未能自动清理，位于`%TEMP%\zadmin-wechat-package-{zhYiko,d8QoR6,iZYX7l,B8Img4}`；它们不在仓库内，可在确认无需诊断后手工删除。最后一次成功fixture已自动清理。

这些不是未完成的DI路线图；除非出现明确业务需求，不添加占位接口。

## 下一位开发者的第一步

1. 先运行四条全仓验证命令。
2. 阅读 `dependency-injection.md`、`plugin-development.md`、`zui-usage.md`和`wechat-production-acceptance.md`。
3. 业务插件优先扩展自己的primary API和内部Provider，不开放内部Bean ID。
4. 修改Runtime/HMR后按 `testing.md`执行真实浏览器验收。
5. 阶段性提交并更新本交接文件。
6. 微信开发先运行`setup:local`，再用`pnpm dev:wechat`；不要另起第二组Taro/package watcher。
