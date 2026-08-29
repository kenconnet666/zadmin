# @zadmin/miniapp

自包含的 Svelte 微信小程序框架。包名保持平台中立，但 v1 只实现微信，不创建支付宝或其他空 target。

Miniapp 不依赖 `@zadmin/zui`。它拥有独立的移动端 Theme、`mcss()`/WXSS 白名单、8 个 `M*` 基础组件、平台能力 facade、编译器、runtime、模块合同和测试工具。

custom renderer依赖固定Svelte artifact，外部项目必须与框架使用同一份runtime：

```powershell
pnpm add @zadmin/miniapp "svelte@https://pkg.svelte.dev/svelte/c/eb7532dd70fb11b36258347c44cf3910d244f987"
```

仅安装registry `svelte@5.56.10`不包含`experimental.customRenderer`与`svelte/renderer`，不能用于Miniapp target。

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

开发期由`miniapp dev`直接监听应用源码和workspace内Miniapp源码。重建串行合并，组件、Theme和业务状态修改不创建并发构建进程；每次成功开发构建都会写入build ID。设置`ZADMIN_WECHATIDE_CLIENT`后，CLI会清compile cache并触发一次完整Page remount；当前custom renderer不承诺DevTools实例保留式热替换。

微信不允许同名WXML template递归，通用runtime template因此有限展开0–24层；超过该深度不属于v1支持范围。

直接微信 target 已可独立调用：

```powershell
pnpm miniapp build --target wechat --project C:\path\to\app
pnpm miniapp dev --target wechat --project C:\path\to\app
```

它生成`dist/wechat`下的WXML、WXSS、JS、JSON、共享runtime template和sourcemap，并在同一microtask内合并节点变化。`apps/wechat`已经使用该直接target；包和宿主的生产依赖图中不存在ZUI、DOM runtime或第三方跨端框架。
