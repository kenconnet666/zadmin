# 换设备开发交接

更新时间：2026-08-29。

## 当前结论

DI容器、Plugin Module、上下游插件类型传播、服务端/客户端独立HMR、Artifact安装和构建验证已经实现并完成真实浏览器验收。后续业务开发直接在此基础上添加真实数据库、鉴权、ERP/CRM/审批流业务，不需要再设计第二套插件调用方式。

`@zadmin/zui`现为唯一浏览器组件包，内部包含Theme、Token、ICSS、recipe/slot recipe、Symbol attachment carrier和8个`Z*`基础组件。`@zadmin/sveltekit/zui`负责request-local SSR runtime、critical CSS、CSP nonce/hash和客户端集成。公开ICSS API仍只返回class字符串；第一方回调参数统一为`s`，CSS标准关键字补系统元数据，稳定视觉字面量补语义Theme token。

2026-08-26 已把Svelte/UI平台包统一迁入根`ui/`，并完成`@zadmin/tauri`、9个桌面组件和`apps/desktop`。桌面端使用SvelteKit SPA静态产物、Tauri 2最小capability和`tauri-specta`生成bindings；真实Win11 x64静态页面、系统探针、HMR、release exe、NSIS安装/卸载均通过。当前发布件未签名，正式外部分发前必须补Authenticode；完整证据见[桌面生产验收](./desktop-production-acceptance.md)。

`@zadmin/miniapp`现为独立移动框架：不依赖ZUI，内含Theme、`mcss()`、8个`M*`组件、compiler、custom renderer、App/Page runtime、官方微信类型平台能力和直接微信target。`apps/wechat`从Svelte源码生成WXML、WXSS、JS、JSON和sourcemap，生产依赖及产物没有Taro。当前本地13个测试文件/41项测试、宿主8项测试和15文件实际构建通过；clean-package和coverage留给云端CI。

`@zadmin/webview`平台中立层已落地：34个IDL方法、typed bridge、timeout/cancel/event/dispose、`DesktopPlatform`、browser fallback、fake driver、9个Svelte组件和C# dispatcher。TypeScript 23项测试覆盖率statements 98.15%、branches 89.92%、functions/lines 100%；`net10.0` C# Core零警告构建并通过独立合同测试。Windows/WinUI 3/WebView2宿主和发布件仍在P7实施，旧Tauri发布路径暂不删除。

2026-08-25的Taro模拟器、Android真机、Skyline、性能和能力探针记录只作为迁移前历史证据。直编target尚需在当前微信开发者工具CLI授权完成后重新做模拟器/HMR复核，不能继承旧runtime的截图或验证等级。账号、支付、手机号、权限、上传与硬件操作继续要求单独授权。

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
33a9cdf feat(miniapp): add typed Taro framework plugin
cf0d2f4 feat(miniapp): compile Svelte through the Taro renderer
38a6395 feat(wechat): add Svelte app and page runtime
bc9f939 feat(zui-taro): add foundational components and ICSS
19124a1 feat(miniapp): add scoped WeChat platform capabilities
7ec35b3 feat(wechat): add supervised Fast Refresh
edd8ad7 test(wechat): complete Svelte Taro production acceptance
41ff750 docs(wechat): finalize Svelte Taro architecture and handoff
b75e46f fix(miniapp): defer typed page navigation
ab7df4c docs(wechat): record supervised device acceptance
4803a9f feat(wechat): add safe platform probes
59a1580 docs(workspace): plan ui root and tauri desktop
bb480ea refactor(workspace): move ui packages under ui
f128d1d refactor(zui): rename web package to zui-svelte
8a9239a refactor(ui): normalize package source layout
42f8eb9 feat(tauri): add typed desktop system platform
8b12293 feat(tauri): add svelte desktop integrations
75f755c feat(desktop): add win11 tauri capability host
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
pnpm check:desktop
pnpm test:desktop
pnpm --filter @zadmin/desktop bindings:check
```

需要重建Windows发布件时再执行（耗时明显高于普通workspace build）：

```powershell
pnpm build:desktop
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
  miniapp/
  tauri/
  webview/        # C# Windows target实施中
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
| 服务端动态路由              | `ui/sveltekit/src/lib/routes.ts`                       |
| 浏览器Plugin Runtime        | `ui/sveltekit/src/lib/client-runtime.ts`               |
| Approval公开类型            | `plugins/approval/src/server/contract.ts`              |
| CRM上游类型依赖示例         | `plugins/crm/src/server/contract.ts`、`service.ts`     |
| ICSS Runtime与Registry      | `ui/zui/src/lib/icss/`                                 |
| Svelte ICSS编译器           | `ui/zui/src/lib/compiler/`                             |
| SvelteKit ZUI SSR/CSP       | `ui/sveltekit/src/lib/zui/`                            |
| ZUI基础组件                 | `ui/zui/src/lib/components/`                           |
| ZUI接入文档                 | `apps/docs/content/zui-usage.md`                       |
| Svelte Miniapp compiler     | `ui/miniapp/src/compiler/`                             |
| Miniapp renderer/runtime    | `ui/miniapp/src/renderer/`、`runtime/`                 |
| 微信直接target              | `ui/miniapp/src/targets/wechat/`                       |
| WeChat platform/catalog     | `ui/miniapp/src/platform/`                             |
| WeChat安全页面导航          | `ui/miniapp/src/platform/service.ts`                   |
| WeChat安全探针              | `apps/wechat/src/pages/capabilities/probes.ts`         |
| WeChat安全Worker            | `apps/wechat/src/workers/safe-probe.js`                |
| Miniapp module/native/test  | `ui/miniapp/src/module/`、`native/`、`testing/`        |
| Tauri 系统能力              | `ui/tauri/src/api/`、`runtime/`、`testing/`            |
| Tauri Svelte组件            | `ui/tauri/src/components/`                             |
| Windows桌面宿主             | `apps/desktop/src/`、`src-tauri/`                      |
| tauri-specta bindings       | `apps/desktop/src/lib/generated/tauri.ts`              |
| WeChat直编/HMR CLI          | `ui/miniapp/src/cli.ts`、`compiler/build.ts`           |
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
- `@zadmin/zui@0.1.0`发布tarball在仓库外SvelteKit工程安装、check、build和SSR通过；
- 外部fixture的ZUI页面节点gzip 10,243 bytes，客户端没有compiler/server模块；
- Docs、Storybook和Playwright动态示例全部通过。

ZUI重点命令：

```powershell
pnpm --filter @zadmin/zui test:coverage
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
pnpm --filter @zadmin/miniapp test:package
pnpm --filter @zadmin/miniapp benchmark
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
-当前ZUI基础范围是Provider、Box、Stack、Text、Icon、Button、Input和Field；旧Vue组件库不是待机械迁移清单。
-微信直编target当前是build/test-verified；微信开发者工具CLI仍等待外部授权，不能继承迁移前Taro模拟器或真机证据。
-固定Svelte artifact的boundary `failed/pending` snippet上游限制仍保留提前诊断；`<svelte:boundary onerror>`已覆盖。
-没有执行微信upload、审核、支付、手机号、订阅、权限弹窗、云写入或真实硬件操作。
-WebView C# Core已验证，Windows WinUI 3窗口、WebView2 Evergreen缺失恢复、真实IPC、HMR、MSIX/portable、签名与安装卸载仍属于P7，不得从Core build推断可发布。

这些不是未完成的DI路线图；除非出现明确业务需求，不添加占位接口。

## 下一位开发者的第一步

1. 先运行四条全仓验证命令。
2. 阅读 `dependency-injection.md`、`plugin-development.md`、`zui-usage.md`和`wechat-production-acceptance.md`。
3. 业务插件优先扩展自己的primary API和内部Provider，不开放内部Bean ID。
4. 修改Runtime/HMR后按 `testing.md`执行真实浏览器验收。
5. 阶段性提交并更新本交接文件。
6. 微信开发先运行`setup:local`，再用`pnpm dev:wechat`；该命令已经是唯一Miniapp直编watcher。
