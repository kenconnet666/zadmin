# ZUI 使用与外部接入

`@zadmin/zui`同时提供Svelte组件、ICSS运行时、Svelte预处理器和SvelteKit SSR集成。公开样式API只返回class字符串；预处理器是性能优化，未启用时运行时仍能正确生成完整class rule。

## 安装

同一workspace：

```json
{
	"dependencies": {
		"@zadmin/zui": "workspace:^"
	}
}
```

发布后外部仓库：

```powershell
pnpm add @zadmin/zui
```

支持范围：

```text
Node >= 22
Svelte >= 5.56 < 6
现代Chromium、Firefox和WebKit
```

## SvelteKit编译优化

使用独立`svelte.config.js`：

```js
import adapter from '@sveltejs/adapter-node';
import { icssPreprocess } from '@zadmin/zui/compiler';

export default {
	preprocess: [icssPreprocess()],
	kit: { adapter: adapter() }
};
```

如果项目把完整SvelteKit配置直接传给Vite插件，必须在那里配置preprocess；这种模式会忽略`svelte.config.js`中的对应设置：

```ts
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { icssPreprocess } from '@zadmin/zui/compiler';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			preprocess: [icssPreprocess()]
		})
	]
});
```

严格禁止inline style attribute时关闭变量快路径：

```ts
icssPreprocess({ dynamicValues: 'class-rules' });
```

## SvelteKit SSR

在`src/hooks.server.ts`中安装请求级Registry：

```ts
import { icssHandle } from '@zadmin/zui/sveltekit';

export const handle = icssHandle();
```

与已有handle组合：

```ts
import { sequence } from '@sveltejs/kit/hooks';
import { icssHandle } from '@zadmin/zui/sveltekit';

export const handle = sequence(icssHandle(), applicationHandle);
```

nonce模式：

```ts
icssHandle({ nonce: (event) => event.locals.cspNonce });
```

已有CSP header使用hash模式：

```ts
icssHandle({ cspHash: true });
```

nonce和hash不能同时开启。`inline-vars`仍需要允许`style-src-attr 'unsafe-inline'`；nonce/hash保护的是运行时critical style element。

## ICSS

```svelte
<script lang="ts">
	import { defaultTheme, icss } from '@zadmin/zui';

	let width = $state(320);
	let opacity = $state(0.8);

	const panelClass = $derived(
		icss(defaultTheme, (s) => {
			s.display.flex;
			s.width.px(width);
			s.padding._medium;
			s.opacity(opacity);
			s._hover((hover) => hover.color._primary);
		})
	);
</script>

<div class={panelClass}>...</div>
```

静态字面量进入结构规则，非字面量叶子在可分析的Svelte class位置进入inline变量。直接TS标识符用于DevTools可读名称；复杂表达式使用匿名slot。

普通TypeScript同样可用：

```ts
import { defaultTheme, icss } from '@zadmin/zui';

const className = icss(defaultTheme, (s) => {
	s.color._primary;
	s.padding.px(8, 16);
});
```

该调用不依赖Svelte编译器，直接生成并缓存完整class rule。

## 主题

```ts
import { defaultTheme, extendTheme } from '@zadmin/zui';

export const theme = extendTheme(defaultTheme, {
	color: {
		primary: '#7c3aed',
		primaryHover: '#6d28d9'
	},
	space: {
		medium: 10
	}
});
```

自定义主题用于ZUI基础组件时，需要覆盖`ZuiTheme`要求的默认语义token；ICSS本身接受任意强类型ThemeSchema。

## 基础组件

```svelte
<script lang="ts">
	import { ZBox, ZButton, ZField, ZIcon, ZInput, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZProvider>
	<ZStack gap="medium">
		<ZText as="strong" size="large">Account</ZText>
		<ZIcon name="user" label="Account" />
		<ZField label="Name" required>
			<ZInput />
		</ZField>
		<ZBox>Content</ZBox>
		<ZButton variant="primary">Save</ZButton>
	</ZStack>
</ZProvider>
```

组件标准转发`class`和HTML attributes。编译器只向已知ZUI组件传递内部变量carrier；未知第三方组件使用运行时class-rule回退，不添加wrapper。

## 开发和HMR

改变普通状态只更新inline变量。修改ICSS结构后，Vite重新预处理组件；规则所有权按模块和callsite清理。每个callsite默认最多128个结构变体，超过时抛出带owner信息的明确错误。

外部项目最低验证：

```powershell
pnpm check
pnpm test
pnpm build
```

ZUI发布前还会把`pnpm pack`产物安装到仓库外fixture，避免workspace source export掩盖发布配置错误。
