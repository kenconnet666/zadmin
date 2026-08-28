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

开发期由 `apps/wechat/config/supervisor.mjs` 同时维护 TypeScript、组件 package 与应用增量构建；组件或 Theme 修改不重启整个监督器，compiler/plugin 修改才重启构建 child。

直接微信 target 已可独立调用：

```powershell
pnpm miniapp build --target wechat --project C:\path\to\app
pnpm miniapp dev --target wechat --project C:\path\to\app
```

它生成`dist/wechat`下的WXML、WXSS、JS、JSON、共享runtime template和sourcemap，并在同一microtask内合并节点变化。当前真实宿主切换前仍保留内部Taro renderer作为对照后端；下一提交会让`apps/wechat`使用直接target并删除所有Taro生产依赖。
