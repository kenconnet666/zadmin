# @zadmin/miniapp

自包含的 Svelte 微信小程序框架。包名保持平台中立，但 v1 只实现微信，不创建支付宝或其他空 target。

Miniapp 不依赖 `@zadmin/zui`。它拥有独立的移动端 Theme、`mcss()`/WXSS 白名单、8 个 `M*` 基础组件、平台能力 facade、编译器、runtime、模块合同和测试工具。

```svelte
<script lang="ts">
	import { MBox, MButton, MInput, MProvider, MStack, MText } from '@zadmin/miniapp';

	let value = $state('');
</script>

<MProvider>
	<MBox>
		<MStack gap="medium">
			<MText size="large" weight="bold">Account</MText>
			<MInput bind:value />
			<MButton>Save</MButton>
		</MStack>
	</MBox>
</MProvider>
```

公共入口：

- `@zadmin/miniapp`：`MProvider`、`MBox`、`MStack`、`MText`、`MIcon`、`MButton`、`MInput`、`MImage`、Theme 与 `mcss()`；
- `@zadmin/miniapp/platform`：微信能力、导航、网络、存储、授权、设备和 raw API；
- `@zadmin/miniapp/vite`：构建配置与 Vite 插件；
- `@zadmin/miniapp/compiler`：高级编译与诊断；
- `@zadmin/miniapp/module`：静态业务模块合同；
- `@zadmin/miniapp/testing`：fake platform，仅限测试。

开发期由`miniapp dev`直接监听应用源码和workspace内Miniapp源码。重建串行合并，组件、Theme和业务状态修改不创建并发构建进程；每次成功开发构建都会写入build ID供微信开发者工具刷新核对。

直接微信 target 已可独立调用：

```powershell
pnpm miniapp build --target wechat --project C:\path\to\app
pnpm miniapp dev --target wechat --project C:\path\to\app
```

它生成`dist/wechat`下的WXML、WXSS、JS、JSON、共享runtime template和sourcemap，并在同一microtask内合并节点变化。`apps/wechat`已经使用该直接target；包和宿主的生产依赖图中不存在ZUI、DOM runtime或第三方跨端框架。
