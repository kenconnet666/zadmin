# ZAdmin Desktop

Windows x64 C# WinUI 3 + WebView2 capability host. SvelteKit通过`adapter-static`生成一套SPA源码；生产宿主从`https://app.zadmin.local`虚拟origin加载本地资源，不启动Node、Vite、SSR、sidecar或HTTP后端。

```powershell
pnpm dev:desktop
pnpm check:desktop
pnpm test:desktop
pnpm build:desktop
pnpm --filter @zadmin/desktop webview:smoke
pnpm --filter @zadmin/desktop webview:dev:smoke
```

开发命令并行准备Vite和C# Debug宿主，WebView只允许显式loopback origin；退出时按PID终止宿主与Vite进程树。生产构建生成self-contained Windows目录、`manifest.json`、`checksums.txt`和portable ZIP。

平台能力通过34方法版本化协议调用C#。生产页面只允许构建时计算SHA-256 hash的内联bootstrap；导航、权限、下载、外链、文件路径和敏感操作在native侧再次校验。

当前portable发布件未签名。正式外部分发前仍需配置Authenticode签名，并单独完成MSIX或企业安装器、升级和卸载验收。
