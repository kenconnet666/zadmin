# 开发态热重载

## 启动

```powershell
pnpm dev:admin
```

根脚本并行启动：

```text
Admin Vite dev server
Approval Vite build --watch
ERP Vite build --watch
CRM Vite build --watch
```

插件一次构建同时生成 `dist/server/index.js` 和 `dist/client/index.js`，最后复制 `zadmin.plugin.json`。Workspace Provider 把 Manifest写入视为完整 revision ready信号，并用全部非 sourcemap文件计算 SHA-256。

## 两种变化语义

```text
Apps或Packages变化
  → 标准 Svelte HMR或完整 Host dispose/rebuild

Plugins变化
  → 保持 Admin Runtime instance
  → 只重载变化 Plugin和dependents
  → SSE通知浏览器重载对应 Client Plugin
```

Admin Vite watcher忽略 `plugins/*/dist`，避免产物变化触发全页 reload；Workspace Provider使用独立文件监听和轮询恢复网络盘/丢失事件。

## 服务端更新

```text
源码保存
  → Vite watch构建
  → content hash变化
  → PluginManager native import新 URL
  → Runtime反向停止受影响链
  → 激活新 Provider
  → 正向重启 dependents
```

构建失败不会发布 Manifest ready信号。Import或setup失败时 Manager恢复旧 App和旧 artifact集合。

## 浏览器更新

Admin 提供：

```text
GET /__zadmin/plugins/client
GET /__zadmin/plugins/client.js?id=...&revision=...
GET /__zadmin/plugins/events
```

浏览器 EventSource 收到变更后重新读取清单。ClientPluginRuntime预加载新模块、dispose旧页面、activate新页面；失败时恢复旧模块。浏览器 Shell和无关 Plugin不会刷新。

## 已验证行为

真实 Admin dev server和 in-app browser 已验证：

- Approval、ERP、CRM 从 workspace artifact动态加载；
- 修改 Approval服务端响应后 Runtime instance ID不变；
- Approval artifactRevision和revision更新；
- ERP、CRM作为 optional dependents重新 setup；
- 修改 Approval Svelte页面后已打开 DOM更新；
- Admin Vite没有输出插件 dist导致的 page reload；
- 浏览器控制台没有错误；
- 临时源码还原后再次正常重载。

## 调试

```text
GET /__zadmin/runtime
GET /__zadmin/plugins/client
GET /__zadmin/plugins/installed
GET /approval/api/status
GET /erp/api/status
GET /crm/api/status
```

依次检查：plugin watcher是否完成、dist Manifest是否存在、hash是否改变、Manager事件、Runtime state、client清单和浏览器控制台。

如果修改 Core、SvelteKit或 Admin Vite配置，预期 Host被 dispose/rebuild；这不属于 Plugin局部 HMR失败。
