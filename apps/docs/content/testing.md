# 测试与验收

## 标准命令

在仓库根执行：

```powershell
pnpm check
pnpm test
pnpm build
pnpm lint
```

- `check`：TypeScript、Svelte和workspace类型边界。
- `test`：Core、SvelteKit、Admin、ETL、Docs和三个Plugin测试。
- `build`：所有Package声明产物、三个SvelteKit生产构建、三个Plugin Artifact和Plugin CLI验证。
- `lint`：全仓Prettier检查和ESLint。

`packages/zui-web`已经包含实际Svelte组件、编译器fixture、SSR测试和浏览器矩阵，`svelte-check`必须保持0 errors、0 warnings。

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
pnpm --filter @zadmin/zui-web check
pnpm --filter @zadmin/zui-web test
pnpm --filter @zadmin/zui-web test:coverage
pnpm --filter @zadmin/zui-web build
pnpm --filter @zadmin/docs test:e2e
pnpm --filter @zadmin/docs build-storybook
```

2026-08-25 拆包与重命名后的生产回归结果：

- `zui-core` 5个test files、19项测试通过；`zui-web`在Chromium、Firefox、WebKit共15个test files、81项测试通过；
- 10,000次状态变化后class、rule和style tag数量不变；
- `zui-core`覆盖率：statements 97.85%、branches 95.5%、functions 100%、lines 100%；
- `zui-web`覆盖率：statements 96.42%、branches 91.85%、functions 97.54%、lines 98.35%；
- Web Compiler branches 91.06%，Web ICSS branches 92.1%；
- 50个并发SSR请求无CSS串扰；
- 真实Vite HMR结构修改前后均为9条rule、1个style tag、0 console error；
- `@zadmin/zui-core@0.1.0`与`@zadmin/zui-web@0.1.0` tarball在隔离SvelteKit项目安装、check、build和SSR 200通过；
- 外部fixture包含critical CSS和初始动态变量，compiler/server客户端文件0个；
- `pnpm audit --prod`无已知漏洞，gitleaks无泄漏；Taro开发工具链审计例外在最终交接单独记录。

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

`packages/sveltekit/tests/`覆盖：

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
