# Tauri Windows 桌面端生产验收

状态：第一阶段实现与本机生产验收完成。

验收日期：2026-08-26。目标平台：Windows 11 x64，Rust MSVC target为`x86_64-pc-windows-msvc`。

## 最终形态

```text
ui/
  sveltekit/
  svelte-taro/
  tauri/
  zui-core/
  zui-svelte/
  zui-taro/

apps/
  desktop/
```

- `@zadmin/tauri`根入口只包含系统API、typed result/error、权限可用性、资源生命周期和命令类型推导，不加载Svelte或ZUI；
- `@zadmin/tauri/svelte`提供9个桌面组件，普通视觉原语全部复用`@zadmin/zui`；
- `@zadmin/tauri/testing`提供完整fake driver和fixture；
- `apps/desktop`使用SvelteKit SPA和`adapter-static`，生产页面由`tauri.localhost`本地协议加载；
- 生产应用不启动Node、Vite、SvelteKit SSR、sidecar或本地HTTP后端；
- 不存在`zui-desktop`；原`@zadmin/zui-web`已直接改名为`@zadmin/zui`，仓库没有兼容转发包。

## 强类型IPC

自定义Rust IPC统一使用精确锁定的：

```text
tauri-specta     2.0.0-rc.25
specta           2.0.0-rc.25
specta-typescript 0.0.12
```

Rust command、event、Channel、request、response和tagged error是唯一schema；生成文件位于：

```text
apps/desktop/src/lib/generated/tauri.ts
```

已验证：

- `Builder::commands()`和`events()`各集中调用一次；
- typed event在Tauri setup中`mount_events()`；
- `build.rs`通过`AppManifest::commands`生成三个自定义command permission；
- 生成bindings连续两次Rust export + Prettier后SHA-256一致；
- 正常结果、tagged domain error和typed Channel均在真实静态应用中通过；
- 前端不会把Tauri transport string误认为Rust错误联合，未知错误统一归一化为`transport-error`。

真实结果：

```text
Typed IPC schema 1/1: windows x86_64; 12 capabilities
Typed error: unsupported: camera
Typed channel: 3 delivered / 3 received
```

## 系统能力与权限

第一阶段接入：App、OS、Window、Dialog、Filesystem、Clipboard、Notification、Opener、Process、Store、Log和Window State。Updater只有禁用合同，没有注册插件或权限。

生产capability仅授予`main`窗口和`windows`平台。已自动断言：

- 不使用`core:default`、`notification:default`、`opener:default`；
- 不存在Shell、HTTP、Updater、远程页面或wildcard window permission；
- 文件scope只有`$APPDATA/zadmin/**`和`$APPCACHE/zadmin/**`；
- Opener只有`https://github.com/**`和`https://v2.tauri.app/**`；
- 三个自定义command均使用生成的`allow-*` permission；
- `withGlobalTauri=false`；
- production CSP没有`unsafe-eval`；
- NSIS安装模式为`currentUser`，不触发UAC。

真实安全探针全部通过：

```text
Filesystem: desktop-ready; roundtrip and cleanup passed.
Store: {"ready":true,"schema":1}
Log: written
Window state: .window-state.json
```

## 组件与测试

首批组件：

1. `DesktopProvider`
2. `WindowFrame`
3. `WindowTitleBar`
4. `WindowControls`
5. `FilePickerButton`
6. `ClipboardButton`
7. `ExternalLink`
8. `NotificationButton`
9. `SystemInfo`

`@zadmin/tauri`验收结果：

```text
5 test files
25 tests
statements 96.97%
branches 85.22%
functions 99.32%
lines 98.62%
Svelte check: 0 errors, 0 warnings
```

浏览器组件测试使用Chromium和fake driver，覆盖文件/剪贴板/通知/外链/窗口队列、权限失败、Provider缺失和listener释放。测试曾发现连续窗口操作会被`busy`状态吞掉，最终实现改为串行action queue并完成回归。

外部clean-package验收把`@zadmin/zui/core`、`@zadmin/zui`和`@zadmin/tauri`打为tarball，在系统临时目录完成：

- 非workspace安装；
- frozen reinstall；
- 根入口、`/svelte`、`/testing`类型解析；
- `svelte-check` 0 errors/0 warnings；
- TypeScript noEmit；
- `svelte-package`生产构建；
- 产物不包含源码workspace绝对路径。

## 开发态HMR

Windows实测发现并修复Vite误监听`src-tauri/target`导致锁定DLL触发`EBUSY`的问题。现在：

- Vite忽略`src-tauri/target/**`和`src-tauri/gen/**`；
- Tauri继续单独监听Rust源码；
- Tauri插件和Stylis通过linked dependency include预优化，新设备首次启动不再发生依赖发现后整页重载；
- 页面文本修改与回滚连续两次得到`hmr update /src/routes/+page.svelte`；
- 开发退出后Vite端口和`zadmin-desktop`进程均为0；
- Windows ICO改为确定性生成的6层32-bit DIB，不再出现`libpng iCCP`警告。

## 全仓回归

以下命令全部通过：

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm lint
pnpm --filter @zadmin/tauri test:coverage
pnpm --filter @zadmin/tauri test:package
pnpm --filter @zadmin/desktop bindings
pnpm --filter @zadmin/desktop rust:fmt
pnpm --filter @zadmin/desktop rust:check
pnpm --filter @zadmin/desktop rust:clippy
pnpm --filter @zadmin/desktop rust:test
pnpm --filter @zadmin/docs test:e2e
pnpm --filter @zadmin/docs build-storybook
gitleaks git --redact --no-banner
```

Gitleaks扫描54个提交、约2.28MB，无泄漏。原Web、微信、插件系统、Admin、Docs和ETL回归全部通过。

## Windows发布件

最终构建命令：

```powershell
pnpm build:desktop
```

产物：

| 产物                                 |             大小 | SHA-256                                                            |
| ------------------------------------ | ---------------: | ------------------------------------------------------------------ |
| `zadmin-desktop.exe`                 | 11,709,952 bytes | `5D11F2BB9C0D971442C2E6662950DE13C35A4301B9BE1CFAFD6E818D4357BE45` |
| `ZAdmin Desktop_0.1.0_x64-setup.exe` |  2,532,304 bytes | `4C9DC86F614C2ECD1EA4B243DF80351DDF1C3F9251614E395FC2190F608D2235` |

主程序PE检查为x64、Windows GUI subsystem。NSIS已执行两轮真实current-user静默安装/卸载：

```text
InstallExit=0
Publisher=ZAdmin
UninstallExit=0
RegistryRemaining=false
DirectoryRemaining=false
ProcessRemaining=false
```

安装前确认不存在同名既有安装；没有覆盖用户软件。验收结束后，测试AppData、WebView数据、日志、窗口状态、临时bindings快照、失败tarball夹具和未使用移动端图标均已移入回收站，仍可恢复。

## 明确边界

- 当前exe和installer为`NotSigned`。代码签名证书、私钥或企业签名服务未提供，因此不能把当前文件描述为已签名公网发布件；正式外部分发前必须签名主程序、安装器和卸载器，并在CI中保护密钥；
- 原生Dialog、共享剪贴板、Windows通知视觉、外部Opener以及Exit/Relaunch没有在无人值守验收中触发，避免改变用户状态；它们的类型、fake、权限和拒绝路径已自动验证，应在发布候选上做受监督验收；
- 第一阶段只承诺Windows 11 x64 + NSIS，不承诺Windows ARM64、Windows 10、macOS、Linux、MSI或移动端；
- Updater、全局快捷键、自启动、单实例、托盘、Deep Link和持久化Dialog scope属于下一阶段；
- Rust 1.97的MSVC linker会把“创建DLL import library”输出为信息型`linker_messages` warning；它不来自项目代码，`cargo check`和Clippy `-D warnings`均通过。

官方边界参考：

- [Tauri SvelteKit接入](https://v2.tauri.app/start/frontend/sveltekit/)
- [Tauri capabilities](https://v2.tauri.app/security/capabilities/)
- [Tauri官方插件](https://v2.tauri.app/plugin/)
- [Windows installer](https://v2.tauri.app/distribute/windows-installer/)
- [tauri-specta](https://github.com/specta-rs/tauri-specta)
