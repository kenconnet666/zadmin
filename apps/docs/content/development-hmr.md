# 开发态热重载

## 启动

```powershell
pnpm dev:admin
```

正常进程形态：

```text
1 × apps/admin Vite dev server
3 × plugin Vite build --watch
3 × plugin tsc --noEmit --watch
```

每个插件的 `dev`脚本用 `pnpm --filter . --parallel`限制在当前package，不能省略 `--filter .`；否则每个插件会递归启动整个workspace，形成倍增 watcher。

## 三条独立更新链

### 1. 服务端代码

```text
src/server变化
  → Vite重新生成dist/server
  → Manifest最后写入，表示revision ready
  → Workspace Provider计算新serverRevision
  → PluginManager import candidate
  → ServiceContainer重建changed Plugin及dependents
  → Host Module和无关Plugin保持原generation
```

server change不会修改 `clientRevision`，浏览器不会无意义卸载页面。

### 2. 客户端代码

```text
src/client或Svelte组件变化
  → Vite重新生成dist/client
  → 新clientRevision
  → PluginManager只更新Artifact元数据，不碰服务端Container
  → EventSource通知浏览器
  → ClientPluginRuntime import新URL
  → 批量dispose旧页面并activate新页面
```

浏览器Shell和服务端generation不刷新。页面store在同一个batch末尾通知，因此不会显示中间半更新状态。

### 3. 上游公开类型

```text
Approval contract变化
  → Approval tsc watcher检查自身
  → CRM/ERP watcher检测到workspace依赖.d.ts/source变化
  → 下游调用立即出现或清除TypeScript错误
```

TypeScript watcher使用 `--noEmit`，类型变化不会写入Artifact，也不会制造运行时reload。Vite bundle中的 `import type`被擦除。

## Revision拆分

`loadPluginArtifact()`计算：

- `revision`：所有非sourcemap文件，供同版本不可变安装使用；
- `serverRevision`：Manifest、server和共享文件，忽略client/types；
- `clientRevision`：Manifest、client和共享文件，忽略server/types。

Workspace watcher比较 server/client revision集合，忽略只影响发布声明的 `dist/types`。

## 路由的候选Reservation

动态路由在 Plugin create阶段调用 `routes.register(context, route)`：

-立即规范化path、编译参数pattern并检测同candidate冲突；
-与另一个active owner冲突时立即失败；
-同一个Plugin旧generation的相同路由允许候选reservation；
-真正写入active route表发生在 Scope activate；
-candidate失败或dispose会清理reservation；
-旧Scope deactivate先撤销旧路由，再发布candidate路由。

因此热升级不需要在“提前占路由”和“切换时才发现语法错误”之间二选一。

## Static Package和Host HMR

修改 `packages/`下的静态服务包、`ui/sveltekit`或 Admin Host代码，属于静态依赖变化：

-SvelteKit触发SSR模块HMR；
-全局Retained Host串行dispose旧Host；
-旧Host释放成功后才创建新Host；
-EventSource bridge关闭所有旧stream，浏览器自动重连并在`connected`消息后刷新client artifacts。

如果旧Host存在leaked generation或释放失败，新Host不会在同进程里假装安全启动；开发终端会报告需要进程重启。

## Workspace watcher

-文件系统递归watch提供低延迟通知；
-2秒polling作为网络盘或丢事件恢复路径；
-150ms debounce合并一次构建中的多个写入；
-同一Runtime reconcile严格串行；
-运行中的refresh遇到新事件会设置pending并在当前操作后再扫描；
-Manifest由 Vite `writeBundle`最后复制，避免Runtime读到半个产物。

## 2026-08-23真实验收记录

在 Windows本机执行 `pnpm dev:admin`并使用真实浏览器验证：

-实际只有1个Admin Vite、3个Plugin Vite、3个Plugin tsc进程；
-修改Approval server后，Approval、CRM、ERP generation ID全部变化；5个Host Module generation ID完全不变；
-Approval server API立即返回新值；三个client revision完全不变；现有浏览器页面无reload且无console error；
-只修改Approval client route后，浏览器当前页面通过EventSource自动切换状态；三个server generation ID完全不变；
-恢复client代码后，未调用reload，浏览器自动重新显示Approval页面；
-临时破坏Approval `start()`签名后，CRM和ERP watcher在同一轮分别报告2个参数错误；恢复签名后两者自动回到0 error；
-所有临时源码变化、watcher和浏览器标签均已清理。

## 排错

### 页面没有更新

1. 检查 `/__zadmin/plugins/client`中的client revision是否变化。
2. 检查浏览器EventSource是否重连；Host HMR后旧bridge必须close stream。
3. 检查client bundle URL是否带当前revision。
4. 查看浏览器console；activate失败应回滚旧页面。

### 服务端没有更新

1. 检查Plugin watcher是否显示一次build完成。
2. 检查 `dist/zadmin.plugin.json`是否为最后写入的ready标记。
3. 比较 `/__zadmin/runtime`的server revision和generation。
4. 查看PluginManager失败事件或Runtime序列化Error。

### watcher倍增

检查插件 `dev`脚本必须是：

```json
"dev": "pnpm --filter . --parallel run \"/^dev:.*/\""
```

### 类型变化没有传播

1. 确认下游使用 `import type`从真实上游插件package导入。
2. 确认上游同时位于peerDependencies和devDependencies。
3. 确认每插件恰有一个 `tsc --noEmit --watch`进程。

## Windows C# WebView2 HMR

```powershell
pnpm dev:desktop
```

开发owner并行启动Vite和C# Debug build，随后直接启动生成的`ZAdmin.exe`。不用`dotnet run`的调试身份激活路径，因为该路径会丢失开发origin等自定义环境变量。

- WebView只允许`http://127.0.0.1:5173`显式loopback origin，native注入与当前origin一致的不可写bridge标记；
- Vite client在WebView内保持标准Svelte HMR，页面、ZUI和普通TypeScript修改不重启C#宿主；
- C#、XAML或协议生成物修改需要重建宿主，`generate:check`阻止TypeScript/C# method漂移；
- Vite首次启动约2.1秒；首次页面请求可能因依赖优化额外耗时，本实现让它与约18秒C# Debug build重叠，不串行等待两遍；
- 开发进程不继承名称中含`AUTH`、`PASSWORD`、`SECRET`、`TOKEN`或`API_KEY`的环境变量；
- 正常关闭和失败都按owner PID终止宿主与Vite进程树。自动smoke退出后已复核5173和`ZAdmin.exe`零残留。

```powershell
pnpm --filter @zadmin/desktop webview:dev:smoke
```

smoke验证loopback origin、Vite client、Svelte页面hydration、JS→C# bridge、页面error列表与资源清理，不临时改写业务源码伪造视觉HMR。

## 微信 Fast Refresh

微信使用独立命令和单一 watcher owner：

```powershell
pnpm dev:wechat
```

```text
miniapp dev
  ├─ apps/wechat/src watcher
  ├─ ui/miniapp/src watcher
  ├─ serial coalesced rebuild
  └─ native WeChat dist + build ID
```

- App、组件、Theme、compiler、runtime、platform、Worker和配置统一走直接微信target；没有Taro child和重复package watcher。
- 构建进行中收到的变化合并为下一轮，任意时刻只写一次`dist/wechat`；失败轮保留watcher并等待修复。
- 每次成功开发构建才更新bundle和微信storage中的build ID；失败构建保留上次ID，生产构建不含开发标记。
- DevTools优先依靠`dist/wechat`文件变化自动刷新；模拟器端到端耗时须在直编target获得授权会话后重新记录。

完整分类、边界和排错见[微信Fast Refresh](./wechat-fast-refresh.md)。
