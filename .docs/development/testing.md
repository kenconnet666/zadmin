# 测试与验收

## 本地快速验证与云端全量门禁

默认开发节奏改为“本地窄验证、GitHub Actions全量验证”：

```text
本地每轮编码
  → git diff --check
  → 受影响Package的check
  → 与改动直接相关的focused test
  → 必要时受影响Package build
  → 提交并推送

GitHub Actions
  → 全仓check/lint/test/build
  → Chromium/Firefox/WebKit
  → Docs组件展示站E2E与可访问性
  → 覆盖率阈值
  → 外部tarball安装验收
  → 微信生产构建
  → Windows C# WebView2、真实宿主smoke与发布包
```

本地不再要求每个小改动重复执行根级`pnpm check/test/build/lint`。默认最低本地门槛：

1. `git diff --check`；
2. 受影响Package的类型或Svelte check；
3. 至少一个覆盖改动行为的focused test；
4. 修改package exports、构建器、生成器或发布配置时增加受影响Package build；
5. 修改GitHub Actions时运行Prettier、`actionlint`和YAML解析检查。

以下高风险变化仍应在推送前扩大本地验证：

- 数据迁移、安装器、凭据、权限或安全边界；
- 无法在GitHub hosted runner复现的微信开发者工具、真实浏览器HMR或硬件流程；
- 可能破坏工作区依赖图、lockfile或生成类型的改动；
- CI不可用、远程网络不可用或目标workflow被跳过。

推送后必须观察对应Actions结果。云端失败时不能把任务称为完成；应读取失败job日志，修正并再次推送，或者明确记录外部blocker。GitHub产物只证明自动化范围，不替代账号、真机、签名和人工发布验收。

当前workflow：`.github/workflows/ci.yml`。

| Job                             | Runner  | 全量职责                                                                     |
| ------------------------------- | ------- | ---------------------------------------------------------------------------- |
| Workspace, browsers, and builds | Ubuntu  | 全仓check/lint/test/build、三浏览器、Docs E2E、微信构建、构建产物            |
| Coverage and packages           | Ubuntu  | 覆盖率、外部tarball和生成报告漂移                                            |
| Windows C# WebView2 desktop     | Windows | Desktop check/test、C# Core、WinUI 3/WebView2、生产与Vite宿主smoke、发布产物 |

## 标准命令

在仓库根执行：

```powershell
pnpm check
pnpm test
pnpm build
pnpm lint
```

这些仍是全量标准命令，由GitHub Actions在push、pull request和手动运行时执行；本地按本节的风险分级选择focused子集。

- `check`：TypeScript、Svelte和workspace类型边界。
- `test`：Core、SvelteKit、ZUI、WebView、Admin、Desktop、ETL、Docs、微信和三个Plugin测试。
- `build`：所有Package声明产物、Admin/ETL/Docs/Desktop静态或服务端构建、微信生产构建、三个Plugin Artifact和Plugin CLI验证。
- `lint`：全仓Prettier检查和ESLint。

`ui/zui`已经包含实际Svelte组件、编译器fixture、SSR测试和浏览器矩阵，`svelte-check`必须保持0 errors、0 warnings。

## ZUI ICSS验收矩阵

实现合同见[ZUI ICSS生产架构](../zui/icss.md)。最低自动验收包括：

- DSL属性、token、keyword、unit、条件、嵌套selector和escape；
- canonical序列化、确定性hash、collision检查和Stylis输出；
- Svelte direct class、本地`$derived`、class组合、条件保护和回退诊断；
- SSR/hydration、50并发请求隔离和客户端规则接管；
- CSP nonce/hash、`inline-vars`和`class-rules`模式；
- Chromium、Firefox、WebKit中的动态变量和组件边界；
- 10,000次动态值变化后class、rule、style tag和结构cache均不增长；
- 真实Vite HMR结构替换与旧规则清理；
- `pnpm pack`后在外部SvelteKit fixture安装、check、build和SSR访问；
- compiler和server模块进入client bundle为0 B。

### ZUI标准命令

```powershell
pnpm --filter @zadmin/zui check
pnpm --filter @zadmin/zui test
pnpm --filter @zadmin/zui test:coverage
pnpm --filter @zadmin/zui build
pnpm --filter @zadmin/sveltekit test:zui-package
pnpm --filter @zadmin/docs test:e2e
pnpm --filter @zadmin/docs build
```

2026-08-25 拆包与重命名后的生产回归结果：

- `zui-core` 5个test files、19项测试通过；`zui-svelte`在Chromium、Firefox、WebKit共15个test files、81项测试通过；
- 10,000次状态变化后class、rule和style tag数量不变；
- `zui-core`覆盖率：statements 97.85%、branches 95.5%、functions 100%、lines 100%；
- `zui-svelte`覆盖率：statements 96.42%、branches 91.85%、functions 97.54%、lines 98.35%；
- Web Compiler branches 91.06%，Web ICSS branches 92.1%；
- 50个并发SSR请求无CSS串扰；
- 真实Vite HMR结构修改前后均为9条rule、1个style tag、0 console error；
- 当时拆分的Core与ZUI tarball在隔离SvelteKit项目安装、check、build和SSR 200通过；后续目录收口已取消独立`@zadmin/zui/core`公开入口；
- 外部fixture包含critical CSS和初始动态变量，compiler/server客户端文件0个；
- `pnpm audit --prod`无已知漏洞，gitleaks无泄漏。

2026-08-29基础设施加固后的外部验收：Core、ZUI和SvelteKit三个tarball在系统临时目录安装并frozen reinstall；fixture在未安装Shiki时实际执行`@zadmin/zui/testing`、`@zadmin/sveltekit/server`和`@zadmin/sveltekit/testing`，Svelte check、adapter-node生产build与真实Node SSR通过，client产物不含Shiki、workspace路径、compiler、testing或server入口。随后fixture安装Shiki、导入`@zadmin/zui/code`并再次check/build，`/code`真实SSR返回稳定纯文本源码。当前tree-shaken browser runtime gzip为9,507 bytes；8个基础组件增量为670–3,115 bytes，预算为3.25 KiB；ZCode壳增量为4,210 bytes，Shiki保持外部可选边界并使用6个允许语言、2个主题和JavaScript regex engine。

同一最终代码提交`a6ea25b`的GitHub Actions run `33256806135`已通过Workspace、Coverage/packages和Windows C# WebView2三个job；ZUI coverage为statements 96.49%、branches 90.02%、functions 97.5%、lines 98.53%。

## C# WebView公共层验收

重点命令：

```powershell
pnpm --filter @zadmin/webview check
pnpm --filter @zadmin/webview test:coverage
pnpm --filter @zadmin/webview build
pnpm --filter @zadmin/webview dotnet:build
pnpm --filter @zadmin/webview dotnet:test
pnpm --filter @zadmin/webview test:package
pnpm --filter @zadmin/desktop check
pnpm --filter @zadmin/desktop test
pnpm build:desktop
pnpm --filter @zadmin/desktop webview:smoke
pnpm --filter @zadmin/desktop webview:dev:smoke
```

2026-08-29公共层结果：

- 单一IDL生成34个TypeScript/C#协议method与28个DTO/enum，C# dispatcher按生成descriptor验证params，`generate:check`验证漂移；
- TypeScript 6个test files、24项测试通过；statements 98.16%、branches 90.15%、functions/lines 100%；
- timeout、AbortSignal、错误归一化、事件、资源scope、origin allowlist、browser fallback和fake bridge通过；
- 9个Svelte桌面组件check为0 errors/0 warnings；
- `net10.0` C# Core与合同测试零警告构建，验证origin、version、allowlist、dispatcher和resource dispose；
- Windows WinUI 3/WebView2真实生产页面、Vite开发宿主与JS→C#桥接smoke通过；portable ZIP为90,779,828 bytes，解包payload 233,775,520 bytes/533文件；
- 当前发布件未签名，MSIX/企业安装器和正式安装升级仍须单独验收。

## Svelte Miniapp与微信直编验收

重点命令：

```powershell
pnpm --filter @zadmin/miniapp check
pnpm --filter @zadmin/miniapp exec vitest --run tests
pnpm --filter @zadmin/miniapp build
pnpm --filter @zadmin/wechat-app check
pnpm --filter @zadmin/wechat-app test
pnpm --filter @zadmin/wechat-app build
```

2026-08-29直编阶段本地结果：

- `miniapp` 13个test files、41项测试通过；conformance覆盖runes、effect cleanup、props、component binding、生命周期、context、snippet、if/keyed each/key/await、boundary onerror恢复、class/style/event和嵌套组件；
- renderer树、App/Page runtime、平台scope与资源释放有自动化覆盖；事件按`data-zid`分发，`setData`在微任务内合并；
- 8个`M*`组件、独立Theme、`mcss()`和微信原生元素类型通过check/build；
- 微信宿主4项Node测试与4项TypeScript安全探针通过，实际生成15个原生文件并验证Worker声明；
- 生产源码、manifest和直编产物不含`@tarojs`，Miniapp不依赖ZUI；
- coverage、空目录tarball安装和全仓门禁由GitHub Actions执行，避免本地重复阻塞；
- 微信开发者工具直编WebView target已完成页面截图、page stack、console、`#counter`点击与count更新；自动直编把文案改为hot再恢复，两次完整Page remount均显示新源码；
- 新runtime真机、账号、支付、手机号、权限、上传与硬件能力仍不得继承旧Taro证据。
  -WebView完整组件矩阵为simulator-verified；指定Android真机已验证首页渲染、导航/卸载及8项明确capability；Skyline仅build-verified，详见[renderer报告](../miniapp/wechat-renderers.md)。

生产内容必须断言以下字符串在非source-map JS中为0：

```text
__ZADMIN_BUILD_ID__
__zadmin_build_id__
ZADMIN_WECHAT_SUPERVISED
FakePlatformDriver
@zadmin/miniapp/testing
workspace绝对路径
```

完整证据见[Svelte Miniapp微信直编验收](../miniapp/wechat-production-acceptance.md)。微信upload不属于默认测试命令，必须另获用户授权。

## Core覆盖矩阵

`packages/core/tests/`当前覆盖：

- typed token、`inject`、`injectOptional`和`injectPlugin`类型推断；
  -标准 `@service()`和纯Factory两条路径；
  -Host Module和Plugin Module；
  -公开/私有Provider、命名空间和Host→Plugin非法依赖；
  -required waiting、optional `undefined`和依赖后来出现；
  -Provider循环与“Module互相依赖但Bean图无环”；
  -create/prepare/health/activate/deactivate/dispose顺序；
  -dependents级联重建和无关Module对象保持；
  -candidate prepare失败保留旧实例；
  -candidate activate失败回滚；
  -dispose泄漏标记、后续replacement阻断和Host关闭报错；
  -未成功返回的factory不调用dispose；
  -health从unhealthy恢复active；
  -诊断observer失败隔离；
  -并发reconcile串行；
  -Core HMR retained Runtime；
  -Manifest Protocol v2和entry安全；
  -server/client独立revision；
  -Plugin Manager动态import、等待和client-only更新；
  -peerDependencies/Manifest一致性和runtime import禁止；
  -archive路径穿越、文件/字节上限、安装版本切换与状态恢复。

## SvelteKit覆盖矩阵

`ui/sveltekit/tests/`覆盖：

-静态、参数和wildcard路由优先级；
-候选route reservation；
-Scope activate后发布、dispose后撤销；
-重复和非法route提前失败；
-Client Artifact预加载、批量替换和失败回滚；
-activate中途注册页面后抛错的自动清理；
-重复页面owner拒绝。

## Plugin集成

- Approval测试实际class decorator Provider、Host能力注入、路由激活/停止。
- CRM测试没有Approval时optional启动，以及 `PluginApi<CrmPlugin>`把 `ApprovalRecord`自然传递到下游类型。
- ERP测试先无Approval启动，再安装Approval并自动获得新API。
- Admin测试Host Module组合、Auth静态路由，以及Runtime拒绝插件后安装状态自动恢复。

## Plugin Artifact验证

每个Plugin `pnpm build`包含：

```powershell
vite build
tsc -p tsconfig.build.json
node ../../packages/core/src/cli.ts validate dist
```

手工复核产物：

```powershell
rg -n "from ['\"]@zadmin/approval" plugins/crm/dist/server/index.js
Get-Content plugins/crm/dist/types/contract.d.ts
Get-Content plugins/crm/dist/types/service.d.ts
```

预期：

- server JS没有上游插件runtime import；
- `.d.ts`保留 `@zadmin/approval`类型引用；
- `dist/zadmin.plugin.json`协议为2；
  -CLI输出通过验证的绝对dist路径。

## 真实HMR验收

自动测试不能证明文件watch、EventSource和浏览器DOM连通，应在影响Runtime/HMR后执行：

```powershell
pnpm dev:admin
```

### 基线

```powershell
Invoke-RestMethod http://localhost:5173/__zadmin/runtime |
  ConvertTo-Json -Depth 8

Invoke-RestMethod http://localhost:5173/__zadmin/plugins/client |
  ConvertTo-Json -Depth 5

Invoke-RestMethod http://localhost:5173/__zadmin/health
```

预期：8个Module/Provider active，health HTTP 200。

### 服务端修改

1. 记录Approval、CRM、ERP和Host Module generation。
2. 修改 `plugins/approval/src/server/service.ts`中的非类型返回值。
3. 等待Approval Vite watcher完成。
4. 请求 `/approval/api/status`确认新值。
5. 再取Runtime snapshot。

预期：

- Approval、CRM、ERP generation变化；
- Auth、Postgres、Redis、OSS、SvelteKit generation不变；
  -client revision不变；
  -浏览器当前Plugin页面不reload。

### 客户端修改

1. 记录三个server generation和Approval client revision。
2. 修改 `plugins/approval/src/client/index.ts`的页面path或Svelte页面文本。
3. 保持浏览器页面打开并等待EventSource消息。

预期：

-Approval client revision变化；
-三个server generation均不变；
-DOM自动更新，无整页reload、无console error。

### 上游类型修改

1. 临时修改Approval公开方法签名，并同步其实现。
2. 观察CRM、ERP TypeScript watcher。
3. 恢复签名。

预期：下游立即报错，恢复后自动0 error；不需要运行时import上游Plugin。

验收后必须恢复临时源码，按 `Ctrl+C`关闭统一dev进程，并确认没有ZAdmin Vite/tsc watcher残留。

## 安装与打包

```powershell
pnpm --filter @zadmin/approval pack:plugin
```

安装链重点验证：

-相同ID/version/相同revision幂等；
-相同ID/version/不同内容拒绝；
-禁用撤销Plugin和dependents；
-重新启用恢复waiting dependents；
-无效server definition使Runtime失败，`installed.json`恢复原状态；
-上传临时文件在成功和失败后均删除。

## 提交前

```powershell
git diff --check
git status --short --branch
git log -5 --oneline
```

确认：

-工作树只包含当前阶段文件；
-没有并发工具修改相同文件；
-没有dev watcher持有产物；
-所有临时目录和浏览器标签已清理；
-每个阶段提交都经过与风险相称的验证。
