# @zadmin/sveltekit

ZAdmin 的 SvelteKit 集成包。根入口提供插件路由和宿主能力；ZUI 的服务端集成位于独立子入口，避免把 Node、CSP 或 request-local 代码带入浏览器组件包。

```ts
// src/hooks.server.ts
import { zuiHandle } from '@zadmin/sveltekit/zui';

export const handle = zuiHandle({
	csp: { nonce: (event) => event.locals.cspNonce }
});
```

可用入口：

- `@zadmin/sveltekit`：插件路由宿主；
- `@zadmin/sveltekit/client`：浏览器插件 runtime；
- `@zadmin/sveltekit/zui`：SSR critical CSS、request-local runtime 和 CSP；
- `@zadmin/sveltekit/zui/client`：Document 或 ShadowRoot 的显式 hydration runtime。

ZUI Svelte 预处理器仍从`@zadmin/zui/compiler`导入；它属于编译阶段，不与服务端 handle 耦合。
