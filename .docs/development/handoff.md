# 换设备开发交接

更新时间：2026-08-29。

## 当前结论

DI容器、Plugin Module、上下游插件类型传播、服务端/客户端独立HMR、Artifact安装和构建验证已经实现并完成真实浏览器验收。后续业务开发直接在此基础上添加真实数据库、鉴权、ERP/CRM/审批流业务，不需要再设计第二套插件调用方式。

`@zadmin/zui`现为唯一浏览器组件包，内部包含Theme、Token、ICSS、recipe/slot recipe、Symbol attachment carrier和8个`Z*`基础组件。`@zadmin/sveltekit/zui`负责request-local SSR runtime、critical CSS、CSP nonce/hash和客户端集成。公开ICSS API仍只返回class字符串；第一方回调参数统一为`s`，CSS标准关键字补系统元数据，稳定视觉字面量补语义Theme token。Core/ZUI/SvelteKit三个tarball的仓库外安装、frozen reinstall、check/build、Node SSR、critical CSS、CSP hash与client边界已通过。

2026-08-26 的Tauri/Rust桌面实现已经完成过生产验收，现只作为Git历史中的迁移对照；2026-08-29在C# WebView2替代链通过真实生产页面与开发宿主smoke后，`ui/tauri`、`src-tauri`、Rust命令、bindings和依赖已从当前工作区删除。

`@zadmin/miniapp`现为独立移动框架：不依赖ZUI，内含Theme、`mcss()`、8个`M*`组件、compiler、custom renderer、App/Page runtime、官方微信类型平台能力和直接微信target。`apps/wechat`从Svelte源码生成WXML、WXSS、JS、JSON和sourcemap，生产依赖及产物没有Taro。当前本地13个测试文件/41项测试、宿主8项测试和15文件实际构建通过；clean-package和coverage留给云端CI。

`@zadmin/webview`已成为当前桌面实现：单一IDL生成34个method和28个TypeScript/C# DTO/enum，C# dispatcher按生成descriptor验证params；同时包含typed bridge、timeout/cancel/event/dispose、`DesktopPlatform`、browser fallback、fake driver、9个Svelte组件和WinUI 3/WebView2 Windows target。TypeScript 24项测试覆盖率statements 98.16%、branches 90.15%、functions/lines 100%；`net10.0` C# Core零警告。真实生产宿主加载SvelteKit/ZUI页面、严格CSP hash与JS→C# IPC通过；开发宿主在loopback origin确认Vite client、页面hydration、native bridge和退出零残留。portable ZIP为90,779,828 bytes，解包payload为233,775,520 bytes/533文件；self-contained路线相对旧Tauri installer/exe约35.85x/19.96x，正式优化包体前不能把C#替代描述成天然更轻。

2026-08-25的Taro模拟器、Android真机、Skyline、性能和能力探针记录只作为迁移前历史证据。2026-08-29直编WebView target已在微信开发者工具完成页面截图、页面栈、空error console、按钮事件、响应式count和自动完整remount验收；真机、账号、支付、手机号、权限、上传与硬件操作继续要求单独授权。

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
pnpm --filter @zadmin/webview generate:check
pnpm --filter @zadmin/webview dotnet:test
```

需要重建Windows发布件时再执行（耗时明显高于普通workspace build）：

```powershell
pnpm build:desktop
pnpm --filter @zadmin/desktop webview:smoke
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
  webview/        # C#公共层与Windows WebView2 target
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
| ZUI接入文档                 | `.docs/zui/usage.md`                                   |
| Svelte Miniapp compiler     | `ui/miniapp/src/compiler/`                             |
| Miniapp renderer/runtime    | `ui/miniapp/src/renderer/`、`runtime/`                 |
| 微信直接target              | `ui/miniapp/src/targets/wechat/`                       |
| WeChat platform/catalog     | `ui/miniapp/src/platform/`                             |
| WeChat安全页面导航          | `ui/miniapp/src/platform/service.ts`                   |
| WeChat安全探针              | `apps/wechat/src/pages/capabilities/probes.ts`         |
| WeChat安全Worker            | `apps/wechat/src/workers/safe-probe.js`                |
| Miniapp module/native/test  | `ui/miniapp/src/module/`、`native/`、`testing/`        |
| WebView平台与组件           | `ui/webview/src/platform/`、`bridge/`、`components/`   |
| C#公共dispatcher            | `ui/webview/dotnet/ZAdmin.WebView.Core/`               |
| Windows桌面target           | `ui/webview/targets/windows/`                          |
| Windows产品页面/配置        | `apps/desktop/src/`、`webview.config.ts`               |
| WeChat直编/HMR CLI          | `ui/miniapp/src/cli.ts`、`compiler/build.ts`           |
| 微信生产验收                | `.docs/miniapp/wechat-production-acceptance.md`        |

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

详见 [开发态热重载](./hmr.md)。

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

2026-08-29在Windows本机完成直编WebView target验收：

- 生产build生成15个受控文件，Worker声明和文件通过构建后验证，生产源码/依赖/产物不含Taro或ZUI；
- Miniapp 13个test files/41项测试与微信宿主8项测试通过；
- WXML通用renderer改为0–24层有限template展开，同名template递归warning消失；
- WebView模拟器真实显示8个`M*`组件页面，page stack与`#status`可读，console只有系统info；
- 点击`#counter`后count从0变1，验证事件ID分发、Svelte响应式更新和`setData`链；
- `runtime ready`→`runtime hot ready`→恢复的自动直编/完整Page remount通过，临时源码已恢复；
- 32项capability继续逐项记录等级；支付、手机号、SOTER、硬件、账号和上传没有被无人值守触发；
- 2026-08-25的Taro/Solid性能、旧真机和Skyline记录仅作迁移前历史，不是当前runtime证据。

重点命令：

```powershell
pnpm --filter @zadmin/wechat-app setup:local -- C:\Users\lionheart\WeChatProjects\miniprogram-1
pnpm build:wechat
pnpm dev:wechat
pnpm --filter @zadmin/miniapp test:package
```

`setup:local`只生成被忽略的`project.private.config.json`，不打印AppID，并固定`compileHotReLoad: false`、`skylineRenderEnable: false`。换设备时把最后一个参数替换为该设备上已经授权的微信项目目录。需要自动模拟器remount时设置`ZADMIN_WECHATIDE_CLIENT`。

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
-微信直编WebView target已达到simulator-verified；自动刷新为清compile cache后的完整Page remount，不保留页面状态；真机等级仍不能继承迁移前Taro证据。
-固定Svelte artifact的boundary `failed/pending` snippet上游限制仍保留提前诊断；`<svelte:boundary onerror>`已覆盖。
-没有执行微信upload、审核、支付、手机号、订阅、权限弹窗、云写入或真实硬件操作。
-Windows WinUI 3/WebView2真实IPC、生产页面与Vite开发链已验证；当前portable发布件未做Authenticode签名，MSIX、签名和安装升级仍必须在正式外部分发前单独验收。

这些不是未完成的DI路线图；除非出现明确业务需求，不添加占位接口。

## 下一位开发者的第一步

1. 先运行四条全仓验证命令。
2. 阅读 `dependency-injection.md`、`plugin-development.md`、`zui-usage.md`和`wechat-production-acceptance.md`。
3. 业务插件优先扩展自己的primary API和内部Provider，不开放内部Bean ID。
4. 修改Runtime/HMR后按 `testing.md`执行真实浏览器验收。
5. 阶段性提交并更新本交接文件。
6. 微信开发先运行`setup:local`，再用`pnpm dev:wechat`；该命令已经是唯一Miniapp直编watcher。
