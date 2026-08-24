# Svelte→Taro 生产实施蓝图

> 状态：Approved；用户已批准基础蓝图与微信平台能力增补，本文作为无人值守实施合同。  
> 日期：2026-08-25；基础蓝图起草于 2026-08-24，本版追加微信平台能力。  
> 本文只定义下一轮实现范围和执行合同，不表示这些能力已经实现。用户审阅通过前不得开始拆包或编码。

## 1. 目标

本轮实现后的仓库必须同时满足：

1. 把当前混合在一个包中的 ZUI 核心、Web 和 Taro 责任拆成独立 pnpm 包。
2. Web 端保持当前已经验收的能力、组件、行为和外部安装体验，不新增 Web 组件或公开 API。
3. 新建生产可维护的 Svelte→Taro framework plugin，让 Taro 4.2.1 能编译和运行受支持的 Svelte 5 组件。
4. 新建仓库内微信小程序宿主，使用 Taro plugin 和 ZUI Taro 组件进行真实开发者工具验证。
5. 微信端第一阶段实现现有五个基础组件、三个必要的平台流程组件与 ICSS 子集，不扩展 Web 组件或业务组件。
6. 建立一条单命令、可观察、可自动恢复的 Fast Refresh 开发链。
7. 通过单元、编译器、renderer、包发布、微信开发者工具、自动化交互和性能门禁，把已声明的 Taro plugin 支持范围维护到生产可用。
8. 每个 Git 阶段都可构建、可验证、可交接；不推送远端。
9. 为登录、隐私、支付、媒体、定位、蓝牙、NFC、Wi-Fi、传感器、网络、文件、消息等微信能力建立统一的类型、探测、权限、资源清理和错误合同。
10. 允许业务插件通过普通 package 的 ./taro 入口静态声明路由及 required/optional 平台能力，并获得完整 TypeScript 推断。
11. 对账号、商户、隐私声明或真实硬件受限的能力使用明确验证等级；无人值守期间完成文档、类型、mock 和静态验证，但不伪造真机或真实交易结果。

目标不是做一个演示性质的 Svelte loader，而是完成以下闭环：

```text
.svelte source
  → Svelte custom renderer compiler
  → @zadmin/svelte-taro renderer
  → Taro DOM/runtime
  → 微信 WXML/WXSS/JS
  → 微信开发者工具
  → screenshot/console/interaction evidence
  → clean production build and tarball acceptance
```

## 2. 本轮明确不做

以下内容不属于本轮：

- 不新增 Web ZUI 组件。
- 不改变 Web ZUI 的视觉、Props 语义、ICSS 单一 class API、SSR、CSP、hydration 或 HMR 行为。
- 不实现完整 Taro React/Vue 组件库。
- 不实现支付宝、抖音、百度、QQ 等其他小程序平台。
- 不实现微信官方小程序插件 compileType=plugin。
- 不实现任意第三方不可信代码沙箱。
- 不把 SvelteKit 客户端或服务端运行时塞进小程序。
- 不把 Taro plugin 做成服务器微服务或网络 RPC。
- 不重新包装或复制 Taro 4.2.1 的每一个 API 类型；完整原始能力继续由 Taro.* 提供，高层 API 只解决跨能力的一致生命周期与安全问题。
- 不把 AppSecret、session_key、access_token、商户私钥、API v3 key、paySign 生成或其他服务端密钥放进小程序包。
- 不在小程序生产环境下载、eval 或热安装新的业务插件；业务插件列表、路由和代码在构建时静态确定，变化后必须重新构建并发布小程序。
- 不在基础库中实现具体 BLE 设备协议、厂商 SDK、支付订单系统、退款、对账、地图 POI/路线服务、AI 模型或广告业务策略。
- 不把“官方文档已核对”写成“真实设备已验证”或“商户能力已验收”。
- 不要求用户在无人值守执行期间扫码、支付、授权隐私、提供手机号、打开硬件或补充商户配置。
- 不实现所有 Svelte DOM 专属语法。
- 不承诺状态完全保留的真正 HMR。
- 不实现 Taro React 专属 CompileMode。
- 不修改或提交本机的 Taro、Svelte 参考源码仓库。
- 不修改 C:\Users\lionheart\WeChatProjects\miniprogram-1 的业务源码；它只保留为开发者工具能力参考项目。
- 不创建 @zadmin/zui 兼容转发包；该 npm 名称尚未公开发布。
- 不发布 npm、不上传微信体验版、不推送 Git，除非用户另行明确授权。

## 3. 当前基线

### 3.1 ZAdmin

- 仓库：C:\code\zadmin。
- 当前 HEAD：d8cbbcf。
- 当前分支：master，与 origin/master 一致。
- 本文起草前工作树：干净；本 Draft 是本轮唯一仓库变更。
- pnpm：11.22.0。
- Node：24.18.0。
- TypeScript：6.0.3。
- Web Vite：8.2.2。
- Svelte：5.56.10。
- SvelteKit：2.70.3。

### 3.2 当前 Web ZUI

当前 @zadmin/zui@0.1.0 已完成生产验收，包含：

- defaultTheme、defineTheme。
- 单一 class 返回值的 icss()。
- runtime class rule。
- 动态叶子 inline CSS variable 编译优化。
- BrowserStyleSheet。
- SSR、CSP、hydration、HMR。
- SvelteKit handle。
- ZuiProvider。
- Box。
- Stack。
- Text。
- Button。
- Vitest、Browser tests、Playwright、clean tarball 外部安装验证。

这些能力是本轮 Web 回归合同，不是重写建议。

### 3.3 Taro

- 固定版本：4.2.1。
- 本地参考目录：C:\Users\lionheart\WebstormProjects\taro。
- 参考 tag：v4.2.1。
- 参考目录当前 pnpm-lock.yaml 已有外部修改；实现期间只读，不清理、不提交、不覆盖。
- 官方 Solid framework plugin 是 Svelte adapter 的主要结构参考。
- Taro Vite runner 需要隔离 Vite 4。

### 3.4 Svelte custom renderer

- 上游 PR：sveltejs/svelte#18042。
- 固定 commit：eb7532dd70fb11b36258347c44cf3910d244f987。
- 固定预构建包：https://pkg.svelte.dev/svelte/c/eb7532dd70fb11b36258347c44cf3910d244f987。
- 本地只读 worktree：C:\Users\lionheart\WebstormProjects\svelte-custom-renderer。
- PR 当前尚未合并，API 标记 experimental。
- 实现期间固定该 commit，不自动追随 PR head。
- 该预构建包自身版本仍为 5.56.10；pnpm lockfile 必须同时记录 commit URL、最终 tarball URL 和完整性摘要。
- apps/wechat 直接安装该 commit URL；zui-taro、svelte-taro 的测试环境也使用同一 artifact。
- Web 继续使用 npm registry 的 Svelte 5.56.10，不应用全局 pnpm patch，不让实验 runtime 进入 admin/docs。
- zui-taro 与 svelte-taro 把 svelte=5.56.10 声明为精确 peer，并在启动时验证 svelte/renderer；若用户误装 registry 版本，应输出带正确安装 URL 的 fail-fast 错误。
- 生产可用声明只针对 ZAdmin 固定依赖组合，不宣称兼容所有 Svelte 5 版本。

上游当前明确限制：

- 普通元素 bind: 不可用。
- transition:/animate:/in:/out: 不可用。
- svelte:window、svelte:document、svelte:body、svelte:head 不可用。
- css: injected 不可用。
- createRawSnippet 不可用。
- custom renderer 不支持 hydration。
- 跨 renderer snippet 有限制。

第一阶段组件和测试必须避开这些语法，或通过 ZUI 组件级 Props/binding 提供替代。

### 3.5 微信开发环境

- 微信开发者工具：Stable 2.02.2608040。
- wechatide-skill：0.3.9。
- wechat-devtools MCP：已配置并验证。
- 服务端口：当前 43808，由 wechatide mcp 自动发现，不写死到仓库。
- 当前登录：有效。
- CLI token：当前不要求。
- 基础能力已经验证：状态、当前页、页面栈、systemInfo、截图、console。

## 4. 锁定架构决策

### 4.1 包形态

本轮采用：

```text
packages/
  zui-core/
  zui-web/
  zui-taro/
  svelte-taro/

apps/
  wechat/
```

发布名称：

```text
@zadmin/zui-core
@zadmin/zui-web
@zadmin/zui-taro
@zadmin/svelte-taro
@zadmin/wechat-app
```

@zadmin/wechat-app 必须设置 private=true；它是验收宿主，不发布到 registry。其余四个是可独立 pack、可供外部 pnpm 项目安装的库。

### 4.2 依赖方向

```text
                         @zadmin/zui-core
                          ▲             ▲
                          │             │
               @zadmin/zui-web   @zadmin/zui-taro

                               @zadmin/svelte-taro ──→ Taro 4.2.1 runtime

apps/admin ──→ zui-web
apps/docs  ──→ zui-web
apps/wechat ─→ zui-taro + svelte-taro
```

禁止：

- zui-core 依赖 zui-web、zui-taro、Svelte、SvelteKit、Taro、DOM、wx 或 Node。
- zui-web 依赖 zui-taro。
- zui-taro 依赖 zui-web。
- zui-taro 承担 Taro CLI、App/Page 生命周期或开发 supervisor。
- svelte-taro 依赖 ZUI。
- apps/admin 或 apps/docs 引入 Taro 依赖。

### 4.3 版本

第一阶段：

```text
@zadmin/zui-core   0.1.0
@zadmin/zui-web    0.1.0
@zadmin/zui-taro   0.1.0
@zadmin/svelte-taro 0.1.0
```

三套 ZUI 包在 1.0 前锁步发布。物理包独立，但不提前维护复杂兼容矩阵。

依赖兼容合同：

| 包                     | 常规依赖                    | 精确 peer                                                |
| ---------------------- | --------------------------- | -------------------------------------------------------- |
| zui-core               | 无平台依赖                  | 无                                                       |
| zui-web                | zui-core                    | svelte>=5.56.0 <6；@sveltejs/kit^2.20（optional）        |
| zui-taro               | zui-core                    | svelte=5.56.10、Taro runtime/components=4.2.1            |
| svelte-taro            | 无 ZUI 依赖                 | svelte=5.56.10、Taro service/runtime/taro=4.2.1          |
| apps/wechat（private） | zui-taro、svelte-taro、Taro | 直接固定 custom-renderer artifact，负责满足上述全部 peer |

peerDependencyRules 不得静默放宽这些版本；外部 clean fixture 必须证明从 tarball 安装时得到单份 Taro runtime 和单份 custom-renderer Svelte runtime。

### 4.4 构建器

- Web 继续使用当前 Vite 8 和 @sveltejs/vite-plugin-svelte 7。
- 微信默认使用 Taro 4.2.1 Vite runner 与 Vite 4.5.14。
- 微信不直接安装 Web 的 @sveltejs/vite-plugin-svelte 7。
- svelte-taro 自己提供最小 Vite 4 Svelte transform。
- Webpack5 不是默认实现。
- 只有满足本文“Vite 失败回退门禁”时，才允许把微信构建切到 Webpack5；不得同时维护两套默认构建链。

### 4.5 开发刷新语义

第一阶段正式术语是 Fast Refresh：

```text
保存源码
  → 增量构建
  → 微信开发者工具重新编译
  → 页面重新加载到同一路由
  → 自动验证 buildId 和目标行为
```

不宣称：

```text
Svelte 组件实例和所有本地状态原地保留的真正 HMR
```

## 5. 最终目录

```text
C:\code\zadmin
  apps/
    admin/
    docs/
    etl/
    wechat/
      config/
      src/
        pages/
        app.config.ts
        app.svelte
        app.wxss
      tests/
      package.json
      project.config.json
      project.private.config.json
      tsconfig.json

  packages/
    auth/
    core/
    drizzle/
    oss/
    postgres/
    redis/
    sveltekit/
    svelte-taro/
      src/
        compiler/
        module/
        native/
        platform/
        plugin/
        renderer/
        runtime/
        testing/
        vite/
        index.ts
      tests/
      package.json
      tsconfig.json
      vite.config.ts

    zui-core/
      src/
        components/
        icss/
        theme/
        index.ts
      tests/
      package.json
      tsconfig.json

    zui-web/
      src/
        lib/
          compiler/
          components/
          icss/
          sveltekit/
          index.ts
          internal.ts
      tests/
      package.json
      svelte.config.js
      tsconfig.json
      vite.config.ts

    zui-taro/
      src/
        compiler/
        components/
        icss/
        runtime/
        index.ts
        internal.ts
      tests/
      package.json
      svelte.config.js
      tsconfig.json

  plugins/
    approval/
    crm/
    erp/
```

入口文件、配置和 Manifest 是目录同类规则的允许例外；不为凑数量创建空 utils/common/base。

## 6. zui-core 合同

zui-core 是纯 TypeScript 设计系统内核，不是渲染包。

### 6.1 迁入

- theme/default.ts。
- theme/define.ts。
- theme/properties.ts。
- theme/types.ts。
- theme/units.ts。
- icss/builder.ts。
- icss/hash.ts。
- icss/types.ts。
- 目标无关的 value normalization。
- 组件视觉契约：ButtonVariant、ButtonSize、StackDirection、StackGap 等。

### 6.2 不迁入

- Svelte Snippet。
- svelte/elements HTMLAttributes。
- HTMLElement/ref。
- Svelte context/action。
- BrowserStyleSheet。
- Stylis。
- SSR style tag。
- Svelte preprocess。
- SvelteKit handle。
- Taro/wx 类型。

### 6.3 动态槽位

当前 IcssRuntimeSlot 把动态槽写成 CSS variable：

```text
variable: --name
```

Core 必须改为目标无关：

```ts
export interface IcssDynamicSlot {
	readonly id: string;
	readonly debugName?: string;
}
```

Web emitter 映射为 CSS custom property，Taro emitter 映射为 WXML/Taro style binding。Web 最终 class、CSS rule、变量更新次数和公开 API 必须与当前行为等价。

### 6.4 组件设计 Props

Core 只保存平台无关设计属性，例如：

```ts
export interface ButtonDesignProps {
	disabled?: boolean;
	loading?: boolean;
	size?: ButtonSize;
	variant?: ButtonVariant;
}
```

HTML attributes、微信 open-type、事件对象、ref、Snippet 留在 renderer 包。

## 7. zui-web 合同

zui-web 是当前 @zadmin/zui 的重命名和平台隔离，不是功能重写。

### 7.1 保留

- 所有现有公开组件。
- icss() 单一 class API。
- 无 compiler 时完整 runtime class rule。
- inline-vars 与 class-rules。
- BrowserStyleSheet。
- SSR/CSP/hydration/HMR。
- SvelteKit handle。
- 当前 Props、HTML attrs、ref、style 合并语义。
- 当前测试、覆盖、Playwright 和 clean tarball 验收。

### 7.2 不新增

- 不新增 Input、Modal、Form 或任何 Web 组件。
- 不新增 recipe/variant 系统。
- 不改变 class 命名和缓存策略，除非目标无关槽位迁移必须；任何变化都要由现有验收证明语义等价。
- 不创建 @zadmin/zui 转发包。

### 7.3 消费者迁移

```text
apps/admin: @zadmin/zui → @zadmin/zui-web
apps/docs:  @zadmin/zui → @zadmin/zui-web
文档示例和测试 fixture 同步修改
```

## 8. svelte-taro framework plugin

### 8.1 Node plugin

Taro service 通过 require 加载 plugin，因此发布入口必须提供 CJS：

```text
dist/plugin.cjs
```

职责：

- 参数 schema。
- 导出 defineSvelteConfig()，在不使用 any 的前提下把 Taro 当前封闭的 framework 联合类型安全扩展为 svelte。
- 仅当 ctx.initialConfig.framework=svelte 时启用。
- 通过 modifyRunnerOpts 设置 frameworkExts=[.svelte]。
- 通过 modifyRunnerOpts 规范化 compiler 对象，并把 Svelte compiler plugin 与 mini integration plugin 插到 vitePlugins 的确定位置。
- mini integration plugin 在 buildStart 通过 getViteMiniCompilerContext(this) 注入 loader metadata。
- framework=svelte 让 Taro CLI 跳过内置 React/Vue/Solid framework plugin；Taro platform plugin 继续负责注入 process.env.FRAMEWORK。
- 收集原生组件标签。
- 构建开始/成功/失败事件。
- dev build status。

不在同一 Taro Kernel 内删除 require.cache 后重注册 Hook。Taro 没有 Hook disposer；Node plugin 源码变化通过 supervisor 重启 Taro 子进程。

### 8.2 Vite compiler plugin

输入：

```text
.svelte source
```

输出：

- custom renderer client JS。
- 通过稳定 virtual CSS id 输出 external CSS，让 Taro 的样式链生成 WXSS。
- source map。
- compiler warning/error。
- watch dependencies。
- development buildId。
- 每个 .svelte 模块对应的原生组件收集 marker。

编译配置：

```ts
{
  generate: 'client',
  css: 'external',
  dev: mode === 'development',
  hmr: false,
  experimental: {
    customRenderer: '@zadmin/svelte-taro/renderer'
  }
}
```

第一阶段不依赖 import.meta.hot。组件更新通过 Taro watch 与开发者工具 reload。

组件标签收集必须走 Taro 4.2.1 已有的 onParseCreateElement 合同，不直接 import 或修改 taro-vite-runner 的内部 componentConfig：

1. Svelte transform 从模板 AST 收集静态小程序标签。
2. 为该模块生成一个稳定、以 .taro-components.tsx 结尾的 marker module；不得使用会被 Taro isVirtualModule 跳过的 \0/virtual: id。
3. marker 只包含不可执行的 createElement('view') 等语法标记，供 Taro native-support 的 moduleParsed 阶段识别。
4. Rollup 产物必须确认 marker 已被 tree-shake，不增加运行时代码。
5. 动态 svelte:element 只有在候选标签可静态枚举时允许；否则编译报错。

这条桥接必须由 Taro 4.2.1 源码 fixture 和最终 base.wxml/WXSS 产物双重验证，不能只断言 compiler 返回成功。

### 8.3 Renderer

必须实现并测试：

- createFragment。
- createElement。
- createTextNode。
- createComment。
- nodeType。
- getNodeValue。
- getAttribute。
- setAttribute。
- removeAttribute。
- hasAttribute。
- setText。
- getFirstChild。
- getLastChild。
- getNextSibling。
- insert。
- remove。
- getParent。
- addEventListener。
- removeEventListener。

Renderer 将操作映射到 Taro document/TaroNode/TaroElement，不复制完整 DOM/BOM。

### 8.4 Runtime

必须实现：

- createSvelteApp。
- App mount/unmount。
- Page mount/unmount。
- app/page context。
- onLaunch/onShow/onHide/onError。
- onLoad/onReady/onUnload。
- share 生命周期注册基础。
- App/Page 平台资源作用域。
- API listener、传感器、socket、相机、蓝牙和其他外部资源的统一 disposer 注册。
- 页面级错误隔离。
- effect、listener、context 清理。
- 多页面实例隔离。

### 8.5 Loader metadata

必须输出：

- creator=createSvelteApp。
- creatorLocation=@zadmin/svelte-taro/runtime。
- frameworkArgs。
- mock app。
- 页面与 App 配置补全。

不使用旧 tarojs-plugin-svelte 对 Svelte 编译产物做 AST 字符串补丁。

### 8.6 Public exports

```text
@zadmin/svelte-taro
@zadmin/svelte-taro/module
@zadmin/svelte-taro/native
@zadmin/svelte-taro/platform
@zadmin/svelte-taro/renderer
@zadmin/svelte-taro/runtime
@zadmin/svelte-taro/testing
```

compiler/vite/plugin 内部辅助函数不承诺稳定，除非在根入口明确导出。

## 9. Svelte 支持矩阵

### 9.1 本轮必须支持

- runes 模式。
- $state。
- $derived。
- $effect 与 cleanup。
- $props。
- $bindable 的组件级 binding。
- onMount/onDestroy。
- {#if}。
- keyed {#each}。
- {#key}。
- 基础 {#await}。
- 同 renderer 组件嵌套。
- 同 renderer snippets。
- setContext/getContext。
- 普通事件。
- class、class:、style 和普通 attributes。
- <svelte:boundary> 与页面级错误恢复。
- 组件 mount/unmount。

### 9.2 本轮明确拒绝

- 普通元素 bind:。
- transition:/animate:/in:/out:。
- svelte:window/document/body/head。
- css: injected。
- createRawSnippet。
- custom renderer hydration。
- 跨 renderer snippet。
- Portal。
- 浏览器 DOM ref。

拒绝必须在编译期给出带文件、行列、错误码和替代建议的诊断，不能静默降级。

## 10. zui-taro 范围

### 10.1 组件

基础设计组件：

- ZuiProvider。
- Box。
- Stack。
- Text。
- Button。

微信平台流程组件：

- CapabilityGate：根据 supported、permission、privacy、account/device requirement 渲染内容或明确 fallback。
- PrivacyConsent：封装 open-type=agreePrivacyAuthorization、查看隐私协议和同意事件，但不替用户作出选择。
- PhoneNumberButton：封装 open-type=getPhoneNumber 与强类型一次性 code 事件，不兑换、不展示、不记录手机号。

不新增 Web Input，也不新增 Taro Input。普通支付、扫码、定位和硬件动作继续使用 Button 调用 platform API，不为每个方法创建一个按钮组件。

### 10.2 组件策略

- 共享 zui-core 设计 Props、Theme、Token 和纯逻辑。
- Web/Taro 允许各自拥有薄 Svelte 模板。
- Taro Button 保留设计 Props，同时完整支持当前微信 button open-type 与对应强类型事件。
- camera、map、canvas、video、live-player、live-pusher、web-view 等是平台原生元素，由 @zadmin/svelte-taro/native 提供类型，不伪装成 ZUI 设计组件。
- 不增加第四个共享 Svelte 源码包。
- 至少三个组件被真实证明模板完全相同后，才允许后续提取生成器或 source package。

### 10.3 ICSS Taro 子集

必须支持：

- 平面 declarations。
- Theme token。
- px、百分比和明确的 rpx。
- 静态 class/WXSS。
- 动态叶子 style binding。
- class 稳定哈希。
- 空值跳过。
- finite number 校验。
- 属性和单位能力诊断。

第一阶段可拒绝：

- pseudo element。
- 任意 selector。
- container query。
- supports。
- 不可靠的 hover/focus 语义。
- 依赖浏览器 CSSOM 的行为。

Taro 端必须使用 compiler。无法安全编译的 ICSS 不允许假装生成有效 class；应报错。Web 端继续保留无 compiler runtime fallback。

### 10.4 动态样式

```text
静态结构 → WXSS class
动态叶子 → Taro style attribute / WXML binding
```

默认不依赖 CSS custom property。每轮响应式变化：

- 不生成新 class。
- 不生成新 WXSS rule。
- 合并同批 style 更新。
- 只更新变化槽位。

## 11. apps/wechat

apps/wechat 是仓库内受版本控制的 Taro 宿主。现有 miniprogram-1 不作为生产源码。

### 11.1 Taro 配置

- framework=svelte，并把 @zadmin/svelte-taro 显式列入 plugins；这会跳过 CLI 内置 React/Vue/Solid framework plugin。
- compiler.type=vite。
- sourceRoot=src。
- outputRoot=dist。
- mini.compile.include 包含 zui-taro、svelte-taro runtime 和本地链接插件真实路径。
- mini.enableSourceMap=true。
- Taro 包版本精确锁定。

配置入口使用 adapter 导出的类型安全 helper：

```ts
import { defineSvelteConfig } from '@zadmin/svelte-taro';

export default defineSvelteConfig({
	projectName: 'zadmin-wechat',
	framework: 'svelte',
	plugins: [['@zadmin/svelte-taro', { target: 'weapp' }]],
	compiler: { type: 'vite' },
	sourceRoot: 'src',
	outputRoot: 'dist',
	mini: {
		enableSourceMap: true
	}
});
```

helper 只做类型收窄、默认值和早期校验，不隐藏或改写用户配置；最终交给 Taro 的仍是普通 IProjectConfig 兼容对象。

### 11.2 微信项目配置

project.config.json：

```json
{
	"miniprogramRoot": "./dist",
	"compileType": "miniprogram",
	"appid": "touristappid",
	"setting": {
		"es6": false,
		"enhance": false,
		"postcss": false,
		"minified": false,
		"uploadWithSourceMap": true
	}
}
```

project.private.config.json：

- 本机真实 AppID。
- compileHotReLoad=true。
- urlCheck 由开发环境决定。
- Skyline 开关。
- 不提交 Git。

真实 AppID 从当前已授权项目本地复制到 private 文件；不得输出到日志或写入公共文档。

### 11.3 验证页

基础组件页只使用：

- ZuiProvider。
- Box。
- Stack。
- Text。
- Button。
- defaultTheme/defineTheme。
- 静态和动态 ICSS 子集。

行为：

1. 显示组件和 Theme 信息。
2. Button 点击增加计数。
3. Button 点击切换主题或动态颜色。
4. {#if} 切换一个 Text。
5. keyed {#each} 增加/删除/排序小列表。
6. 显示 development buildId。

平台能力页使用：

- CapabilityGate、PrivacyConsent、PhoneNumberButton。
- capability catalog 与 support/verification grade。
- 登录、支付、扫码、相机、定位、BLE、NFC、Wi-Fi、传感器、网络、文件、订阅消息的安全演示入口。
- 只对当前环境可自动调用的 API 执行真实调用；账号、用户手势、商户或真机受限项显示原因和文档核对状态。
- 页面加载时不得自动弹授权、隐私、手机号、订阅、支付或系统设置；所有敏感动作必须来自明确用户手势，自动测试默认使用 mock driver。
- 不在页面、console、截图或测试快照中输出登录 code、手机号 code、支付参数、精确位置、蓝牙 payload 或其他敏感值。

不得为了演示增加 Web 端新组件。

## 12. 依赖与 catalog

新增 named catalog：

```yaml
catalogs:
  wechat:
    '@tarojs/cli': 4.2.1
    '@tarojs/components': 4.2.1
    '@tarojs/helper': 4.2.1
    '@tarojs/plugin-platform-weapp': 4.2.1
    '@tarojs/runtime': 4.2.1
    '@tarojs/service': 4.2.1
    '@tarojs/shared': 4.2.1
    '@tarojs/taro': 4.2.1
    '@tarojs/vite-runner': 4.2.1
    vite: 4.5.14
    miniprogram-api-typings: 5.2.3
```

本轮不执行 upload，因此不预装 miniprogram-ci；未来获得上传授权时再按当时官方版本单独引入，不能为尚未使用的发布路径增加依赖。

miniprogram-api-typings 只供隔离的 weapp fallback driver 和类型一致性测试使用，不进入公共 Platform API，也不与 @tarojs/taro 类型手工合并；业务消费者只面对 Taro 4.2.1 与 @zadmin/svelte-taro 导出的类型。

Svelte custom renderer 不放入 named catalog，避免和 Web 的 registry Svelte 同名混淆。apps/wechat 使用精确 direct dependency：

```json
{
	"dependencies": {
		"svelte": "https://pkg.svelte.dev/svelte/c/eb7532dd70fb11b36258347c44cf3910d244f987"
	}
}
```

pnpm-lock.yaml 中必须保留这个 commit 地址解析出的 tarball 和 integrity。禁止改为 PR branch、latest、短 SHA、本机 file:、手工复制 node_modules 或未校验 tgz。

发布包约束：

- zui-core 不携带 Svelte/Taro。
- zui-web 的 peer 由普通 registry Svelte 满足。
- zui-taro、svelte-taro 不捆绑第二份 Svelte/Taro runtime。
- 平台类型直接复用精确锁定的 @tarojs/taro 与 @tarojs/components；不引入第二套手写 wx API declarations。
- zui-taro、svelte-taro 的 README 与错误信息都给出上述精确 artifact 安装方式。
- 外部 tarball fixture 从空目录安装四个库、精确 Taro 和精确 Svelte artifact，再执行 typecheck/build；不得依赖 workspace symlink。

禁止：

- Taro 版本使用 caret 混装。
- apps/wechat 使用 root Vite 8。
- zui-web 使用 Vite 4。
- Taro CLI 全局版本参与构建。
- production lockfile 残留 link: 或本地绝对 file:。

## 13. Fast Refresh

### 13.1 单命令

```powershell
pnpm dev:wechat
```

内部只允许一个 supervisor：

```text
WeChat supervisor
  ├── svelte-taro package build/watch
  ├── Taro Vite build --type weapp --watch
  ├── external plugin realpath watcher
  ├── build status/buildId
  └── child process restart and cleanup
```

不增加多层 concurrently 递归启动。退出时必须结束全部子进程。

### 13.2 文件分类

| 变化                             | 动作                          | 目标        |
| -------------------------------- | ----------------------------- | ----------- |
| app/page .svelte                 | Taro 增量构建                 | 3 秒内可见  |
| zui-taro component/runtime       | Taro 增量构建                 | 3 秒内可见  |
| business plugin src/taro         | Taro 增量构建                 | 3 秒内可见  |
| svelte-taro renderer/runtime     | package build + Taro 增量构建 | 5 秒内可见  |
| svelte-taro platform/native      | package build + Taro 增量构建 | 5 秒内可见  |
| svelte-taro plugin/compiler/vite | package build + 自动重启 Taro | 8 秒内可见  |
| app.config/route/capability      | 自动重启 Taro并恢复路由       | 10 秒内可见 |
| package.json/lockfile            | 停止并重新安装/启动           | 明确日志    |

时间是当前 Windows 机器的 p95 验收目标，不是所有机器承诺。

### 13.3 构建状态

development 注入：

```text
globalThis.__ZADMIN_BUILD_ID__
```

每次成功构建变化；失败构建不更新。生产构建必须消除该字段。

supervisor 记录：

- source revision。
- buildId。
- start/end。
- duration。
- success/error。
- restart reason。

输出到忽略目录，不写入发布包。

### 13.4 开发者工具刷新

成功构建后：

1. 先等待开发者工具自动编译。
2. 查询运行时 buildId。
3. 已更新则不调用 simulator_refresh。
4. 未更新时只调用一次 simulator_refresh。
5. refresh 成功后仍检查 console/buildId，不能把“已触发”当“已编译成功”。

## 14. 外部插件开发

外部插件使用正常 package 依赖传递类型。

可选微信入口：

```json
{
	"exports": {
		"./taro": {
			"types": "./src/taro/index.ts",
			"import": "./dist/taro/index.js"
		}
	}
}
```

入口返回静态 Taro module：

```ts
import { defineTaroModule, wechatCapabilities } from '@zadmin/svelte-taro/module';

export default defineTaroModule({
	id: '@example/inventory',
	routes: ['./pages/inventory/index.svelte'],
	capabilities: {
		required: [wechatCapabilities.identity.login, wechatCapabilities.media.scan],
		optional: [wechatCapabilities.hardware.bluetoothLe]
	},
	setup(context) {
		const network = context.platform.system.network.observe();
		context.scope.add(network);
	}
});
```

required/optional 数组使用 const capability descriptor，因此 setup context、构建诊断和下游消费者都保留具体类型。独立声明少量对方能力类型仍可作为并行编译逃生通道，但运行时实现统一从 context/platform 获取。

开发态：

- app 级私有配置声明本地 realpath。
- package dependency 使用 link: 或受控 workspace link。
- Taro mini.compile.include 加入 realpath。
- 依赖预构建排除该源码。
- watcher 跟随真实路径。
- ./taro 源码、能力声明和路由进入同一 watch graph。

生产态：

- 替换为 registry/Git commit/tarball 版本。
- frozen lockfile。
- 不允许 link:/file: 和开发绝对路径。
- 插件及路由在小程序构建时静态打包；安装、卸载或升级后必须重新构建、审核和发布小程序，不能从网络加载可执行 JavaScript。

src/taro 变化走增量构建；package.json、依赖图、路由或 capability manifest 变化重启 Taro。开发态仍可做到保存后 Fast Refresh，这与生产态动态安装是两件不同的事。

## 15. 微信平台能力架构

### 15.1 三层 API

平台能力只保留三层，不为同一 API 发明多套调用方式：

```text
Layer 1  platform.raw = Taro
         完整、强类型、零额外语义的逃生通道

Layer 2  platform.identity / commerce / media / location / hardware / system / messaging
         只包装权限、隐私、能力探测、用户取消、资源生命周期、错误和测试驱动

Layer 3  zui-taro platform flow components
         只负责必须依赖用户手势或需要统一 fallback 的可视流程
```

禁止：

- 把 Taro Promise 再包一层但不增加任何生命周期或安全价值。
- 复制 miniprogram-api-typings 或 @tarojs/taro 的所有接口定义。
- 用一个包含数百个方法的自研 WxFacade 取代 Taro。
- 在组件内隐式申请权限、自动登录、自动订阅或自动调起支付。

### 15.2 Platform service

公开形态：

```ts
export interface WeChatPlatform {
	readonly support: PlatformSupport;
	readonly privacy: PrivacyCapability;
	readonly identity: IdentityCapability;
	readonly commerce: CommerceCapability;
	readonly media: MediaCapability;
	readonly location: LocationCapability;
	readonly hardware: HardwareCapability;
	readonly system: SystemCapability;
	readonly messaging: MessagingCapability;
	readonly compute: ComputeCapability;
	readonly raw: typeof import('@tarojs/taro');
}
```

创建和获取：

```ts
const platform = createWeChatPlatform({ driver: taroPlatformDriver });
const pagePlatform = platform.forScope(pageScope);
```

- App 持有 driver 与无页面归属的共享状态。
- 每个 Page/组件持有子 scope。
- getWeChatPlatform() 从 Svelte context 获取当前 scope，不创建隐藏全局单例。
- testing 使用相同接口注入 fakePlatformDriver；业务代码不需要判断测试环境。
- 默认 driver 只调用 Taro 4.2.1 公开 API；找不到 Taro 包装的微信专属能力时，才允许通过隔离的 weapp driver 调用 wx，并保留同一能力描述符和错误模型。

本轮公开类型明确命名为 WeChatPlatform，capability id 使用 wechat.*。未来支付宝、抖音等目标可以复用 scope/error/driver 基础，但必须提供各自 descriptor 和实现；不把微信支付、隐私、open-type 或硬件语义强行伪装成跨平台统一 API。

### 15.3 Capability descriptor

每项能力由一个 const descriptor 描述：

```ts
export interface CapabilityDescriptor<Id extends string> {
	readonly id: Id;
	readonly minBaseLibrary?: string;
	readonly clients?: readonly ('ios' | 'android' | 'harmony' | 'windows' | 'mac')[];
	readonly renderers?: readonly ('webview' | 'skyline')[];
	readonly officialPluginSupport: 'supported' | 'unsupported' | 'conditional';
	readonly permissionScope?: string;
	readonly requiredPrivateInfo?: string;
	readonly requiredBackgroundMode?: string;
	readonly requiresPrivacyConsent: boolean;
	readonly requiresUserGesture: boolean;
	readonly requiresBackend: boolean;
	readonly requiresAccountEntitlement: boolean;
	readonly billing: 'none' | 'possible' | 'required';
	readonly dataClasses: readonly (
		'identity' | 'personal' | 'location' | 'financial' | 'device' | 'media'
	)[];
	readonly realDevice: 'no' | 'recommended' | 'required';
	readonly resource: 'one-shot' | 'listener' | 'session' | 'connection' | 'context';
}
```

catalog 由少量按领域组织的声明文件生成类型、文档和构建诊断；不生成业务实现。所有 descriptor 必须有微信官方文档 URL、Taro 4.2.1 类型来源和最后核对日期。计费价格和开放类目可能变化，只记录 billing 状态与官方入口，不把当前单价硬编码进运行时。

运行时 availability 不是 boolean，而是可解释状态：

```text
available
unsupported-platform
unsupported-base-library
privacy-required
permission-required
permission-denied
user-gesture-required
account-entitlement-required
real-device-required
device-disabled
temporarily-unavailable
```

support 层综合 Taro.canIUse、基础库、系统/设备信息、隐私状态、getSetting 和 driver probe。账号类目、商户开通和后台审核无法由客户端可靠探测时，不猜测为 available，而是返回 account-entitlement-required 或 unknown entitlement 诊断。

### 15.4 资源作用域

下列调用必须返回受 scope 管理的 handle，而不是裸回调：

- on/off 事件监听。
- 前台/后台定位监听。
- accelerometer、compass、gyroscope、device motion。
- RecorderManager、CameraContext frame listener、live/VoIP context。
- Bluetooth adapter、BLE discovery、BLE connection、BLE peripheral。
- iBeacon discovery。
- NFC discovery/tag connection。
- Wi-Fi session。
- WebSocket、TCP、UDP、mDNS。
- Worker、MediaRecorder、VideoDecoder。

合同：

```text
open/start/connect/subscribe
  → 返回 handle
  → handle.close/stop/dispose 幂等
  → Page unload 自动 dispose
  → App hide 按能力策略 pause/close
  → App show 可显式恢复，不静默重连敏感设备
```

蓝牙必须配对 open/close adapter、start/stop discovery、connect/close connection；连接中断要暴露状态流。相机一页只允许一个 native camera 时必须在创建第二个 context 前诊断。高频定位和传感器默认节流并记录订阅者数量，最后一个订阅者释放时停止底层 API。

### 15.5 错误合同

统一错误不丢失微信原始 errCode/errMsg：

```ts
export type PlatformErrorKind =
	| 'unsupported'
	| 'privacy-required'
	| 'permission-denied'
	| 'user-cancelled'
	| 'account-not-enabled'
	| 'device-unavailable'
	| 'disconnected'
	| 'timeout'
	| 'invalid-input'
	| 'network'
	| 'server-rejected'
	| 'unknown';
```

PlatformError 包含 capabilityId、operation、kind、rawCode、可安全记录的 message 和 cause。登录 code、手机号 code、支付参数、位置、设备标识、BLE payload 不进入 message、analytics、snapshot 或默认 logger。

### 15.6 服务端边界

svelte-taro 不提供固定 HTTP endpoint，也不假装客户端能独立完成以下流程：

#### 登录

```text
platform.identity.login()
  → 只返回一次性 wx.login code
  → packages/auth 或业务后端调用 code2Session
  → 服务端保存 OpenID/UnionID/session_key
  → 服务端签发自己的短期会话
```

session_key 永不返回小程序；login code 只能使用一次，不写日志。

#### 手机号

```text
PhoneNumberButton 用户点击
  → 返回一次性 phone code
  → 后端调用 phonenumber.getPhoneNumber
  → 后端依据业务最小化保存
```

手机号 code 与 wx.login code 类型上使用不同 branded type，禁止混用。组件只发 code，不直接返回手机号。

#### 支付

```text
业务后端创建订单并签名
  → 小程序取得 timeStamp/nonceStr/package/signType/paySign
  → platform.commerce.requestPayment()
  → 客户端结果仅用于即时 UX
  → 后端回调或主动查单决定最终订单状态
```

客户端不生成 paySign，不根据 success 回调直接发货。退款、回调验签、幂等、对账不属于 svelte-taro，由支付业务插件或后端实现。

#### 生物认证与订阅消息

- SOTER challenge 由后端生成，签名结果由后端验证；客户端不把“弹窗成功”当业务授权完成。
- requestSubscribeMessage 只负责取得用户选择；模板配置、服务端发送和结果追踪归业务后端。

小程序到服务端的 HTTPS 是设备/服务器安全边界，不是宿主内部插件 RPC。服务端插件之间仍使用仓库既有的进程内 DI。

### 15.7 原生元素类型

@zadmin/svelte-taro/native 从固定的 @tarojs/components 4.2.1 类型生成并验证 svelteHTML.IntrinsicElements augmentation，使以下原生标签拥有 Props 与事件提示：

- camera、map、canvas、video、audio。
- live-player、live-pusher、voip-room。
- web-view、open-data、official-account。
- picker、form、input、textarea、scroll-view、swiper 等基础小程序组件。
- ad、channel-live、channel-video 等账号能力组件。

类型生成结果纳入快照；运行时代码仍是原生 tag，不增加 wrapper 层。Svelte custom renderer 固定版本变化时必须重跑 language-server/svelte-check fixture。未知标签默认编译错误，不退化成 any。

### 15.8 能力矩阵

| 领域                       | 本轮高层能力                                                                     | 原始或原生入口                          | 关键边界                                                          | 本轮支持级别                         |
| -------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| 兼容与系统                 | canIUse、基础库、设备、窗口、电量、内存、网络状态                                | Taro system APIs                        | 无权限不代表有账号能力                                            | managed stable                       |
| 隐私与授权                 | getPrivacySetting、隐私协议、authorize/getSetting/openSetting                    | Taro privacy/settings                   | 必须即时说明用途，尊重拒绝                                        | managed stable                       |
| 登录与身份                 | login/checkSession、账号信息、SOTER 调起                                         | Taro open-api                           | code2Session、challenge 验证在后端                                | managed；账号项分级                  |
| 用户资料与手机号           | PhoneNumberButton、头像昵称/profile 兼容诊断                                     | button open-type、Taro user APIs        | 用户手势、主体资格、可能计费、手机号 code 后端兑换                | managed provisional                  |
| 支付与商业                 | requestPayment、地址/发票/卡券能力描述                                           | Taro payment/open-api                   | 商户开通、下单、签名、回调在后端；小程序插件不支持 requestPayment | client bridge provisional            |
| 图片与视频                 | chooseMedia、图片保存、视频 context                                              | image/video/camera                      | 隐私、相册权限、临时文件生命周期                                  | managed stable                       |
| 相机与扫码                 | scanCode、CameraContext、frame listener                                          | camera                                  | scope.camera、单页一个 camera、真机帧性能                         | managed provisional                  |
| 音频与实时媒体             | recorder、audio、background audio、live、VoIP                                    | audio/live-player/live-pusher/voip-room | 麦克风、后台声明、账号类目                                        | managed resource；账号项 provisional |
| 位置与地图                 | one-shot、foreground watch、background watch                                     | map、MapContext                         | requiredPrivateInfos、permission、类目审核、坐标系与耗电          | managed provisional                  |
| 蓝牙与 BLE                 | adapter、discovery、central connection、service/characteristic/read/write/notify | Taro Bluetooth/BLE                      | scope.bluetooth、配对清理、断线、MTU/分包由设备协议处理           | managed provisional                  |
| BLE peripheral/Mesh/Beacon | peripheral server、iBeacon 基础会话                                              | Taro APIs                               | 平台差异、厂商 Mesh 协议不进入基础包                              | catalog + scoped raw                 |
| NFC 与 Wi-Fi               | NFC discovery/tag handle、Wi-Fi session                                          | Taro NFC/Wi-Fi                          | NFC iOS 不支持、系统开关、授权、真机必需                          | managed provisional                  |
| 传感器                     | accelerometer、compass、gyroscope、motion                                        | Taro device APIs                        | start/stop 配对、频率、后台、耗电                                 | managed provisional                  |
| 本地设备动作               | clipboard、vibrate、screen、phone、contact、calendar、SMS                        | Taro device APIs                        | 隐私、用户手势和平台差异                                          | catalog + normalized one-shot        |
| 网络与局域网               | request/upload/download、WebSocket、TCP、UDP、mDNS                               | Taro network APIs                       | 合法域名、TLS、连接清理、弱网与重试                               | connections managed；HTTP raw        |
| 文件与存储                 | storage、FileSystemManager、cache、临时文件                                      | Taro files/storage                      | 配额、清理、迁移；本地数据不作为可信凭证                          | managed stable                       |
| 消息与社交                 | subscribe、share 生命周期、客服、打开视频号/小程序                               | Taro open/share/navigate                | 用户手势、模板/账号开通、服务端发送                               | managed provisional/catalog          |
| Worker 与渲染              | Worker、Canvas、WebGL、WASM                                                      | worker/canvas 原生能力                  | 包体、线程清理、平台性能                                          | scoped raw                           |
| AI、VisionKit、XR          | capability descriptor 与原始 Taro/wx 入口                                        | Taro AI、ar-camera/XR                   | Nightly/基础库/硬件/账号差异大                                    | documented raw experimental          |
| 云开发、广告、设备云       | capability descriptor 与 host driver 入口                                        | Taro cloud/ad、厂商 SDK                 | 环境写入、计费、审核、凭据、供应商协议                            | 不做默认高层实现                     |

managed stable 表示必须通过契约、mock 与当前环境可完成的自动验证；provisional 表示实现与文档合同完整，但由于账号/真机条件只达到本文第 16 节所定义的较低验证等级。catalog/raw 仍有强类型、能力描述和诊断，不承诺高层状态机。

微信官方文档中的“小程序插件”专指 compileType=plugin 的微信官方插件环境，不是 @zadmin/svelte-taro framework plugin，也不是构建进宿主的 ./taro business module。后两者最终运行在宿主小程序代码包中，使用宿主账号能力；capability catalog 必须分别记录 host app 与 official plugin 的支持差异，不能混淆。

### 15.9 本轮高层实现范围

必须完成：

- descriptor/catalog、support probe、PlatformError、scope、fake driver、Taro driver。
- privacy、permission、login code、checkSession、requestPayment client bridge。
- chooseMedia、scanCode、CameraContext scoped helper。
- location one-shot/foreground/background handle。
- Bluetooth adapter、BLE discovery/central connection handle。
- NFC、Wi-Fi 与 sensors 的 scoped handle。
- network status、WebSocket/TCP/UDP/mDNS handle。
- storage/files 安全 helper。
- subscribe message 与 share lifecycle bridge。
- native element typing、CapabilityGate、PrivacyConsent、PhoneNumberButton。

只进入 catalog/raw，不做高层业务封装：

- 具体 BLE/Mesh/IoT 协议。
- 广告、视频号、卡券、红包、发票、车牌等商业流程。
- VoIP 产品状态机、直播推拉流策略。
- AI inference、VisionKit、XR-FRAME 场景框架。
- 云开发环境、云函数、云数据库和云存储写入。
- 腾讯地图 WebService、POI、地理编码和路线规划。

这些能力以后可以由独立业务 package/plugin 基于 platform.raw 或 scoped driver 实现，不继续膨胀 svelte-taro。

### 15.10 配置聚合与静态检查

构建 plugin 聚合 app 与所有 Taro module 的 capability 声明，检查：

- app.config permission 描述。
- requiredPrivateInfos。
- requiredBackgroundModes。
- workers 目录。
- 使用到的原生组件。
- 最低基础库。
- 需要的账号/商户/类目/隐私保护指引声明。
- 数据类别、计费提示、客户端/renderer 与 official plugin 支持差异。
- 生产包是否包含只允许开发态的 mock driver。

允许自动生成建议 diff 和 capability-report.json；不允许自动编造法律用途说明、替用户同意隐私协议、假设商户已开通或悄悄降低最低基础库。缺少代码层必需配置时构建报错；无法机器确认的后台开通项进入报告，不阻止无人值守继续完成其他工作。

## 16. 平台能力无人值守验证

### 16.1 验证等级

每项 capability 记录最高已完成等级：

| 等级               | 含义                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| documented         | 微信官方文档、Taro 4.2.1 类型、最低版本、权限、账号和平台限制已核对       |
| contract-tested    | descriptor、输入输出、错误、scope/disposer 和静态配置测试通过             |
| mock-verified      | fake driver 与微信开发者工具 wx API mock 覆盖成功、拒绝、取消、超时和中断 |
| simulator-verified | 当前开发者工具模拟器真实调用并验证结果                                    |
| device-verified    | 指定 iOS/Android/鸿蒙真机及硬件真实验证                                   |
| account-verified   | 真实认证主体、商户、模板、类目或后台开通能力端到端验证                    |

等级不能互相冒充。documented/contract-tested 不写成 device-verified，客户端支付弹窗成功也不写成订单 account-verified。

公开稳定性另分：

- stable：达到该能力在当前环境可合理获得的自动等级，契约与清理完整。
- provisional：实现完成，但缺少真实账号或硬件证据；API 可用，报告明确限制。
- raw：只保证固定 Taro 版本的类型与能力探测。
- unsupported：明确拒绝并给出原因。

### 16.2 无人值守执行政策

执行代理不得等待用户配合。按以下顺序自动处理：

1. 查微信/Taro 官方文档和固定版本类型。
2. 完成实现、类型、契约、fake driver、错误与资源清理测试。
3. 能在当前模拟器无敏感用户交互完成时，执行 simulator call。
4. 能安全使用 automation_wx_api mock 时，覆盖成功与失败路径。
5. 遇到 AppID 主体、商户、隐私后台、类目、模板、真实手机号、扫码确认、用户授权或硬件要求时，停止该项真实调用，但继续其他实现与验证。
6. 把该项标为 documented/contract-tested/mock-verified 中实际达到的最高等级，并记录未验证原因和人工验收手册。

不因为以下情况阻塞整个目标：

- 开发小程序号不支持支付、手机号、订阅、位置类目或商业组件。
- 没有商户号、支付密钥、服务端回调公网地址。
- 当前机器没有 BLE/NFC/Wi-Fi 外设、摄像头输入或运动传感器。
- 模拟器与真机结果存在官方已知差异。
- 需要用户同意隐私、授权权限或提供个人数据。

也不得为提高等级而清理用户授权、修改后台配置、发起真实支付、上传版本、创建云资源或向真实设备写数据。

### 16.3 自动验证最低线

| 能力                          | 无额外条件时最低线                                   | 有现成条件时追加                                    |
| ----------------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| support/error/scope/catalog   | contract-tested + mock-verified                      | simulator-verified                                  |
| privacy/permission            | contract-tested + mock-verified                      | 只读 getPrivacySetting/getSetting simulator call    |
| login/checkSession            | contract-tested + mock-verified                      | 当前 AppID 可用时 simulator call；不兑换或打印 code |
| phone/payment/SOTER/subscribe | documented + contract-tested + mock-verified         | 不主动触发真实用户/商户流程                         |
| media/scan/camera/location    | contract-tested + mock-verified                      | 无需授权的只读 probe；现有授权时才 simulator call   |
| BLE/NFC/Wi-Fi/Beacon/sensors  | documented + contract-tested + mock-verified         | 仅现成设备可无交互使用时追加 device evidence        |
| network/storage/files         | contract-tested + mock-verified + simulator-verified | 弱网/配额测试                                       |
| native components             | compiler/type fixture + WXML/WXSS 静态产物           | 模拟器能渲染时截图与事件                            |
| AI/XR/cloud/ad/VoIP           | documented + type/catalog test                       | 有现成无写入环境时才做只读 probe                    |

### 16.4 必测失败路径

- canIUse=false 或基础库过低。
- 隐私未同意。
- 首次权限请求、已拒绝、openSetting 后仍拒绝。
- 用户取消、App 进入后台、页面卸载。
- API timeout、网络断开、socket close。
- 蓝牙未初始化、不可用、扫描中断、连接断开、重复 close。
- NFC/Wi-Fi/传感器设备不支持或系统开关关闭。
- 相机初始化失败与重复 context。
- 登录/手机号 code 类型混用和重复消费模拟。
- 支付 prepare 失败、用户取消、客户端成功但服务端未确认。
- disposer 重复调用、100 次 mount/unmount 后 listener/connection 回到基线。

### 16.5 验收产物

生成并纳入正式文档：

- capability catalog 与 API 索引。
- capability-report.json 和人类可读 Markdown。
- 每项官方文档、Taro 类型位置、最低基础库、权限、隐私、账号、平台和验证等级。
- mock/simulator/device/account 证据索引。
- 未验证硬件/账号能力的人工验收步骤，但不要求用户在本次无人值守执行中完成。
- 从下一版更新 Taro/基础库时需要重跑的兼容清单。

生产可用声明限定为：framework、renderer、platform core、stable capability 和构建产物达到门禁；provisional/raw 能力必须按报告标识，不能把整个微信 API 面一概宣称为真机生产验收完成。

## 17. 测试分层

### 17.1 zui-core

- Theme types/runtime。
- StyleProgram。
- builder。
- units。
- dynamic slots。
- deterministic canonical form/hash。
- component design contracts。

纯 Node/Vitest，不启动 Svelte 或微信。

### 17.2 zui-web 回归

运行全部现有：

```powershell
pnpm --filter @zadmin/zui-web check
pnpm --filter @zadmin/zui-web test
pnpm --filter @zadmin/zui-web test:coverage
pnpm --filter @zadmin/zui-web build
```

并重跑：

- SSR。
- hydration。
- CSP。
- HMR。
- browser matrix。
- Storybook/docs。
- clean tarball external fixture。

验收必须证明拆包没有新增 Web 功能，也没有丢失旧功能。

### 17.3 svelte-taro compiler

Golden fixtures：

- source。
- generated JS。
- source map。
- external CSS。
- diagnostics。
- native component collection。
- loader metadata。

错误 fixture：

- bind: regular element。
- transition/animate。
- DOM special elements。
- injected CSS。
- raw snippet。
- cross-renderer snippet。

### 17.4 Renderer conformance

至少覆盖：

- node create/insert/remove/reorder。
- fragment insert。
- text update。
- attributes/class/style。
- event add/remove。
- if/keyed each/key。
- component nesting。
- snippets/context。
- component binding。
- mount/unmount。
- error boundary。
- await。
- cleanup。

100 次 mount/unmount 后：

- listener 数回到基线。
- event source 无遗留。
- page instance 无遗留。
- effect cleanup 全执行。
- Taro node tree 无悬挂 parent。

### 17.5 Platform capability contract

- capability descriptor/catalog schema。
- Taro driver 与 fake driver 一致性。
- availability 状态与 canIUse/permission/privacy 映射。
- PlatformError 原始码保留与敏感字段脱敏。
- App/Page scope 与所有 handle 的幂等 dispose。
- required/optional capability 类型推断。
- app.config permission、requiredPrivateInfos、requiredBackgroundModes 静态诊断。
- login code/phone code branded type 不可互换。
- payment 客户端成功不改变服务端订单状态的 contract fixture。
- native element IntrinsicElements 类型和事件 fixture。
- capability report 确定性与文档链接检查。

### 17.6 apps/wechat 集成

- development build。
- production build。
- source map。
- project config。
- app/page route。
- zui-taro demo。
- capability lab page。
- platform module static composition 与 route aggregation。
- production bundle 不含 fake driver、后台密钥或敏感 fixture。
- linked workspace package include。
- no duplicate Svelte/Taro runtime。
- dist 不含本地绝对路径。

### 17.7 微信开发者工具

执行顺序：

1. check_wechatide_status，整轮一次。
2. open_project_window，只有未打开时。
3. simulator_open_page 到验证页。
4. automation_runtime_info 确认页面与 buildId。
5. simulator_screenshot。
6. get_simulator_console grep error/warn。
7. automation_element_action 点击 Button。
8. automation_page_action/文本读取验证计数。
9. 验证 if/list/theme。
10. 对 platform lab 只执行当前环境可自动完成的只读/无敏感交互检查。
11. 使用 automation_wx_api mock 验证权限拒绝、取消、硬件不可用和支付未确认等路径。
12. 修改一个 Taro 组件或 platform adapter 源文件，验证 Fast Refresh。
13. 恢复临时变化并再次验证。

不在每次保存后无差别截图或 refresh；不为测试主动触发隐私同意、手机号、支付、订阅或系统权限弹窗。

### 17.8 WebView/Skyline

- WebView 模式通过。
- Skyline 模式通过或明确列出不支持项。
- 两种模式截图。
- 组件交互无 console error。
- 不把 Skyline 一次通过替代 WebView 验收。

### 17.9 性能

建立同场景 Taro Solid 参考 fixture。

记录：

- cold build。
- warm build。
- 保存到模拟器可见时间。
- 首屏。
- 200/1000 节点。
- keyed list add/remove/reorder。
- setData 次数。
- setData payload。
- bundle/package size。
- mount/unmount 内存。
- platform listener/connection handle 数量。
- 高频传感器/位置事件的 batching 与 setData 频率。

Svelte→Taro 基础场景 p50 不应比同版本 Taro Solid 慢超过 25%；超出时必须归因和优化，不能只记录。

## 18. 生产构建门禁

必须全部满足：

- 所有依赖精确锁定。
- pnpm install --frozen-lockfile。
- 无本地 link/file 依赖。
- 无开发 buildId。
- 无本地绝对路径。
- 无 source watcher/supervisor 代码进入生产 bundle。
- 无 fake platform driver、mock 响应或 capability lab 敏感 fixture 进入生产 bundle。
- 无 AppSecret、session_key、access_token、商户密钥、paySign 原料、登录/手机号 code 或真实个人/设备数据。
- TypeScript/check 通过。
- focused tests 通过。
- 全仓 test 通过。
- 全仓 build 通过。
- lint 通过。
- Web 回归通过。
- clean tarball 外部安装通过。
- 微信开发者工具完整编译通过。
- console 无新增 error。
- 基础 UI 与 mock capability flow 的交互自动化通过。
- capability catalog、native element types、配置聚合与 capability report 确定性检查通过。
- stable capability 达到本文定义的自动验证最低线；provisional/raw 项逐项记录真实等级与未验证原因。
- permission、requiredPrivateInfos、requiredBackgroundModes 与最低基础库诊断通过。
- 所有 listener/session/connection/context 在 scope dispose 后回到基线。
- WebView/Skyline 结果记录。
- 性能结果记录并满足阈值。
- 临时源码、截图、watcher、dist、fixture 和缓存按规则清理。

如果缺少微信上传密钥，允许不执行 upload，但不得把“未上传”描述为已完成微信发布验收。账号、商户或硬件能力只能写入实际达到的验证等级；缺少这些外部条件不阻止 framework/platform core 完成，也不能伪造更高等级。上传和审核另需用户授权。

## 19. Vite 失败回退门禁

默认不得切 Webpack5。只有同时满足以下条件才允许：

1. Taro Vite 4 公开 plugin/context 无法接入 .svelte transform，或无法生成可用 source map/watch。
2. 问题已由最小 fixture 复现。
3. 不能通过 @zadmin/svelte-taro 内部兼容层修复，而必须修改 Taro 主仓库。
4. Webpack5 最小 fixture 已证明 renderer、source map、watch 和开发者工具刷新可用。

满足后允许：

- 仅 apps/wechat 和 svelte-taro 切到 Webpack5。
- Web 继续 Vite 8。
- 独立提交记录原因、性能和依赖变化。
- 删除未采用的 Vite 路径，不能长期双默认。

## 20. 上游实验 API 风险门禁

固定 Svelte commit 不主动更新。

允许：

- 在 svelte-taro 内部做小型适配。
- 对 artifact 做小补丁前，先证明 pnpm 能把补丁限定在 WeChat URL resolution，且 Web registry Svelte 的 integrity 和产物不变。
- 为任何补丁建立失败前/成功后测试并记录上游 commit。

不允许无人值守继续：

- fork Svelte compiler 大范围重写。
- 不能证明补丁与 Web registry Svelte 隔离时继续 patch。
- 修改超过约 100 行上游 internals 才能通过。
- 关闭关键 custom renderer 测试。
- 用 any/ts-ignore 掩盖核心 renderer 类型错误。

遇到以上情况必须停止实现，保留已通过的阶段提交，写清 blocker 与最小复现，并结束无人值守执行；不得循环等待用户或擅自扩大 fork。

## 21. 实施阶段与 Git 提交

### 阶段 0：蓝图

本文已获批准；本提交固化实施合同，后续阶段按本文执行。

### 阶段 1：依赖隔离

提交：

```text
chore(workspace): add isolated WeChat toolchain catalog
```

内容：

- named catalog。
- 精确 Svelte custom-renderer artifact、lockfile integrity 与 peer 合同。
- root scripts 占位。
- 无功能代码。

门禁：

- frozen install。
- 当前全仓 check/test/build/lint。

### 阶段 2：提取 zui-core

提交：

```text
refactor(zui): extract platform-neutral core
```

内容：

- 新 zui-core。
- 当前 zui 暂时依赖并重新导出。
- target-neutral slot。
- Core tests。

门禁：

- 当前 Web 全部测试和产物等价。

### 阶段 3：明确 zui-web

提交：

```text
refactor(zui): isolate the Web renderer package
```

内容：

- zui → zui-web。
- admin/docs/fixtures/docs 更新。
- 不新增组件/API。

门禁：

- 完整 Web 生产验收。

### 阶段 4：Taro plugin 骨架

提交：

```text
feat(svelte-taro): add typed Taro framework plugin
```

内容：

- CJS plugin entry。
- options schema。
- frameworkExts。
- loader metadata。
- Vite plugin 注入。
- defineTaroModule、capability descriptor 与静态 route/capability 聚合骨架。
- package tests。

门禁：

- Taro 能加载 plugin。
- defineSvelteConfig 能以 framework=svelte 跳过全部内置 framework plugin。
- frameworkExts、vitePlugins 与 loaderMeta 注入测试通过。
- 空 App/Page 编译。

### 阶段 5：Compiler 与 Renderer

提交：

```text
feat(svelte-taro): compile Svelte through the Taro renderer
```

内容：

- Svelte compiler。
- renderer operations。
- diagnostics。
- source maps。
- virtual CSS 与原生组件 marker 收集。
- conformance tests。

门禁：

- state/if/each/event/component fixture。

### 阶段 6：Runtime 与宿主

提交：

```text
feat(wechat): add Svelte app and page runtime
```

内容：

- createSvelteApp。
- page lifecycle。
- App/Page resource scope 与 platform context。
- apps/wechat。
- project config。
- development/production build。

门禁：

- 微信开发者工具打开页面。
- 无 console error。

### 阶段 7：ZUI Taro

提交：

```text
feat(zui-taro): add foundational components and ICSS
```

内容：

- Provider/Box/Stack/Text/Button。
- CapabilityGate/PrivacyConsent/PhoneNumberButton。
- WXSS emitter。
- dynamic style binding。
- demo page。

门禁：

- 组件视觉与交互自动化。
- Web 无变化。

### 阶段 8：微信平台能力

提交：

```text
feat(svelte-taro): add scoped WeChat platform capabilities
```

内容：

- platform raw/managed/native 三层 API。
- Taro driver、fake driver、support probe、PlatformError、capability report。
- privacy/permission/identity/commerce/media/location/hardware/system/messaging/compute 分组。
- scoped listeners、connections、contexts 与 dispose。
- native element IntrinsicElements 类型。
- apps/wechat capability lab。
- 外部 ./taro module fixture 与静态能力声明。

门禁：

- 本文第 16 节所有自动最低线完成。
- 当前账号/硬件不可用项有 documented/contract/mock 证据和未验证原因，不等待用户。
- login/phone/payment 服务端边界与敏感数据脱敏测试通过。
- 100 次 scope 创建/销毁后资源回到基线。
- Web 产物和组件无变化。

### 阶段 9：Fast Refresh

提交：

```text
feat(wechat): add supervised Fast Refresh
```

内容：

- one supervisor。
- child cleanup。
- file classification。
- Taro restart。
- buildId。
- DevTools refresh fallback。

门禁：

- runtime edit。
- compiler plugin edit。
- route edit。
- watcher count。
- 时间阈值。

### 阶段 10：生产硬化

提交：

```text
test(wechat): complete Svelte Taro production acceptance
```

内容：

- conformance。
- leak。
- package。
- DevTools E2E。
- WebView/Skyline。
- performance。
- clean fixture。
- capability/native/module package fixture。
- capability verification report 与配置诊断。

门禁：

- 本文第 18 节全部通过；本文第 16 节按环境能达到的真实等级完整记录，账号/硬件项不伪造 external acceptance。

### 阶段 11：文档交接

提交：

```text
docs(wechat): finalize Svelte Taro architecture and handoff
```

内容：

- architecture。
- testing。
- engineering-preferences。
- handoff。
- package READMEs。
- platform capability catalog、验证等级、人工真机/商户验收手册。
- 删除过期 @zadmin/zui 文档。
- 把本文已实现事实迁入正式文档。
- 删除或改写本 Draft，不能长期保留已过期蓝图。

## 22. 无人值守执行规则

用户批准本文后，执行代理应持续完成所有阶段，不在正常技术选择上反复询问。

可以自主决定：

- 文件命名和内部私有函数。
- 小型兼容层。
- 测试 fixture 内容。
- source map/diagnostic 实现细节。
- capability family 内部文件组织、driver 私有实现和错误码映射。
- 官方文档已经明确但当前账号/硬件不可验证的 capability 实现与 provisional 标记。
- 不改变外部契约的性能优化。
- Vite 失败时按第 19 节门禁切换 Webpack5。

账号/硬件受限项：

- 不向用户提问，不等待扫码、授权、支付、手机号、硬件操作或后台配置。
- 不反复重试会弹窗或需要用户手势的 API。
- 按本文第 16 节完成文档、类型、contract、mock 和可用的 simulator 验证，然后继续后续阶段。
- 最终交接清楚列出最高验证等级；这不是 blocker，也不是已真机验收。

必须停止并记录 blocker，不在无人值守期间等待用户：

- 需要扩大 Web 组件/API 范围。
- 需要修改 Svelte/Taro 上游源码仓库。
- 需要引入网络 RPC 或独立服务。
- 需要改变包名或本蓝图锁定依赖方向。
- 需要大范围 fork Svelte internals。
- 发现用户未提交改动与目标文件重叠，无法安全保留。

需要微信上传、审核、云资源写入、新密钥、真实商户或后台开通时直接跳过该外部动作并写入交接，不触发、不申请、不把它当作核心实现失败。

执行中：

- 不推送远端。
- 不重置用户改动。
- 不清理共享缓存。
- 不把 external reference worktree 的 dirty pnpm-lock 混入 ZAdmin。
- 每个阶段提交前检查工作树、进程和验证结果。
- 失败保留诊断证据；确认后清理本轮临时产物。

## 23. 完成定义

只有同时满足以下条件，才可称本轮目标完成：

1. zui-core、zui-web、zui-taro、svelte-taro、apps/wechat 目录和依赖符合本文。
2. Web 当前能力与组件全部保留，无新增 Web 组件。
3. Taro plugin 可从 clean install 构建 Svelte 小程序。
4. 支持矩阵中的必须项全部通过，拒绝项有明确诊断。
5. ZUI Taro 五个基础组件和三个平台流程组件按可自动验证范围渲染。
6. Button/state/if/each/theme/ICSS 自动化通过。
7. platform raw/managed/native、Taro module、descriptor、driver、scope 和错误合同完成。
8. capability catalog 覆盖固定 Taro API 领域，所有高层实现范围完成，未实现项有 raw/catalog 入口和边界说明。
9. 登录、手机号、支付、生物认证的客户端/服务端安全边界通过类型和 contract 测试。
10. capability report 对每项能力记录实际验证等级，无法自动验证项不冒充真机/账号验收。
11. Fast Refresh 三类变化及 platform adapter/module 变化通过且无 watcher 泄漏。
12. production build 不含开发路径、link、buildId、watcher、fake driver、密钥或敏感 fixture。
13. renderer/runtime/platform scope 资源释放通过。
14. WebView/Skyline 与性能结果已记录。
15. clean tarball 外部 fixture 通过，外部 ./taro module 保留强类型并能静态构建。
16. 全仓 check/test/build/lint 通过。
17. 阶段提交清晰、工作树干净、未推送。
18. 正式文档和交接更新，过期 Draft 已清理。

## 24. 审阅重点

请用户在批准前重点确认：

1. 是否接受四个包：zui-core、zui-web、zui-taro、svelte-taro。
2. 是否接受新增 apps/wechat，而不把现有 miniprogram-1 当生产源码。
3. 是否接受默认 Taro Vite 4 Fast Refresh，而不是第一阶段追求状态保持 HMR。
4. 是否接受微信端实现现有 ZuiProvider、Box、Stack、Text、Button，以及只服务微信用户手势的 CapabilityGate、PrivacyConsent、PhoneNumberButton。
5. 是否接受固定未合并的 Svelte custom renderer commit，并把大范围上游 fork 设为必须停下的 blocker。
6. 是否接受 Taro 端 ICSS 第一阶段为明确能力子集，不支持项构建时报错。
7. 是否接受完整生产验收可以不含微信 upload，但不得把未上传描述为发布验收完成。
8. 是否接受微信端使用 pkg.svelte.dev 的精确 commit artifact，而 Web 继续使用 registry Svelte；两者不得通过全局 patch 混合。
9. 是否接受通过可 tree-shake 的 .taro-components.tsx marker 接入 Taro 4.2.1 的 onParseCreateElement，而不依赖 taro-vite-runner 私有 componentConfig。
10. 是否接受平台能力采用 raw Taro、managed service、ZUI flow component 三层，而不逐个重复包装全部 wx/Taro API。
11. 是否接受业务插件的 ./taro 入口在开发态 Fast Refresh、生产态静态打包；生产安装/卸载/升级后必须重建并发布小程序。
12. 是否接受登录、手机号、支付、生物认证和订阅消息只在客户端完成安全半程，密钥、兑换、签名和最终业务状态归服务端。
13. 是否接受账号、商户、隐私后台和真实硬件受限能力在无人值守期间只做到文档/契约/mock/可用模拟器等级，不等待用户，也不宣称真机验收。
14. 是否接受 AI/XR、广告、云开发、VoIP 产品状态机和具体硬件协议只进入 catalog/raw，不膨胀第一阶段高层 API。

## 25. 主要依据

- Svelte custom renderer PR：https://github.com/sveltejs/svelte/pull/18042
- 固定 Svelte PR artifact：https://pkg.svelte.dev/svelte/c/eb7532dd70fb11b36258347c44cf3910d244f987
- Taro 4.2.1 release：https://github.com/NervJS/taro/releases/tag/v4.2.1
- Taro plugin：https://docs.taro.zone/en/docs/plugin
- Taro compile config：https://docs.taro.zone/docs/config-detail/
- Taro API 说明：https://docs.taro.zone/docs/apis/about/desc
- Taro 4.2.1 API 类型索引：https://github.com/NervJS/taro/blob/v4.2.1/packages/taro/types/taro.api.d.ts
- Taro 4.2.1 组件类型：https://github.com/NervJS/taro/tree/v4.2.1/packages/taro-components/types
- Taro CLI framework plugin 选择：https://github.com/NervJS/taro/blob/v4.2.1/packages/taro-cli/src/cli.ts
- Taro Solid framework plugin：https://github.com/NervJS/taro/blob/v4.2.1/packages/taro-framework-solid/src/index.ts
- Taro plugin loader：https://github.com/NervJS/taro/blob/v4.2.1/packages/taro-service/src/utils/index.ts
- Taro Vite native component 收集：https://github.com/NervJS/taro/blob/v4.2.1/packages/taro-vite-runner/src/mini/native-support.ts
- Taro mini HMR path：https://github.com/NervJS/taro/blob/v4.2.1/packages/taro-service/src/platform-plugin-base/mini.ts
- 微信项目配置：https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html
- 微信 app.json 配置：https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html
- 微信登录：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html
- 微信授权：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/authorize.html
- 微信隐私协议：https://developers.weixin.qq.com/miniprogram/dev/framework/user-privacy/PrivacyAuthorize.html
- 微信手机号：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html
- 微信支付：https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestPayment.html
- 微信相机组件：https://developers.weixin.qq.com/miniprogram/dev/component/camera.html
- 微信扫码：https://developers.weixin.qq.com/miniprogram/dev/api/device/scan/wx.scanCode.html
- 微信定位：https://developers.weixin.qq.com/miniprogram/dev/api/location/wx.getLocation.html
- 微信蓝牙：https://developers.weixin.qq.com/miniprogram/dev/api/device/bluetooth/wx.openBluetoothAdapter.html
- 微信 NFC：https://developers.weixin.qq.com/miniprogram/dev/api/device/nfc/wx.getNFCAdapter.html
- 微信订阅消息：https://developers.weixin.qq.com/miniprogram/dev/api/open-api/subscribe-message/wx.requestSubscribeMessage.html
- 微信 CI：https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html
