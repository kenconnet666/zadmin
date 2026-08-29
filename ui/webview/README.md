# @zadmin/webview

`@zadmin/webview`把同一套Svelte/Web源码发布为独立桌面target。TypeScript提供版本化bridge、平台能力facade、资源生命周期、Svelte组件和fake driver；C#提供共享dispatcher和目标适配器。v1只实现Windows x64/arm64，渲染器是Microsoft Edge WebView2。

```ts
import { createWebviewDesktopPlatform } from '@zadmin/webview/platform';

const desktop = createWebviewDesktopPlatform({
	opener: { allowedOrigins: ['https://docs.zadmin.dev'] }
});
```

```ts
import { defineWebviewConfig } from '@zadmin/webview/build';

export default defineWebviewConfig({
	web: { assets: 'build', command: 'pnpm build:web' },
	targets: { 'windows-x64': { package: 'msix' } }
});
```

公开子路径：

- `@zadmin/webview`：typed client、协议和运行环境；
- `@zadmin/webview/platform`：平台中立DesktopPlatform与guards；
- `@zadmin/webview/svelte`：Provider和桌面组合组件；
- `@zadmin/webview/build`：Node构建编排与target配置；
- `@zadmin/webview/testing`：fake bridge/platform，仅限测试。

远程页面不能获得native能力。Windows宿主只加载`https://app.zadmin.local`虚拟origin，所有请求都验证协议版本、消息大小、method allowlist和payload；外部URL只允许配置中的HTTPS origin。
