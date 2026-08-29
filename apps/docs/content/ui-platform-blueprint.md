# UI 平台重构蓝图

状态：实施中（2026-08-29）。P0–P5 已完成代码迁移与本地窄验收：浏览器ZUI已合包、SvelteKit ZUI集成已独立、自包含Miniapp已由Svelte直编微信原生产物并移除Taro。P6–P7的C# WebView公共层与Windows target正在实施；微信开发者工具直编模拟器验收和云端全量门禁仍按本文边界追踪。

## 1. 决策摘要

目标工作区收敛为四个 UI 平台包：

```text
ui/
  zui/               浏览器与 WebView 的 Svelte 组件、Theme、CSS runtime/compiler
  sveltekit/         Web、SSR、服务端与动态插件页面集成
  miniapp/           自包含 Svelte 微信小程序编译器、运行时、基础组件和平台 API
  webview/           C# WebView桌面宿主框架、前端桥、目标适配器和发布工具
```

公开包名：

```text
@zadmin/zui
@zadmin/sveltekit
@zadmin/miniapp
@zadmin/webview
```

长期边界：

- `zui`只面向浏览器语义，可运行于普通浏览器、SvelteKit SSR/hydration和桌面WebView；
- `miniapp`不依赖`zui`、SvelteKit、DOM、CSSOM、Taro或桌面宿主，拥有独立的移动端组件、Theme、样式程序和编译运行时；
- `miniapp`由一套Svelte源码生成微信小程序原生产物，包名保持平台中立但v1只实现微信；
- `webview`把一套Svelte/Web源码分别发布为目标桌面产物，C#提供共享宿主协议和底层能力，Windows/WebView2是首个生产target；
- 服务端敏感操作继续由现有Package或Plugin负责，小程序和WebView前端不能持有密钥、支付签名或数据库凭据；
- 重构必须按可构建、可回滚的阶段提交，不能在同一阶段同时重命名、移除Taro和移除Tauri。

## 2. 当前基线

当前`ui/`包含四个已落地包和一个迁移期桌面包：

| 目录           | 包名                | 当前职责                                                                             |
| -------------- | ------------------- | ------------------------------------------------------------------------------------ |
| `ui/zui`       | `@zadmin/zui`       | 浏览器/WebView Theme、ICSS、recipe、8个Svelte组件和runtime                           |
| `ui/sveltekit` | `@zadmin/sveltekit` | 动态插件runtime，以及`/zui`的SSR、CSP、critical CSS和client集成                      |
| `ui/miniapp`   | `@zadmin/miniapp`   | 独立移动Theme、`mcss()`、8个`M*`组件、Svelte compiler/renderer、微信target与平台能力 |
| `ui/webview`   | `@zadmin/webview`   | C#公共协议、前端bridge、平台facade和多桌面target；正在实施                           |
| `ui/tauri`     | `@zadmin/tauri`     | 已验收旧桌面实现；只在C# Windows target达到替换门槛后删除                            |

`ui/zui-core`、`ui/zui-svelte`、`ui/zui-taro`和旧`svelte-taro`边界已迁移或删除。微信生产依赖不含ZUI和Taro；桌面迁移继续保留Tauri对照基线，避免在新宿主未验收前丢失可发布路径。

## 3. 目标依赖图

```text
packages/core ────────────────┐
                              │
                              ▼
                       @zadmin/sveltekit
                         ▲           ▲
                         │           │
              apps/admin/docs    Web plugins
                         │
                         ▼
                       @zadmin/zui
                         ▲
                         │
                  SvelteKit/WebView2
                         │
                         ▼
                   @zadmin/webview
                         │
          ┌──────────────┼────────────────┐
          ▼              ▼                ▼
   Windows target   future macOS     future Linux
 C# / WebView2      C# + native      C# + native

@zadmin/miniapp
       │
       ▼
 WeChat target
       │
       ▼
 WXML/WXSS/JS/JSON
```

禁止的依赖：

```text
@zadmin/miniapp       ─X→ @zadmin/zui
@zadmin/miniapp       ─X→ @zadmin/sveltekit
@zadmin/zui           ─X→ @zadmin/miniapp
@zadmin/zui           ─X→ @zadmin/webview
@zadmin/sveltekit     ─X→ 桌面target或C#实现
@zadmin/webview       ─X→ Taro或小程序运行时
```

## 4. `@zadmin/zui`：浏览器与WebView组件库

### 4.1 定位

`@zadmin/zui`合并当前`zui-core`和`zui-svelte`，只为浏览器渲染环境负责。WebView2使用Edge Chromium，因此属于该支持范围，不需要第二套桌面ZUI。

运行时CSS、Theme、recipe、组件Props、目录与分阶段API详见[ZUI运行时CSS与组件API蓝图](./zui-runtime-css-components-blueprint.md)。

ZUI负责：

- Svelte 5 Web组件和完整TypeScript Props；
- Theme、Token、颜色、间距、排版和响应式设计；
- ICSS typed builder、确定性class和CSS序列化；
- BrowserStyleSheet、StyleRegistry、HMR owner和变体上限；
- Svelte编译期动态叶子提升、class-only公开API和诊断；
- HTML attributes、DOM events、键盘、焦点和无障碍；
- 浏览器CSS变量、媒体查询、容器查询、伪类、伪元素和动画；
- 普通浏览器、Chromium、Firefox、WebKit和WebView2。

不负责：

- WXML、WXSS、AXML、ACSS；
- `wx`、`my`、Taro或小程序生命周期；
- Windows文件、窗口、通知、更新或进程能力；
- 把Web组件自动转换为小程序组件。

### 4.2 源码结构

```text
ui/zui/src/
  theme/
  tokens/
  icss/
  css/
  compiler/
  components/
  runtime/
  testing/
  index.ts
```

推荐导出：

```text
@zadmin/zui
@zadmin/zui/compiler
@zadmin/zui/internal
@zadmin/zui/testing
```

`./internal`只允许编译器生成代码使用，不作为业务API。SvelteKit专属的`Handle`、request-local registry、CSP hash/nonce和critical CSS注入迁入`@zadmin/sveltekit/zui`。

### 4.3 组件方向

组件使用`Z`前缀，优先覆盖桌面与响应式Web：

```text
ZProvider ZBox ZStack ZGrid ZText ZIcon
ZButton ZInput ZSelect ZCheckbox ZForm
ZTable ZTree ZMenu ZTabs ZDialog ZDrawer
ZTooltip ZPopover ZToast ZPagination
```

Web表格、侧栏、菜单、Portal、HTML表单和复杂键盘交互不要求在Miniapp中存在一一对应实现。

## 5. `@zadmin/sveltekit`：Web与服务端集成

### 5.1 根入口必须保持server-safe

当前多个Plugin和Package直接使用`SvelteKitHost`、`PluginRouteRegistry`和服务端路由。根入口不能因为组合ZUI而加载浏览器组件或Node专属CSS注入副作用。

推荐导出：

```text
@zadmin/sveltekit
@zadmin/sveltekit/server
@zadmin/sveltekit/client
@zadmin/sveltekit/zui
@zadmin/sveltekit/testing
```

职责：

| 入口        | 职责                                                               |
| ----------- | ------------------------------------------------------------------ |
| 根入口      | DI token、Host合同、平台无关路由类型                               |
| `./server`  | PluginRouteRegistry、Handle、服务端插件生命周期                    |
| `./client`  | ClientPluginRuntime、页面Store、PluginPageOutlet                   |
| `./zui`     | request-local CSS runtime、critical CSS、CSP hash/nonce、hydration |
| `./testing` | fake host、route fixtures、SSR fixtures                            |

基础视觉组件仍从`@zadmin/zui`导入；SvelteKit组件只组合Web路由、服务端数据、鉴权、错误边界和动态插件页面语义。

## 6. `@zadmin/miniapp`：自包含Svelte小程序框架

### 6.1 定位与边界

`@zadmin/miniapp`使用Svelte语法开发微信小程序。包名不绑定微信，以免未来新增平台时再次改名；v1只实现和验收微信。

v1内含：

- Svelte compiler adapter和受支持语法诊断；
- Miniapp IR和微信lowering；
- App、Page、Component运行时；
- 移动端优先的首批基础`M*`组件；
- 独立Miniapp Theme、Token和样式程序；
- 微信能力facade、capability检测和强类型raw API；
- 微信template、style、script和manifest emitter；
- Vite/build插件、sourcemap、HMR和微信开发者工具接入；
- fake platform、fixture emitter和微信产物快照测试。

它与ZUI只保持家族相似性：品牌、命名和部分Props可以相似，但没有运行时、类型或发布依赖。

### 6.2 推荐导出

```text
@zadmin/miniapp
@zadmin/miniapp/platform
@zadmin/miniapp/vite
@zadmin/miniapp/compiler
@zadmin/miniapp/module
@zadmin/miniapp/testing
```

- 根入口只导出业务组件、Theme和运行时安全API；
- `./vite`只在Node构建期加载；
- `./compiler`提供高级编译与诊断接口；
- `./platform`提供统一能力、平台guards和目标特定raw API；
- `./testing`不得进入生产bundle。

### 6.3 组件库

首批只实现8个基础组件，使用`M`前缀并按移动端重新设计：

```text
MProvider MBox MStack MText
MIcon MButton MInput MImage
```

`components/`首层保持约8个同类组件目录。ScrollView、List、Form、Picker、Popup、Toast、Navbar、TabBar和业务流程组件都不进入v1；只有出现真实使用场景、API和验收后再逐批增加。

与ZUI相似但独立的例子：

| Web       | Miniapp   | 关系                                                    |
| --------- | --------- | ------------------------------------------------------- |
| `ZButton` | `MButton` | 相似variant/size/loading，MButton增加开放能力和触摸反馈 |
| `ZIcon`   | `MIcon`   | 相似name/size/color，资源和模板独立输出                 |
| `ZInput`  | `MInput`  | 相似value/error，MInput增加移动键盘和confirm语义        |
| `ZImage`  | `MImage`  | 相似资源语义，MImage按微信图片组件能力实现              |

Miniapp Theme拥有安全区、状态栏、触摸面积、active opacity、手势阈值、键盘避让和`rpx`等Web Theme不需要的概念。

### 6.4 独立样式系统

Miniapp样式使用自己的`mcss()`或等价API，不复用ZUI ICSS实现：

```text
MiniStyle Program
  ├─ WeChat WXSS emitter
  └─ Dynamic inline style binder
```

规则：

- 结构样式编译成确定性静态class；
- 动态叶子绑定到最小data path和inline style；
- 不在运行时注入`<style>`；
- `rpx`、安全区和触摸状态是一等能力；
- 不支持的属性、selector、unit或query必须编译失败；
- 微信target维护独立WXSS兼容表，不继承浏览器CSS能力。

### 6.5 编译流水线

```text
.svelte
  │
  ├─ parse/analyze
  │    ├─ template IR
  │    ├─ reactive script IR
  │    ├─ event/lifecycle IR
  │    ├─ style IR
  │    └─ app/page/component metadata
  │
  └─ WeChat target
       ├─ WXML
       ├─ WXSS
       ├─ JS
       └─ JSON
```

长期优化目标是静态模板加紧凑响应式runtime：

- 静态节点直接进入WXML；
- `{#if}`、`{#each}`和key尽量lower到目标模板指令；
- 文本插值生成稳定data binding；
- event handler分配稳定ID；
- 同一microtask内的更新合并为一次最小数据提交；
- 组件Props映射到目标properties；
- 生命周期映射到目标App/Page/Component合同；
- 不把完整DOM-like树长期序列化进`setData`。

第一阶段允许使用Svelte custom renderer建立无Taro节点树，以降低迁移风险；该路径必须有基准，不能成为无法替换的永久中间层。

### 6.6 Svelte支持档案

首个生产档案应覆盖：

```text
$state $derived $effect
$props bindable props
if each key await
component snippet context
mount/unmount lifecycle
events class style
error boundary和资源清理
```

首阶段禁止或诊断：

```text
DOM actions
svelte:window/document/body/head
raw HTML
browser transition/animate
hydration
任意CSSOM
依赖DOM测量的第三方组件
无法静态判定的原生标签
```

### 6.7 微信target

v1只实现以下目录，不建立空的其他平台target目录：

```text
ui/miniapp/src/targets/wechat/
  api.ts
  elements.ts
  events.ts
  lifecycle.ts
  manifest.ts
  runtime.ts
  styles.ts
  template.ts
```

这8个同类代码文件分别拥有微信公开合同。未来是否抽出多target接口，应在另一个平台进入正式规划后根据两个真实实现决定。

### 6.8 平台API

v1平台合同：

```ts
interface WeChatMiniappPlatform {
	readonly kind: 'wechat';
	readonly capabilities: MiniappCapabilities;
	readonly navigation: MiniappNavigationApi;
	readonly storage: MiniappStorageApi;
	readonly network: MiniappNetworkApi;
	readonly authorization: MiniappAuthorizationApi;
	readonly payment: MiniappPaymentApi;
	readonly device: MiniappDeviceApi;
	readonly raw: WechatMiniprogram.Wx;
}
```

API层次：

1. 业务优先使用稳定的Miniapp capability facade；
2. 使用`platform.capabilities`检查真实可用性；
3. `platform.kind`固定为`wechat`，用于环境断言和未来兼容；
4. 只有无法封装的微信专属能力访问强类型`platform.raw`；
5. 运行环境不存在`wx`或与微信构建目标不匹配时启动失败。

### 6.9 微信产物

命令合同：

```powershell
pnpm miniapp build --target wechat
pnpm miniapp dev --target wechat
```

v1只生成微信小程序目录：

```text
dist/
  wechat/
    app.js
    app.json
    app.wxss
    pages/**/index.js
    pages/**/index.json
    pages/**/index.wxml
    pages/**/index.wxss
```

### 6.10 服务端安全边界

- 登录code兑换、手机号兑换、支付签名和回调必须在服务端；
- Miniapp组件只能接收一次性code或非敏感业务结果，不能记录手机号code、token或支付密钥；
- 业务Module构建时静态合入目标产物，不从网络加载可执行JavaScript；
- 安装、升级或禁用Miniapp业务模块后必须重新构建、审核和发布；
- 微信上传、审核、支付和真实授权均需要单独用户授权，不能进入默认测试命令。

## 7. `@zadmin/webview`：C#多目标桌面宿主框架

### 7.1 定位与目标

`@zadmin/webview`使集成该包的Svelte/Web应用能够按目标发布桌面产物。C#拥有共享宿主协议、能力facade、资源生命周期和底层实现入口；每个操作系统target负责选择原生WebView、窗口系统、打包器和平台API。

第一阶段只承诺Windows生产target：

```text
@zadmin/zui + SvelteKit static SPA
  → Microsoft Edge WebView2
  → versioned typed message protocol
  → C# / WinUI 3 / Windows App SDK
```

替换Tauri改变的是宿主语言、系统API、IPC、安全和发布链，不改变Svelte页面的WebView2渲染器。性能目标必须分别测量Web bundle、DOM和C#宿主，不能把更换语言称为自动渲染加速。

长期目标允许增加：

```text
windows-x64 / windows-arm64
macos-x64 / macos-arm64
linux-x64 / linux-arm64
```

新增target必须有独立WebView、安全、系统能力和发布验收，不能因为共享C#代码就宣称跨平台完成。Windows使用WinUI 3、Windows App SDK和WebView2；未来macOS/Linux可以复用C#公共层，但需要各自经过验证的原生WebView binding和打包实现。

### 7.2 源码结构

```text
ui/webview/
  protocol/
  src/
    bridge/
    platform/
    components/
    build/
    testing/
  dotnet/
    ZAdmin.WebView.Core/
  targets/
    windows/
      dotnet/ZAdmin.WebView.Windows/
      packaging/
    macos/       future
    linux/       future
  package.json

apps/desktop/
  src/                Svelte/Web应用源码
  webview.config.ts
  generated/          不手改的协议/宿主入口
```

`ui/webview`保存可复用协议、TypeScript/Svelte facade、C#公共库、target实现和发布编排；`apps/desktop`保存产品页面、品牌资源、能力声明与发布配置。生成的目标宿主可以引用或组合`ZAdmin.WebView.Core`和选中的target库，但应用不能复制一套私有IPC实现。

推荐导出：

```text
@zadmin/webview
@zadmin/webview/svelte
@zadmin/webview/platform
@zadmin/webview/build
@zadmin/webview/testing
```

- 根入口提供typed client、能力合同和运行环境；
- `./svelte`提供DesktopProvider及系统能力组合组件；
- `./platform`提供DesktopPlatform、capability和guards；
- `./build`只在Node构建期加载，编排Web构建、dotnet publish和目标打包；
- `./testing`提供fake bridge、fixtures和协议一致性测试，不进入生产bundle。

### 7.3 多目标构建与产物

配置示例：

```ts
import { defineWebviewConfig } from '@zadmin/webview/build';

export default defineWebviewConfig({
	web: {
		command: 'pnpm build:web',
		assets: 'build'
	},
	targets: {
		'windows-x64': {
			package: 'msix'
		}
	}
});
```

命令合同：

```powershell
pnpm webview dev --target windows-x64
pnpm webview build --target windows-x64
pnpm webview build --target windows-arm64
pnpm webview build --target all
```

`all`依次运行已配置的独立target，不生成启动后再选择操作系统的通用二进制。目标产物示例：

```text
dist/desktop/
  windows-x64/
    ZAdmin.exe
    ZAdmin.msix
    manifest.json
    checksums.txt
  windows-arm64/
    ...
  macos-arm64/       future
    ZAdmin.app
    ZAdmin.dmg
  linux-x64/         future
    ZAdmin.AppImage
    ZAdmin.deb
```

每个target必须锁定RID、WebView runtime策略、C#依赖、原生binding、签名、安装和升级合同。公共包只声明能力，不允许把Windows路径、注册表、WinRT或WebView2类型泄漏给其他target。

### 7.4 保留的当前合同

从`@zadmin/tauri`保留并平台中立化：

- `DesktopPlatform`能力分组；
- `DesktopResult`、typed error和transport error归一化；
- `DesktopResourceScope`、listener和handle释放；
- URL allowlist、敏感操作确认和browser fallback；
- fake driver、fixtures和Svelte Provider；
- WindowFrame、WindowControls、FilePickerButton等桌面组合组件语义。

必须移除公共合同中的Tauri类型泄漏：

```text
DesktopRuntime = 'tauri'
isTauri
tauriVersion
Tauri BaseDirectory
Tauri LogOptions/Dialog/Monitor/Theme/StateFlags
```

### 7.5 公共协议与Windows WebView2传输

前端与C#使用显式版本化消息：

```ts
type WebViewMessage =
	| { v: 1; kind: 'request'; id: string; method: string; params: unknown }
	| { v: 1; kind: 'response'; id: string; ok: true; result: unknown }
	| { v: 1; kind: 'response'; id: string; ok: false; error: DesktopError }
	| { v: 1; kind: 'event'; topic: string; payload: unknown }
	| { v: 1; kind: 'cancel'; id: string }
	| { v: 1; kind: 'dispose'; handle: string };
```

要求：

- JSON schema或等价IDL是TypeScript和C#的单一类型源；
- command显式allowlist，不暴露反射式任意方法代理；
- 支持timeout、AbortSignal、event subscription、resource handle和dispose；
- 页面只从受控虚拟HTTPS origin加载；
- 每条native消息验证origin、版本、method、payload和大小；
- 禁止远程页面继承本地native能力；
- WebView宿主以普通用户权限运行，提权能力隔离到单独进程；
- Windows target对Evergreen WebView2缺失、更新、进程失败和user-data目录生命周期都有恢复路径；
- 未来target复用消息语义和C# dispatcher，但分别实现WebView transport和origin策略。

## 8. 目标应用目录

```text
apps/
  admin/             Web宿主与插件控制面
  docs/              ZUI、Miniapp和桌面文档/组件演示
  etl/               独立ETL应用
  miniapp/           一套Svelte源码和微信target验收宿主
  desktop/           一套Svelte/Web源码和WebView多桌面target验收宿主
```

迁移完成前保留`apps/wechat`和`apps/desktop`，新宿主达到对应验收后再删除旧入口。

## 9. 分阶段迁移

当前阶段状态：P0–P5完成，P6–P7进行中，P8不在v1范围。

### P0：冻结蓝图和验收清单（已完成）

- 评审本文；
- 确认包名、exports、target和非目标；
- 记录当前六包测试、构建、真实宿主和tarball基线；
- 不修改运行时代码。

建议提交：

```text
docs(ui): plan browser miniapp and webview platforms
```

### P1：合并浏览器ZUI（已完成）

```text
ui/zui-core + ui/zui → ui/zui
```

- 只移动和改名，不改变ICSS或组件行为；
- 保留Web、SSR、CSP、HMR、三浏览器和外部tarball验收；
- 更新admin、docs和desktop旧宿主；
- 不接触微信链路。

### P2：迁移SvelteKit ZUI集成（已完成）

```text
ui/zui/src/sveltekit/* → ui/sveltekit/src/zui/*
```

- 根入口保持server-safe；
- 更新`hooks.server.ts`到`@zadmin/sveltekit/zui`；
- 验证并发SSR请求隔离、CSP hash/nonce和hydration。

### P3：建立自包含Miniapp包（已完成）

```text
ui/miniapp + ui/zui-taro → ui/miniapp
```

- 第一阶段可暂时保留Taro后端；
- 立即切断对ZUI的依赖，建立独立Miniapp Theme、样式和`M*`组件；
- 公开包名和exports先稳定；
- 当前微信生产验收不得退化。

### P4：建立微信最小闭环（已完成）

- 建立App、Page、事件、样式、导航和storage；
- 实现MProvider、MBox、MStack、MText、MIcon、MButton、MInput和MImage；
- 每个组件有类型、编译fixture、运行时fixture和微信产物快照；
- 基础闭环稳定前不增加复杂组件和业务流程组件。

### P5：微信target脱离Taro（代码完成，DevTools待复核）

顺序：

1. 官方微信API类型；
2. 自有`wx` driver和managed platform；
3. App/Page/Component生命周期；
4. template/style/script/manifest emitter；
5. event和data scheduler；
6. native elements和组件收集；
7. Vite/build插件、sourcemap和HMR；
8. 微信开发者工具模拟器、真机和package acceptance；
9. 删除Taro依赖。

### P6：平台中立化桌面合同（进行中）

- 从`@zadmin/tauri`提取DesktopPlatform、error、scope、fake driver和组件语义；
- 清除所有Tauri类型泄漏；
- 旧Tauri实现继续通过现有生产验收。

### P7：实现C# WebView公共层与Windows target（进行中）

- 建立typed protocol生成与漂移检查；
- 建立`@zadmin/webview`的build、platform、svelte和testing入口；
- 实现C#公共dispatcher、能力合同、资源生命周期和Windows adapter；
- 实现WebView2虚拟HTTPS资源、IPC和Windows系统能力；
- 建立WinUI 3宿主、HMR、Release、安装、卸载和签名路线；
- 与Tauri宿主进行功能、安全、启动、内存和包体对比；
- 达到验收后删除Tauri入口和依赖。

### P8：增加其他桌面target

- 只在Windows target稳定后启动；
- 为macOS/Linux分别选择并验证原生WebView binding、窗口系统和打包器；
- 复用C#公共协议和能力facade，不复用未经验证的平台实现；
- 每个target独立验证安装、签名、升级、WebView安全、系统API和真实设备；
- v1完成定义不要求macOS/Linux，但公共合同不得阻止未来扩展。

## 10. 验收矩阵

### 10.1 ZUI与SvelteKit

- TypeScript、Svelte check、unit和coverage；
- Chromium、Firefox、WebKit组件测试；
- SSR并发隔离、critical CSS、CSP hash/nonce；
- HMR owner清理和变体上限；
- 外部tarball安装、check、build和SSR；
- admin、docs、plugins和WebView静态构建。

### 10.2 Miniapp公共层

- Svelte语法支持/拒绝矩阵；
- compiler IR快照；
- 微信compiler IR与产物快照；
- 首批8个基础组件的类型、编译和运行时fixture；
- 100次mount/unmount和资源回收；
- 事件、生命周期、context、error boundary；
- 静态样式、动态slot和不支持诊断；
- platform capability、guards、raw API和fake driver；
- package tarball不得带入ZUI、DOM、Taro或测试入口。

### 10.3 微信target

- 微信开发者工具真实模拟器；
- 首页、页面栈、导航和Fast Refresh；
- WXML/WXSS/JS/JSON有效性；
- API capability报告；
- WebView/Skyline证据分级；
- 账号、支付、手机号、权限、硬件和上传继续使用人工授权门禁。

### 10.4 WebView公共层与Windows target

- 协议生成物漂移检查；
- C#公共dispatcher、target注册和能力协商；
- 一套Web源码按RID生成独立桌面产物；
- origin、navigation、CSP和消息验证；
- 文件、对话框、剪贴板、通知、store、窗口和日志；
- timeout、cancel、event、resource dispose和崩溃恢复；
- browser fallback和fake driver；
- WebView2 Evergreen检测；
- HMR、Release、安装卸载、升级和签名；
- 与旧Tauri宿主的功能与性能对比。

## 11. MCP辅助开发基线

本节是2026-08-28的环境快照，不是产品运行合同。

### 11.1 微信开发者工具

已验证：

- `wechatide-skill`版本`0.3.9`与开发者工具内置skill相等；
- 登录有效，CLI未要求访问令牌；
- 能读取当前账号可管理的小程序列表；
- 能以`fullMode`打开`apps/wechat`；
- `automation_runtime_info`能读取当前首页、页面栈和模拟器系统信息；
- 本轮未执行预览、上传、云写、业务API或页面自动化。

环境注意：首次安装诊断脚本在含空格的Windows安装路径上把`C:\Program Files...`错误拆分为`C:\Program`，但返回的`wechatide.cmd`绝对路径存在且直接调用成功。后续应优先使用修复后的诊断脚本或绝对路径，不应因此重复下载安装开发者工具。

推荐用途：

- initializer：版本、登录、AppID、开窗、运行时上下文；
- compiler：刷新模拟器和构建npm；
- automator：点击、输入、滚动和断言；
- debugger：console、network、截图和运行时取证；
- previewer：手机预览和用户授权后的上传；
- project-config：仅管理`project.config.json`，不调用IDE。

### 11.2 WebStorm MCP

已验证当前会话中的`webstorm` MCP能连接`C:\code\zadmin`并完成：

- 列出`ui/`目录树；
- 语义搜索`DesktopPlatform`并返回源码坐标；
- 读取精确源码区间；
- 对TypeScript文件运行IDE inspection且无问题；
- 通过IDE Git模型确认`master`工作区干净。

后续优先用途：

- `search_symbol`定位TypeScript/Svelte符号；
- `get_symbol_info`和`analyze_calls`做语义依赖分析；
- `get_file_problems`获取WebStorm inspection；
- `reformat_file`按项目IDE规则格式化；
- `get_run_configurations`和`execute_run_configuration`执行已有配置；
- 任何调用都显式传`projectPath=C:\code\zadmin`，避免连接到错误项目。

### 11.3 Chrome

当前本机配置注册并启用了`chrome-devtools`与`node_repl` MCP，但本轮Codex工具会话没有暴露Chrome skill要求的浏览器执行桥，也没有可调用的Chrome/DevTools工具；同时没有发现正在运行的Chrome进程。因此本轮只确认“已注册”，没有确认扩展连接、标签页发现、页面读取、点击、截图或网络检查。

后续验证门槛：

1. 当前会话暴露Chrome skill要求的浏览器执行工具；
2. Chrome运行且ChatGPT浏览器扩展已连接；
3. 读取完整Chrome能力文档；
4. 只读列出标签页并绑定一个本地ZAdmin页面；
5. 验证页面读取、截图、console/network和本地交互；
6. 不用其他浏览器表面冒充Chrome成功。

## 12. 非目标

- 本蓝图不要求ZUI与Miniapp共享组件、Theme、Token或样式代码；
- 不承诺任意Web组件自动转换为小程序组件；
- 不承诺Miniapp支持全部Svelte或浏览器DOM行为；
- 支付宝小程序暂不纳入本蓝图，不创建空target、类型、产物、阶段或验收占位；
- 不在客户端实现支付签名、手机号兑换或密钥存储；
- 不因为规划C#就立即删除已验收的Tauri宿主；
- v1不宣称macOS或Linux已支持；未来target必须独立实现和验收，不能把C#可编译等同于桌面可发布；
- 不因为注册了MCP就声称IDE、浏览器或项目上下文已连接；
- 不在本蓝图阶段实现GPU UI、完整W3C引擎或原生操作系统组件替换。

## 13. 完成定义

只有满足以下条件，蓝图才可标记为“已完成”：

1. 四个目标包和两个目标应用目录落地；
2. 旧六包的公开能力完成迁移或有明确删除说明；
3. ZUI浏览器、SvelteKit SSR、微信Miniapp、WebView公共层和Windows target均有独立验收证据；
4. `@zadmin/miniapp`生产依赖中不存在ZUI和Taro；
5. Miniapp的微信产物来自Svelte源码并通过微信开发者工具；
6. `@zadmin/webview`能从同一Web源码发布Windows目标产物，且C# WebView2宿主达到旧Tauri宿主的能力、安全、HMR和发布门槛；
7. 文档、package exports、测试、构建和真实宿主在同一阶段保持一致；
8. 未完成的真机、账号、上传、签名和发布验证被明确列为边界，不以模拟或mock代替。
