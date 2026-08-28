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
  → Docs E2E与Storybook
  → 覆盖率阈值
  → 外部tarball安装验收
  → 微信生产构建
  → Windows Rust/Tauri与安装包
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

| Job                               | Runner  | 全量职责                                                                       |
| --------------------------------- | ------- | ------------------------------------------------------------------------------ |
| Workspace, browsers, and builds   | Ubuntu  | 全仓check/lint/test/build、三浏览器、Docs E2E、微信构建、构建产物              |
| Coverage, packages, and Storybook | Ubuntu  | 覆盖率、外部tarball、Storybook和生成报告漂移                                   |
| Windows desktop and Rust          | Windows | Desktop check/test、Rust fmt/check/clippy/test、bindings、debug/release bundle |

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
- `test`：Core、SvelteKit、ZUI、Tauri、Admin、Desktop、ETL、Docs、微信和三个Plugin测试。
- `build`：所有Package声明产物、Admin/ETL/Docs/Desktop静态或服务端构建、微信生产构建、三个Plugin Artifact和Plugin CLI验证。
- `lint`：全仓Prettier检查和ESLint。

`ui/zui`已经包含实际Svelte组件、编译器fixture、SSR测试和浏览器矩阵，`svelte-check`必须保持0 errors、0 warnings。

## ZUI ICSS验收矩阵

实现合同见[ZUI ICSS生产架构](./zui-icss.md)。最低自动验收包括：

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
pnpm --filter @zadmin/docs test:e2e
pnpm --filter @zadmin/docs build-storybook
```

2026-08-25 拆包与重命名后的生产回归结果：

- `zui-core` 5个test files、19项测试通过；`zui-svelte`在Chromium、Firefox、WebKit共15个test files、81项测试通过；
- 10,000次状态变化后class、rule和style tag数量不变；
- `zui-core`覆盖率：statements 97.85%、branches 95.5%、functions 100%、lines 100%；
- `zui-svelte`覆盖率：statements 96.42%、branches 91.85%、functions 97.54%、lines 98.35%；
- Web Compiler branches 91.06%，Web ICSS branches 92.1%；
- 50个并发SSR请求无CSS串扰；
- 真实Vite HMR结构修改前后均为9条rule、1个style tag、0 console error；
- `@zadmin/zui/core@0.1.0`与`@zadmin/zui@0.1.0` tarball在隔离SvelteKit项目安装、check、build和SSR 200通过；
- 外部fixture包含critical CSS和初始动态变量，compiler/server客户端文件0个；
- `pnpm audit --prod`无已知漏洞，gitleaks无泄漏；Taro开发工具链审计例外在最终交接单独记录。

## Tauri Windows桌面端验收

完整证据见[Tauri Windows桌面端生产验收](./desktop-production-acceptance.md)。标准命令：

```powershell
pnpm --filter @zadmin/tauri check
pnpm --filter @zadmin/tauri test:coverage
pnpm --filter @zadmin/tauri test:package
pnpm --filter @zadmin/desktop check
pnpm --filter @zadmin/desktop test
pnpm --filter @zadmin/desktop bindings
pnpm --filter @zadmin/desktop rust:fmt
pnpm --filter @zadmin/desktop rust:check
pnpm --filter @zadmin/desktop rust:clippy
pnpm --filter @zadmin/desktop rust:test
pnpm --filter @zadmin/desktop tauri:build:debug
pnpm build:desktop
```

2026-08-26第一阶段结果：

- `@zadmin/tauri` 5个test files、25项测试通过；statements 96.97%、branches 85.22%、functions 99.32%、lines 98.62%；
- 根入口产物没有Svelte/ZUI import，`/svelte`和`/testing`分别隔离；
- 三包tarball在空临时目录完成非workspace安装、frozen reinstall、check和build；
- `apps/desktop` 3个test files、7项测试通过，Svelte check为0 errors/0 warnings；
- Rust fmt、all-target check、Clippy `-D warnings`、2项MockRuntime测试和bindings确定性通过；
- `tauri dev`连续两次页面HMR通过，Vite不再监听锁定的Rust target；
- 真实静态exe通过runtime report、tagged error、Channel、AppData、Store、Log和Window State探针；
- release x64 GUI和NSIS current-user installer完成静默安装/卸载，注册表、安装目录和进程均无残留；
- 当前发布件未签名，正式外部分发前必须补Authenticode签名；Dialog、共享剪贴板、通知视觉、Opener和进程操作保留受监督验收。

## Svelte Taro与微信验收

重点命令：

```powershell
pnpm --filter @zadmin/miniapp check
pnpm --filter @zadmin/miniapp test:coverage
pnpm --filter @zadmin/zui-taro check
pnpm --filter @zadmin/zui-taro test:coverage
pnpm --filter @zadmin/wechat-app build
pnpm --filter @zadmin/miniapp test:package
pnpm --filter @zadmin/miniapp benchmark
```

2026-08-25最终结果：

- `miniapp` 13个test files、43项测试通过；statements 82.11%、branches 67.83%、functions 87.44%、lines 85.71%；
- compiler目录statements 95.12%，renderer statements/lines 96.42%；
- `zui-taro` 2个test files、4项测试通过；statements 85.62%、branches 72.72%、functions 93.47%、lines 88.52%；
- conformance覆盖runes、effect cleanup、props、component binding、生命周期、context、snippet、if/keyed each/key/await、boundary onerror恢复、class/style/event和嵌套组件；
- renderer树与App/Page runtime分别完成100次mount/unmount；platform listener/session/connection完成100次scope释放后回到基线；
  -32项capability catalog、PlatformError脱敏、login/phone branded code、支付服务端权威、Taro/fake driver、配置诊断、native type和静态Taro module通过；
  -微信开发者工具中WebView组件交互、8项device-verified capability、安全文件清理、连续两次Worker create/message/terminate和wx API mock/restore通过；微信宿主另有7项Node测试与4项TypeScript探针测试；
  -四个tarball在空临时目录安装，frozen reinstall、外部类型、单Svelte/Taro runtime和生产Taro build通过；
  -同场景200个keyed节点的三轮交替基准：Svelte 11,169ms，Taro Solid 10,969ms，中位比1.018x，满足≤1.25x；
  -WebView完整组件矩阵为simulator-verified；指定Android真机已验证首页渲染、导航/卸载及8项明确capability；Skyline仅build-verified，详见[renderer报告](./wechat-renderers.md)。

生产内容必须断言以下字符串在非source-map JS中为0：

```text
__ZADMIN_BUILD_ID__
__zadmin_build_id__
ZADMIN_WECHAT_SUPERVISED
FakePlatformDriver
@zadmin/miniapp/testing
workspace绝对路径
```

完整证据见[Svelte Taro生产验收](./wechat-production-acceptance.md)。微信upload不属于默认测试命令，必须另获用户授权。

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
