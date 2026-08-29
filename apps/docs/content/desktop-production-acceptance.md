# C# WebView2 Windows桌面端生产验收

验收日期：2026-08-29。当前桌面实现是`@zadmin/webview` + C# `net10.0` + WinUI 3 + Windows App SDK 2.4.0 + WebView2 SDK 1.0.4129.50。`apps/desktop`的一套SvelteKit/ZUI SPA同时用于浏览器、Vite开发宿主和Windows发布件；当前工作区不再包含Tauri、Rust、`src-tauri`或`@tauri`依赖。

## 已通过门禁

- 单一IDL生成34个TypeScript/C#协议method与28个DTO/enum；C# method descriptor在dispatch前按生成类型验证params，`generate:check`验证双端漂移；
- TypeScript 6个test files、24项测试通过；statements 98.16%、branches 90.15%、functions/lines 100%；
- `apps/desktop` 2个test files、4项测试通过，Svelte check为0 errors/0 warnings；
- C# Core、合同测试和Windows target以`net10.0`零warning、零error构建；
- 生产宿主从`https://app.zadmin.local/`加载真实SvelteKit/ZUI页面，页面hydration、WebView2 bridge和JS→C# `app.snapshot`通过，捕获的page error为空；
- 生产HTML的内联SvelteKit bootstrap由C#按内容计算CSP SHA-256 hash；没有把`script-src`放宽为`unsafe-inline`；
- native侧再次验证origin、协议版本、1 MiB消息上限、method allowlist、外链origin、用户选择的文件范围和敏感操作确认；
- 远程导航、新窗口、网页权限和下载默认拒绝，进程失败最多自动reload三次；
- Vite开发宿主只允许显式loopback HTTP origin，由native注入匹配origin的不可写标记；真实smoke确认Vite client、页面hydration、bridge、C#系统信息和退出后5173/宿主进程零残留；
- build与Vite/C# Debug并行准备，首次依赖优化不会与C#编译串行叠加；失败和正常退出都按精确PID终止进程树；
- Windows x64发布目录包含533个payload文件、233,775,520 bytes；portable ZIP为90,779,828 bytes；`manifest.json`和533条SHA-256位于产物内；
- SvelteKit asset hash固定为hex，避免Windows PRI把`-`后的片段误判为资源qualifier；WinUI XBF在publish阶段显式复制，发布exe真实启动通过。

## HMR与开发边界

`pnpm dev:desktop`同时启动一个Vite owner和一个C# Debug宿主。Vite监听Svelte、ZUI和页面源码，WebView直接连接其HMR client；C#修改仍需要重建宿主。自动smoke当前验证“Vite client存在、页面hydration、native bridge可用和退出清理”，没有通过临时改写业务源码来伪造一次视觉HMR结果。

开发子进程环境会过滤名称中含`AUTH`、`PASSWORD`、`SECRET`、`TOKEN`或`API_KEY`的变量，避免Vite调试输出或页面工具链继承无关凭据。

## 明确限制

- 当前self-contained C#目录相对迁移前11,709,952-byte Tauri exe约19.96x，portable ZIP相对迁移前2,532,304-byte NSIS installer约35.85x。主要差距来自内置.NET 10和Windows App SDK，不是Svelte/ZUI bundle；若未来改为framework-dependent/MSIX dependency可减小体积，但必须增加runtime安装与升级门禁；
- 当前产物是self-contained portable Windows x64目录/ZIP，依赖系统的WebView2 Evergreen runtime；宿主启动会检测runtime并在缺失时显示明确失败页；
- portable ZIP尚未做Authenticode签名；正式对外分发前必须配置证书或CI签名服务；
- MSIX、企业安装器、升级和静默安装/卸载尚未作为当前C#链的已通过证据，不能继承旧Tauri/NSIS记录；
- 文件/文件夹选择器、共享剪贴板、通知视觉、外部浏览器打开、Exit和Relaunch保留受监督验收；自动化没有替用户选择文件、读取剪贴板、弹通知或退出工作中的应用；
- Windows arm64在公共target类型中保留，但当前产品配置和本地发布只包含`windows-x64`；macOS/Linux不在v1范围；
- 本机只有.NET 11预览SDK/runtime，因此源码目标固定为稳定`net10.0`，合同测试使用显式major roll-forward；GitHub Actions安装.NET 10 SDK复核真实目标，不把本机预览runtime当成发布依赖。

## 复核命令

```powershell
pnpm --filter @zadmin/webview check
pnpm --filter @zadmin/webview test:coverage
pnpm --filter @zadmin/webview dotnet:build
pnpm --filter @zadmin/webview dotnet:test
pnpm --filter @zadmin/desktop check
pnpm --filter @zadmin/desktop test
pnpm build:desktop
pnpm --filter @zadmin/desktop webview:smoke
pnpm --filter @zadmin/desktop webview:dev:smoke
```

WinUI 3的WebView2与Evergreen模型遵循[Microsoft WebView2 in WinUI 3](https://learn.microsoft.com/windows/apps/develop/ui/controls/webview2)；未打包通知注册遵循[Microsoft app notifications for .NET](https://learn.microsoft.com/windows/apps/develop/notifications/app-notifications/app-notifications-dotnet)。
