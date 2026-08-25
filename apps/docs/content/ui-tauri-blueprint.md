# UI Workspace 与 Tauri 桌面端蓝图

状态：已完成（2026-08-26）。本文规划的迁移、实现、阶段提交和Windows 11 x64生产验收均已完成；最终证据见[Tauri Windows桌面端生产验收](./desktop-production-acceptance.md)。

规划基线：2026-08-25，目标平台为 Windows 11 x64。第一阶段不承诺 Windows 10、Windows ARM64、macOS、Linux 或移动端。

## 1. 已拍板的方向

1. UI 和 Svelte 平台相关包统一从 `packages/` 迁入根目录 `ui/`。
2. `packages/sveltekit` 迁为 `ui/sveltekit`，包名继续是 `@zadmin/sveltekit`。
3. `packages/svelte-taro` 迁为 `ui/svelte-taro`，包名继续是 `@zadmin/svelte-taro`。
4. `packages/zui-core` 迁为 `ui/zui-core`，包名继续是 `@zadmin/zui-core`。
5. `packages/zui-taro` 迁为 `ui/zui-taro`，包名继续是 `@zadmin/zui-taro`。
6. `packages/zui-web` 迁为 `ui/zui-svelte`，包名直接从 `@zadmin/zui-web` 改为 `@zadmin/zui-svelte`。
7. 不保留 `@zadmin/zui-web` 兼容包，不增加重复的转发 package；仓库内和外部使用方执行一次明确迁移。
8. 新增 `ui/tauri`，包名为 `@zadmin/tauri`。
9. 不新增 `zui-desktop`；Tauri 的 Svelte 适配层和桌面专属组件统一放入 `@zadmin/tauri/svelte`。
10. 桌面端通用组件、Theme 和 ICSS 继续直接使用 `@zadmin/zui-svelte`。
11. `@zadmin/tauri` 同时承担两类职责：尽可能完整、强类型、受权限约束地接入本地系统 API，以及提供组合这些能力的桌面组件封装层。
12. Tauri 组件层可以封装 `@zadmin/zui-svelte`，但不能复制或改名转发普通 Button、Box、Stack 等 Web 组件。
13. 所有自定义 Rust command 和 event 统一通过 `tauri-specta` 生成 TypeScript bindings，不手写重复的 IPC 参数或返回类型。
14. 新增 `apps/desktop` 作为 Tauri + SvelteKit SPA 验收宿主。

## 2. Tauri 的运行形态

Tauri 的前端使用 Web 技术，但不是把应用实现为远程网站。在 Windows 11 上，SvelteKit 产物由系统 Microsoft Edge WebView2 渲染，通过 Tauri IPC 调用 Rust 宿主、官方插件和 Windows 系统能力。

```text
@zadmin/zui-svelte + SvelteKit SPA
              │
              ▼
       Windows WebView2
              │
              ▼
       @zadmin/tauri API
              │
              ▼
 Tauri IPC / permissions / scopes
              │
              ▼
   Rust / official plugins / Win32
```

因此桌面端不会复制一套 Web 组件库：

- `Box`、`Button`、`Stack`、`Text`、Theme、ICSS、表单和普通布局属于 `@zadmin/zui-svelte`；
- 桌面 Provider、窗口框架、标题栏、窗口按钮、文件选择和其他系统能力组件属于 `@zadmin/tauri/svelte`；
- 系统 API 属于 `@zadmin/tauri` 根入口；
- Tauri 组件可以组合 ZUI 视觉原语与一个或多个本地能力，但不能只为普通 ZUI 组件换名字；
- 组件不能直接散落 import 多个 Tauri 官方插件，而是依赖可注入的 `DesktopPlatform`。

Tauri 官方要求 SvelteKit 使用静态前端，推荐 SPA 模式；第一阶段使用 `@sveltejs/adapter-static`、`fallback: 'index.html'` 和根布局 `ssr = false`。生产应用不启动 Node、Vite、本地 HTTP 或 SvelteKit SSR server。

官方参考：

- [Windows 开发前置条件](https://v2.tauri.app/start/prerequisites/)
- [SvelteKit 接入](https://v2.tauri.app/start/frontend/sveltekit/)
- [前端运行边界](https://v2.tauri.app/start/frontend/)
- [Capabilities 权限模型](https://v2.tauri.app/security/capabilities/)

## 3. 目标仓库目录

```text
C:\code\zadmin
├─ apps/
│  ├─ admin/
│  ├─ desktop/
│  ├─ docs/
│  ├─ etl/
│  └─ wechat/
│
├─ packages/
│  ├─ auth/
│  ├─ core/
│  ├─ drizzle/
│  ├─ oss/
│  ├─ postgres/
│  └─ redis/
│
├─ plugins/
│  ├─ approval/
│  ├─ crm/
│  └─ erp/
│
└─ ui/
   ├─ sveltekit/
   ├─ svelte-taro/
   ├─ tauri/
   ├─ zui-core/
   ├─ zui-svelte/
   └─ zui-taro/
```

目标数量与形态：

| 目录        | 直接子目录数 | 规则                               |
| ----------- | -----------: | ---------------------------------- |
| `apps/`     |            5 | 全部是应用目录                     |
| `packages/` |            6 | 全部是非 UI 通用依赖包             |
| `plugins/`  |            3 | 全部是业务插件目录                 |
| `ui/`       |            6 | 全部是 UI、Svelte 平台或桌面能力包 |

根集合目录不混入 README、共享配置或工具脚本。每个独立 package/app 根目录允许 `package.json`、TypeScript 配置、Svelte 配置、Cargo 配置等标准例外。

Workspace 调整为：

```yaml
packages:
  - apps/*
  - packages/*
  - plugins/*
  - ui/*
```

## 4. 包职责和公开名称

| 物理路径         | npm 包名              | 职责                                                                    |
| ---------------- | --------------------- | ----------------------------------------------------------------------- |
| `ui/zui-core`    | `@zadmin/zui-core`    | 平台无关 Theme、Token、ICSS Program、设计 Props                         |
| `ui/zui-svelte`  | `@zadmin/zui-svelte`  | Web/WebView2 Svelte 组件、ICSS runtime/compiler、SvelteKit SSR 集成     |
| `ui/zui-taro`    | `@zadmin/zui-taro`    | Taro/微信自定义 renderer 专用组件和 ICSS 子集                           |
| `ui/svelte-taro` | `@zadmin/svelte-taro` | Svelte→Taro compiler、renderer、runtime、微信平台能力                   |
| `ui/sveltekit`   | `@zadmin/sveltekit`   | 动态插件页、客户端插件 runtime、SvelteKit host module                   |
| `ui/tauri`       | `@zadmin/tauri`       | Tauri/Windows 系统 API、权限与生命周期、Svelte 桌面适配层和系统能力组件 |

`@zadmin/zui-web` → `@zadmin/zui-svelte` 是唯一包名 breaking change。新名称明确表达它是 Svelte renderer，同时可运行在浏览器和 Tauri WebView2；其他四个现有包保持 npm 名称、exports 和类型传播方式不变。

若 `@zadmin/zui-web` 尚未发布到 registry，则 `@zadmin/zui-svelte` 延续当前 `0.1.0` 实现历史；若已经发布，则发布迁移说明并对旧包标记 deprecated，但仓库内不保留兼容转发包。

## 5. 最终依赖图

```text
@zadmin/core
    ▲
    └──────────── @zadmin/sveltekit

@zadmin/zui-core
    ├──────────── @zadmin/zui-svelte
    │                 ▲
    │                 ├──────── apps/admin
    │                 ├──────── apps/docs
    │                 └──────── apps/desktop
    │
    └──────────── @zadmin/zui-taro
                      ▲
                      └──────── apps/wechat

@zadmin/svelte-taro ─────────── apps/wechat
        ▲
        └──── dev/runtime ───── @zadmin/zui-taro

@zadmin/tauri
    ├──────────── apps/desktop
    └─ /svelte ── apps/desktop
                     ▲
                     └──────── @zadmin/zui-svelte
```

约束：

- `@zadmin/zui-svelte` 不依赖 Tauri；普通浏览器项目可以独立使用；
- `@zadmin/tauri` 根入口不 import Svelte 或 ZUI；
- `@zadmin/tauri/svelte` 以 Svelte 与 `@zadmin/zui-svelte` 为 peer dependency；
- `@zadmin/tauri/testing` 不能进入生产 bundle；
- `@zadmin/svelte-taro` 不依赖 ZUI；
- `@zadmin/zui-taro` 不依赖 Web renderer；
- `apps/desktop` 不依赖 `apps/admin` 的 SSR 产物。

## 6. 目录一致性整理

### 6.1 保持不拆的目录

以下目录当前条目密度已经合适，不做形式主义拆分：

- `ui/svelte-taro`：8 个根条目；
- `ui/svelte-taro/src`：8 个目录 + `index.ts`；
- `ui/svelte-taro/src/platform`：9 个代码文件；
- `ui/svelte-taro/src/runtime`：5 个代码文件；
- `ui/sveltekit/src/lib`：7 个代码文件；
- `ui/zui-core`：7 个根条目。

`index.ts` 是 package public entry，属于明确允许的特殊文件。

### 6.2 适当整理的目录

```text
ui/zui-svelte/src/lib/
├─ compiler/
├─ components/
├─ icss/
├─ runtime/
├─ sveltekit/
├─ theme/
└─ index.ts
```

原 `internal.ts` 移到 `runtime/internal.ts`，但公开路径继续是：

```text
@zadmin/zui-svelte/internal
```

```text
ui/zui-taro/src/
├─ compiler/
├─ components/
├─ icss/
├─ runtime/
└─ index.ts
```

原 `internal.ts` 并入 `runtime/internal.ts`，公开路径继续是：

```text
@zadmin/zui-taro/internal
```

物理整理和包名重命名分开提交，避免一次变更同时包含多个故障来源。

## 7. `@zadmin/zui-svelte` 重命名合同

迁移：

```text
@zadmin/zui-web           → @zadmin/zui-svelte
@zadmin/zui-web/compiler  → @zadmin/zui-svelte/compiler
@zadmin/zui-web/internal  → @zadmin/zui-svelte/internal
@zadmin/zui-web/sveltekit → @zadmin/zui-svelte/sveltekit
```

保持不变：

- class-only `icss()` API；
- Theme 与 Token 行为；
- compiler 对安全动态叶子的优化；
- SSR Registry；
- CSP/HMR；
- Provider、Box、Stack、Text、Button；
- plain TypeScript runtime fallback；
- 外部可发布性。

需要更新的已知范围至少包括：

- 32 个当前源码、测试、应用和文档文件，共 109 处旧名称引用；
- `apps/admin` imports 与 Vite preprocess；
- `apps/docs` imports、Storybook 与 Svelte config；
- `ui/zui-svelte` 自引用和 compiler 默认 module 名；
- `ui/svelte-taro` 外部 tarball acceptance fixture；
- `pnpm-lock.yaml` importer/link；
- package repository/homepage 元数据；
- 全部物理路径文档。

迁移完成条件：

```powershell
rg "@zadmin/zui-web|packages/zui-web|ui/zui-web" .
```

在排除历史 Git 数据与明确迁移说明后必须为 0。

## 8. `@zadmin/tauri` 包结构

```text
ui/tauri/
├─ src/
│  ├─ api/
│  │  ├─ app.ts
│  │  ├─ clipboard.ts
│  │  ├─ dialog.ts
│  │  ├─ filesystem.ts
│  │  ├─ log.ts
│  │  ├─ notification.ts
│  │  ├─ opener.ts
│  │  ├─ os.ts
│  │  ├─ process.ts
│  │  ├─ store.ts
│  │  ├─ updater.ts
│  │  ├─ window-state.ts
│  │  └─ window.ts
│  ├─ components/
│  │  ├─ ClipboardButton.svelte
│  │  ├─ DesktopProvider.svelte
│  │  ├─ ExternalLink.svelte
│  │  ├─ FilePickerButton.svelte
│  │  ├─ NotificationButton.svelte
│  │  ├─ SystemInfo.svelte
│  │  ├─ WindowControls.svelte
│  │  ├─ WindowFrame.svelte
│  │  ├─ WindowTitleBar.svelte
│  │  └─ index.ts
│  ├─ runtime/
│  │  ├─ bindings.ts
│  │  ├─ context.ts
│  │  ├─ driver.ts
│  │  ├─ environment.ts
│  │  ├─ error.ts
│  │  └─ scope.ts
│  ├─ testing/
│  │  ├─ fake-driver.ts
│  │  ├─ fixtures.ts
│  │  └─ index.ts
│  └─ index.ts
├─ tests/
├─ package.json
├─ README.md
├─ svelte.config.js
├─ tsconfig.json
└─ vitest.config.ts
```

`src/` 为 4 个目录 + 一个公开入口；`api/` 为 13 个纯 TypeScript 文件；`components/` 为 10 个纯代码文件；`runtime/` 为 6 个纯 TypeScript 文件。

公开 exports：

```json
{
	".": "system API and runtime",
	"./svelte": "Svelte desktop adapters and system-aware components",
	"./testing": "fake driver and fixtures"
}
```

`@zadmin/tauri` 根入口必须可在不加载 Svelte/ZUI 的 TypeScript 环境中被 tree-shake；`./svelte` 才能 import `@zadmin/zui-svelte`。

## 9. DesktopPlatform 系统 API

核心合同：

```ts
interface DesktopPlatform {
	readonly environment: DesktopEnvironmentApi;
	readonly app: DesktopAppApi;
	readonly os: DesktopOsApi;
	readonly window: DesktopWindowApi;
	readonly dialog: DesktopDialogApi;
	readonly filesystem: DesktopFilesystemApi;
	readonly clipboard: DesktopClipboardApi;
	readonly notification: DesktopNotificationApi;
	readonly opener: DesktopOpenerApi;
	readonly process: DesktopProcessApi;
	readonly store: DesktopStoreApi;
	readonly log: DesktopLogApi;
	readonly windowState: DesktopWindowStateApi;
}
```

自定义命令使用类似 ORM 从 schema 推导 client 的方式传播类型。`tauri-specta` 生成的 `commands` 对象是 Rust IPC 的唯一类型源，`@zadmin/tauri` 只提供通用推导和组合能力：

```ts
type CommandBindings = Record<string, (...args: never[]) => Promise<unknown>>;

type CommandArgs<T extends (...args: never[]) => Promise<unknown>> = Parameters<T>;
type CommandResult<T extends (...args: never[]) => Promise<unknown>> = Awaited<ReturnType<T>>;

type DesktopPlatformWith<TCommands extends CommandBindings> = DesktopPlatform & {
	readonly commands: TCommands;
};
```

宿主把生成的 `commands` 直接注入，调用方自然获得完整方法名、参数、返回值和 tagged error 联合类型；fake driver 使用 `satisfies typeof commands` 保持同一合同。禁止再维护一份手写 command interface。

统一能力：

- `isTauri()` 与 browser fallback；
- 明确的 available/unsupported/permission-denied 状态；
- `DesktopError` 错误归一化；
- 可释放 listener/shortcut/watch handle；
- fake driver；
- 不向组件暴露裸 `invoke()`；
- 不复制官方插件已经提供的 TypeScript 类型；
- 业务 API 通过稳定 facade 传播类型。

## 10. 本地系统能力接入范围

### 10.1 第一阶段实际接入

| 域           | API                                                       | 边界                         |
| ------------ | --------------------------------------------------------- | ---------------------------- |
| Environment  | Tauri/browser 检测、版本                                  | 只读                         |
| App          | name、version、identifier                                 | 只读                         |
| OS           | platform、version、arch、locale                           | 只读                         |
| Window       | minimize、maximize、restore、close、theme、monitor、scale | close 需要用户动作           |
| Dialog       | open file、open directory、save、message、confirm         | 必须用户动作                 |
| Filesystem   | read/write text、stat、exists、remove、watch              | 仅 AppData 和用户选择路径    |
| Clipboard    | read/write/clear text                                     | read 必须用户动作            |
| Notification | permission、request、send                                 | 显式权限；Windows 安装后验收 |
| Opener       | HTTPS URL、用户选择路径                                   | scheme/path allowlist        |
| Process      | relaunch、exit                                            | 明确确认，不用于无人值守测试 |
| Store        | 非敏感设置                                                | 禁止保存 token/密码          |
| Log          | 分级日志、文件日志                                        | 默认脱敏                     |
| Window State | 保存/恢复窗口                                             | 防止启动闪烁                 |

优先使用 Tauri 官方插件，不自行实现同类 Rust command。官方插件范围见[官方插件总览](https://v2.tauri.app/plugin/)。

### 10.2 第二阶段接入

- global shortcut；
- autostart；
- single instance；
- system tray/menu；
- deep link；
- persisted scope；
- updater；
- file association；
- 多窗口 capability 隔离。

### 10.3 Windows 专属后续能力

- Windows Credential Manager；
- 指定 allowlist 注册表键；
- Taskbar progress；
- Jump List；
- power/session events；
- 服务状态查询；
- 原生文件关联；
- Windows 通知 action；
- 必要时的系统硬件接口。

这些必须由实际业务需求驱动，不在第一阶段提供裸 Win32、任意注册表或管理员权限。

### 10.4 明确禁止的默认能力

- 任意 shell；
- 任意 PowerShell；
- 任意子进程；
- 任意 `$HOME/**` 或 `C:\**`；
- 系统目录写入；
- 任意 URL scheme；
- 远程页面访问本地 IPC；
- 自动提权；
- 无签名更新；
- 将秘密存入普通 Store。

## 11. Tauri Svelte 适配与桌面组件层

`@zadmin/tauri/svelte` 是一个可持续扩展的桌面组件层，不只是系统 API 的演示包装。它负责把 `@zadmin/zui-svelte` 的视觉原语、Svelte 状态和 Tauri 本地能力组合成可直接用于桌面应用的强类型组件。

允许进入这一层的代码至少满足一项：

- 管理 Tauri 权限、scope 或 availability；
- 绑定窗口、文件、剪贴板、通知、快捷键、更新等本地能力；
- 管理 native listener、watcher 或资源释放；
- 提供桌面窗口框架、拖动区、系统状态或原生交互语义；
- 给浏览器、Storybook 和测试提供一致的 fake/fallback 行为。

不允许只把 `Button`、`Box`、`Stack`、`Text` 换名后重新导出。普通视觉组件始终从 `@zadmin/zui-svelte` 使用，避免形成第二套主题、Props 和样式实现。

第一阶段实现以下 9 个组件：

1. `DesktopProvider`
   - 注入 `DesktopPlatform`；
   - 支持 fake driver；
   - 浏览器、Storybook 和测试无需启动 Tauri。
2. `WindowFrame`
   - 组合标题栏、窗口控制区与内容区；
   - 统一安全区、焦点、主题和无边框窗口布局。
3. `WindowTitleBar`
   - 自定义标题栏与拖动区域；
   - 复用 `@zadmin/zui-svelte` 的布局、文字和主题。
4. `WindowControls`
   - minimize、maximize/restore、close；
   - 同步真实窗口状态，不复制 Button 样式。
5. `FilePickerButton`
   - 封装 open file、open directory 和 save 三种 native dialog；
   - 返回强类型选择结果，文件预览和业务处理留给应用。
6. `ClipboardButton`
   - 在明确用户动作中执行 read/write/clear；
   - 统一 unavailable、permission denied、success 状态。
7. `ExternalLink`
   - 复用 ZUI 链接外观，通过 Opener 打开 allowlist 内的 HTTPS URL；
   - 浏览器 fallback 仍受相同协议校验。
8. `NotificationButton`
   - 组合 permission 查询、请求与发送；
   - 未安装或平台不支持时返回明确状态。
9. `SystemInfo`
   - 展示 OS、arch、app version、Tauri availability；
   - 可注入 fake platform 做文档和测试。

第二阶段可以在同一入口增加 `UpdatePanel`、`ShortcutRecorder`、`DeepLinkStatus` 等确实结合系统能力的组件。是否增加组件由复用价值和生命周期复杂度决定，不为每个 API 机械生成一个 Svelte 包装。

## 12. `apps/desktop` 结构

```text
apps/desktop/
├─ src/
│  ├─ lib/
│  │  └─ generated/
│  │     └─ tauri.ts
│  ├─ routes/
│  ├─ app.d.ts
│  └─ app.html
├─ src-tauri/
│  ├─ capabilities/
│  ├─ icons/
│  ├─ src/
│  │  ├─ bindings.rs
│  │  ├─ commands.rs
│  │  ├─ error.rs
│  │  ├─ lib.rs
│  │  ├─ main.rs
│  │  ├─ state.rs
│  │  └─ system.rs
│  ├─ build.rs
│  ├─ Cargo.lock
│  ├─ Cargo.toml
│  └─ tauri.conf.json
├─ static/
├─ package.json
├─ README.md
├─ svelte.config.js
├─ tsconfig.json
└─ vite.config.ts
```

第一版仅一个 Desktop capability lab，不复制 Admin/ERP/CRM 页面。

验证内容：

- `@zadmin/zui-svelte` Theme、ICSS 和基础组件；
- DesktopProvider、WindowFrame 和窗口控制组件；
- FilePickerButton、ClipboardButton、ExternalLink 与 NotificationButton；
- app/os/window 只读信息；
- native dialog；
- AppData 临时文件 roundtrip/cleanup；
- clipboard supervised roundtrip；
- notification permission/send；
- opener HTTPS allowlist；
- Store 非敏感设置；
- window state 恢复；
- capability/permission 报告。

## 13. SvelteKit 桌面配置

```js
import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({ fallback: 'index.html' })
	}
};
```

```ts
// src/routes/+layout.ts
export const ssr = false;
```

```json
{
	"build": {
		"beforeDevCommand": "pnpm dev:web",
		"beforeBuildCommand": "pnpm build:web",
		"devUrl": "http://127.0.0.1:5173",
		"frontendDist": "../build"
	}
}
```

规则：

- 开发允许 Vite dev server；
- 生产只加载本地静态文件；
- 不启动 SvelteKit SSR server；
- 不启动 Node sidecar；
- 不使用本地 HTTP 作为 Tauri 内部调用方式；
- 未来共享 Admin UI 时提取客户端模块，不直接嵌入 `apps/admin` server build。

## 14. Tauri 权限与安全

Tauri 2 使用三层模型：

```text
permissions  → 哪些命令可调用
scopes       → 参数和路径范围
capabilities → 哪些 Window/WebView 获得权限
```

初期只创建 `main` window capability，不使用 `windows: ["*"]`。

文件范围：

```text
允许：$APPDATA/zadmin/**、$APPCACHE/**、用户通过 dialog 明确选择的路径
拒绝：$HOME/**、C:\**、系统目录、任意网络路径
```

其他规则：

- 本地 assets only；
- `script-src` 不允许 `unsafe-eval`；
- ZUI 动态样式分别验证 `inline-vars` 与 CSP `class-rules` 模式；
- clipboard read、dialog、notification request、opener、exit/relaunch 必须来自明确用户动作；
- capabilities 不能为了方便使用全部 `*:default`；
- shell 插件第一阶段不安装；
- updater 私钥只在 CI secret 中；
- updater 签名校验不可关闭；
- custom Rust command 必须在 capability 和参数校验中同时约束。
- `tauri-specta`不会生成 ACL；所有自定义 command 必须在`build.rs`的`tauri_build::AppManifest::commands`登记，再只向`main`窗口授予生成的`allow-*` permission；
- 不使用`core:default`、`notification:default`或`opener:default`，第一阶段逐命令列出最小 permission；
- Opener 第一阶段只开放明确域名的 HTTPS URL，不承诺打开任意 Dialog 所选本地路径；
- Dialog 动态文件 scope 只在当前进程有效，持久化 scope 属于第二阶段；
- 生产 capability 显式列入`tauri.conf.json`，不依赖 capabilities 目录的自动全量启用。

## 15. 强类型策略

第一阶段直接采用 `tauri-specta` v2。虽然当前发布版本号仍带 RC，但项目已直接支持 Tauri 2 command、event、typed error 和 TypeScript exporter；本项目接受这一依赖状态，并通过精确锁定、生成物漂移检查和真实 Rust/TypeScript 构建控制风险。

Rust 合同：

1. request、response、event 和 error 使用 `serde` 与 `specta::Type`；
2. command 同时标记 `#[tauri::command]` 和 `#[specta::specta]`；
3. event 同时派生 `specta::Type` 与 `tauri_specta::Event`；
4. error 使用 `thiserror` 和 `#[serde(tag = "type", content = "data")]` 生成可判别联合；
5. `Builder::<tauri::Wry>` 集中收集 commands/events，并同时生成 invoke handler；
6. `specta_typescript::Typescript` 生成 `apps/desktop/src/lib/generated/tauri.ts`。
7. `Builder::commands()`和`Builder::events()`都只能在中央 builder 各调用一次，因为重复调用会覆盖此前集合；
8. typed event 必须在 Tauri `setup`中调用`mount_events()`；
9. 保留默认 serde serialize/deserialize phase，不调用`disable_serde_phases()`；
10. 首版使用单一`Layout::FlatFile`，导出后由仓库 Prettier 格式化。

TypeScript 合同：

1. 生成文件必须提交，但禁止人工编辑；
2. 业务代码直接从生成的 `commands` 和 `events` 推导类型；
3. `CommandArgs`、`CommandResult` 和 `DesktopPlatformWith` 只做泛型组合，不复制 DTO；
4. 官方 Tauri 插件继续继承官方 TypeScript 类型，不绕回 Rust 重写一层同类 command；
5. `DesktopPlatform` facade 统一处理 availability、权限、错误和资源生命周期；
6. 只有自定义 Rust/Windows 能力经过 `tauri-specta`；
7. Rust 与 TypeScript 共享 golden fixture 验证序列化边界。
8. facade 必须验证 generated typed error 的判别字段；Tauri transport error 可能不是声明的 Rust error，必须归一化为`DesktopTransportError`；
9. IPC DTO 不直接使用可能损失精度的`u64`、`i64`、`u128`或`i128`，大整数使用字符串 newtype；
10. fake command client 使用`satisfies typeof commands`，不能复制生成签名。

生成门禁：

```powershell
cargo test export_bindings
pnpm exec prettier --write apps/desktop/src/lib/generated/tauri.ts
git diff --exit-code -- apps/desktop/src/lib/generated/tauri.ts
```

该形态类似 Drizzle 等类型安全 ORM：Rust command/event 集合相当于 schema，生成的 bindings 相当于推导 client，稳定 facade 相当于上层 repository/service。类型只从源合同向上推导，不依赖继承类、字符串命令名或重复声明。

参考：

- [tauri-specta v2](https://github.com/specta-rs/tauri-specta)
- [Specta TypeScript exporter](https://github.com/specta-rs/specta)

## 16. Windows 11 x64 基线

当前机器已确认：

| 工具               | 当前值                       |
| ------------------ | ---------------------------- |
| Node               | 24.18.0                      |
| pnpm               | 11.22.0                      |
| Rust               | 1.97.1                       |
| Cargo              | 1.97.1                       |
| Rust target        | `x86_64-pc-windows-msvc`     |
| MSVC Build Tools   | Visual Studio Build Tools 18 |
| WebView2           | 151.0.4129.101               |
| `@tauri-apps/cli`  | 2.11.4                       |
| `@tauri-apps/api`  | 2.11.1                       |
| Rust `tauri` crate | 2.11.5                       |

基础工具已经满足，不需要重新安装 Rust、MSVC 或 WebView2。普通 PowerShell 中 `cl.exe` 不在 PATH 不作为失败证据；实际 `cargo tauri` smoke build 必须验证 MSVC 自动发现。

第一阶段目标：

```text
Windows 11
x86_64-pc-windows-msvc
WebView2 Evergreen
NSIS installer
```

MSI、ARM64 与跨平台后置。MSI 需要额外检查 Windows VBSCRIPT optional feature，当前没有必要同时维护两套安装器。

## 17. 版本管理

在 `pnpm-workspace.yaml` 增加 desktop catalog，安装时重新查询并固定当时最新兼容版本；本蓝图记录的当前参考值为：

```yaml
catalogs:
  desktop:
    '@tauri-apps/api': 2.11.1
    '@tauri-apps/cli': 2.11.4
    '@tauri-apps/plugin-clipboard-manager': 2.3.2
    '@tauri-apps/plugin-dialog': 2.7.2
    '@tauri-apps/plugin-fs': 2.5.1
    '@tauri-apps/plugin-log': 2.9.0
    '@tauri-apps/plugin-notification': 2.3.3
    '@tauri-apps/plugin-opener': 2.5.4
    '@tauri-apps/plugin-os': 2.3.2
    '@tauri-apps/plugin-process': 2.3.1
    '@tauri-apps/plugin-store': 2.4.4
    '@tauri-apps/plugin-updater': 2.10.1
    '@tauri-apps/plugin-window-state': 2.4.1
```

Rust 参考：

```toml
tauri = "2.11.5"
tauri-build = "2.6.3"
specta = "=2.0.0-rc.25"
specta-typescript = "=0.0.12"
tauri-specta = { version = "=2.0.0-rc.25", features = ["derive", "typescript"] }
```

JS 与 Rust 插件不要求 patch 号相同，各官方插件独立发布；`pnpm-lock.yaml` 与 `Cargo.lock` 固定精确解析版本。Specta 相关 RC 依赖使用精确版本，不能使用宽松的 `2.0.0-rc` 范围。

## 18. 分阶段迁移计划

### 阶段 0：蓝图审阅

当前文件即阶段 0 产物。蓝图已经审阅并补充 `tauri-specta` 决策，先单独提交：

```text
docs(workspace): plan ui root and tauri desktop
```

### 阶段 1：纯物理迁移

```text
packages/sveltekit    → ui/sveltekit
packages/svelte-taro  → ui/svelte-taro
packages/zui-core     → ui/zui-core
packages/zui-taro     → ui/zui-taro
packages/zui-web      → ui/zui-web
```

仅更新：

- workspace glob；
- lockfile importer/link；
- repository/homepage directory；
- WeChat supervisor 和 file-policy 物理路径；
- 测试和文档物理路径。

包名和 imports 暂不变化，保证这一提交只验证物理迁移。

提交：

```text
refactor(workspace): move ui packages under ui
```

### 阶段 2：ZUI 包名重命名

```text
ui/zui-web       → ui/zui-svelte
@zadmin/zui-web  → @zadmin/zui-svelte
```

同步更新全部 32 个已知引用文件中的 109 处旧名称、compiler 默认 module 名、package metadata、fixtures 和文档。

提交：

```text
refactor(zui): rename web package to zui-svelte
```

### 阶段 3：内部目录整理

移动 Web/Taro `internal.ts`，保持 package subpath 不变。

提交：

```text
refactor(ui): normalize package source layout
```

### 阶段 4：Tauri 系统能力包

新增 `ui/tauri`，先实现 runtime、fake driver 和第一阶段系统 API，暂不添加 Svelte 组件。

提交：

```text
feat(tauri): add typed desktop system platform
```

### 阶段 5：Tauri Svelte 适配与桌面组件层

新增 `@zadmin/tauri/svelte` 的首批 9 个组件。普通视觉原语全部复用 `@zadmin/zui-svelte`，桌面层只增加系统能力、权限、native event 和资源生命周期语义。

提交：

```text
feat(tauri): add svelte desktop integrations
```

### 阶段 6：Desktop 宿主

新增 `apps/desktop`、Rust shell、capabilities 和系统能力实验页。

提交：

```text
feat(desktop): add win11 tauri capability host
```

### 阶段 7：验收与交接

```text
test(desktop): complete win11 x64 acceptance
docs(desktop): finalize tauri handoff
```

每个提交必须保持可安装、可检查、可测试、可构建；不把物理迁移、包名重命名、Rust 工程和权限接入合为一个巨型提交。

## 19. 迁移影响清单

必须处理：

- `pnpm-workspace.yaml`；
- `pnpm-lock.yaml`；
- 4 个已有 package repository/homepage（`@zadmin/sveltekit`当前没有这些元数据）；
- `@zadmin/zui-web` 的 32 个已知引用文件、109 处旧名称；
- `apps/admin` Vite、hooks 和 package；
- `apps/docs` Svelte config、hooks、Storybook、routes 和 content；
- `apps/wechat` supervisor、file-policy 和 tests；
- `ui/svelte-taro` tarball acceptance 路径；
- `ui/zui-svelte` 自引用和 compiler module 识别；
- `ui/zui-taro` 对 `@zadmin/svelte-taro` 的 dev dependency；
- `@zadmin/sveltekit` 的 lockfile 物理 links 与文档路径；
- handoff、architecture、testing、ZUI 和微信文档。

不修改：

- `@zadmin/core` token/DI；
- 插件公开依赖方式；
- `@zadmin/sveltekit` npm 名称和运行时 ID；
- `@zadmin/svelte-taro` npm 名称；
- `@zadmin/zui-core` npm 名称；
- `@zadmin/zui-taro` npm 名称；
- 现有 Web/Taro 行为和验证等级。

## 20. 验证矩阵

### 20.1 UI 迁移零回退

```powershell
pnpm install --frozen-lockfile
pnpm peers check
pnpm check
pnpm test
pnpm build
pnpm lint
```

专项：

```powershell
pnpm --filter @zadmin/zui-core test:coverage
pnpm --filter @zadmin/zui-svelte test:coverage
pnpm --filter @zadmin/zui-taro test:coverage
pnpm --filter @zadmin/svelte-taro test:coverage
pnpm --filter @zadmin/svelte-taro test:package
pnpm --filter @zadmin/sveltekit test
pnpm build:wechat
```

必须重跑：

- ZUI Chromium/Firefox/WebKit；
- Docs Playwright；
- Storybook build；
- SSR/CSP/HMR；
- 10,000 次动态 ICSS 无增长；
- WebView 微信生产构建和安全探针；
- 四 tarball 外部安装；
- gitleaks。

### 20.2 Tauri TypeScript/Rust

```powershell
pnpm --filter @zadmin/tauri check
pnpm --filter @zadmin/tauri test
pnpm --filter @zadmin/desktop check
pnpm --filter @zadmin/desktop test
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
cargo test export_bindings
pnpm --filter @zadmin/desktop tauri build --debug --no-bundle
```

`export_bindings` 后必须确认已提交的 `apps/desktop/src/lib/generated/tauri.ts` 没有漂移。

### 20.3 Win11 人工验收

- WebView2 启动；
- Vite HMR；
- 100/125/150/200% DPI；
- 深色/浅色主题；
- 多显示器；
- 标题栏拖动；
- minimize/maximize/restore/close；
- native dialog；
- AppData 临时文件清理；
- clipboard supervised roundtrip 与恢复；
- notification installed-app 行为；
- HTTPS opener allowlist；
- Store；
- window-state 恢复；
- 事件/listener/watch handle 卸载；
- capability 拒绝路径；
- CSP；
- NSIS 安装、启动、卸载；
- 无残留进程和临时文件。

## 21. 第一阶段不做

- 不复制 `@zadmin/zui-svelte` 的普通视觉组件；
- 不新增 `zui-desktop`；
- 不把 Tauri 变成独立 HTTP backend；
- 不启动 Node sidecar；
- 不接入数据库；
- 不集成 Admin/ERP/CRM 业务页；
- 不开放 shell；
- 不开放全盘 fs；
- 不实现任意注册表；
- 不做 updater 服务端；
- 不配置生产签名私钥；
- 不做 MSI；
- 不做 ARM64 或跨平台；
- 不手写与 `tauri-specta` bindings 重复的 command、event、DTO 或 error TypeScript 类型。

## 22. 完成定义

蓝图整体完成需要同时满足：

1. `packages/` 中不再存在 sveltekit、svelte-taro 和 zui 包；
2. `ui/` 只有 6 个目标目录；
3. 全仓没有非迁移文档中的 `packages/zui-*`、`packages/svelte-*` 旧物理路径；
4. 全仓没有 `@zadmin/zui-web` import 或 dependency；
5. 所有原 UI/Taro/SvelteKit 验收零回退；
6. `@zadmin/tauri` 根入口不加载 Svelte；
7. `@zadmin/tauri/svelte` 只提供桌面适配或结合本地系统能力的组件，不形成第二套普通视觉组件库；
8. `apps/desktop` 在 Win11 x64 真实启动；
9. 第一阶段系统 API 的成功、拒绝和清理路径通过；
10. capability 配置无 wildcard 高权限；
11. NSIS 安装与卸载通过；
12. 工作区干净、无 watcher/进程/临时文件；
13. 阶段性 Git 提交均可独立构建；
14. 不自动 push。

## 23. 审阅决策点

需要确认的最终选择已经压缩为以下六项：

1. 接受 `ui/` 六包最终结构；
2. 接受 `@zadmin/zui-web` 无兼容包直接改名 `@zadmin/zui-svelte`；
3. 接受 `@zadmin/tauri` 同时提供系统 API、`/svelte` 和 `/testing`，但根入口保持无 Svelte；
4. 接受 `apps/desktop` 使用 SvelteKit SPA 而非 SSR；
5. 接受 Win11 x64 + NSIS 为第一阶段唯一发布目标；
6. 接受第一阶段广系统 API、首批 9 个桌面能力组件、无 shell、无 sidecar，并使用精确锁定的 `tauri-specta` v2 生成自定义 Rust IPC 类型。

本文提交后严格从阶段 1 的纯物理迁移开始，并持续执行到阶段 7 验收与交接完成。

## 24. 实施结果

所有阶段均已完成并形成可独立构建的Git提交：

```text
59a1580 docs(workspace): plan ui root and tauri desktop
bb480ea refactor(workspace): move ui packages under ui
f128d1d refactor(zui): rename web package to zui-svelte
8a9239a refactor(ui): normalize package source layout
42f8eb9 feat(tauri): add typed desktop system platform
8b12293 feat(tauri): add svelte desktop integrations
75f755c feat(desktop): add win11 tauri capability host
```

实现相对初始蓝图的必要收敛：

- 正式采用精确锁定的`tauri-specta 2.0.0-rc.25`、`specta 2.0.0-rc.25`和`specta-typescript 0.0.12`；
- bindings测试使用Tauri MockRuntime，正式应用默认使用独立`desktop-runtime` feature，避免类型生成测试加载原生GUI运行时；
- Rust最低版本按实际解析从1.85修正为1.88，本机使用1.97.1完成验收；
- `DesktopPlatform`增加disabled updater合同，但第一阶段不注册Updater插件或权限；
- 真实桌面自动化使用Windows应用控制做静态exe和安装后页面验收，没有把普通浏览器测试误写成Tauri IPC证据；
- WDIO测试插件没有进入依赖、capability或生产bundle；当前真实窗口验收不需要在release中嵌入WebDriver server；
- Vite明确忽略Rust target/gen并预优化linked Tauri依赖，解决Windows锁定DLL导致的开发崩溃；
- 组件目录最终为9个公开组件加context/types/index共12个同类代码文件，符合目录密度约束；
- Windows icons目录最终只保留一个6层DIB`icon.ico`，可编辑SVG和确定性生成脚本归属`apps/desktop`；
- NSIS产物完成current-user安装、启动、卸载和清理；未提供签名证书，因此签名仍是外部分发前置条件，不属于实现缺陷。

完整命令、覆盖率、真实探针、安装器哈希和未触发能力边界见[生产验收报告](./desktop-production-acceptance.md)。
