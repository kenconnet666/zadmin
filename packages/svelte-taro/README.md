# @zadmin/svelte-taro

Typed Svelte 5 integration for Taro 4.2.1 and WeChat Mini Programs. The package provides a Taro framework plugin, a Svelte custom renderer, App/Page runtime integration, static business modules, native element types, scoped platform capabilities, and test drivers.

The Svelte custom renderer API is still experimental. Consumers must install the exact Svelte artifact documented by this package; ordinary registry Svelte 5.56.10 does not expose `svelte/renderer`.

## Install contract

```json
{
	"dependencies": {
		"@zadmin/svelte-taro": "0.1.0",
		"@tarojs/components": "4.2.1",
		"@tarojs/runtime": "4.2.1",
		"@tarojs/taro": "4.2.1",
		"svelte": "https://pkg.svelte.dev/svelte/c/eb7532dd70fb11b36258347c44cf3910d244f987"
	}
}
```

The package build creates one tree-shakeable Svelte runtime ESM for development and one for production. The Taro resolver maps `svelte`, `svelte/internal/client`, and `svelte/renderer` to the selected single module; consumers still install the exact Svelte peer for compiler/types and do not receive a second runtime.

## Taro config

```ts
import { defineSvelteConfig } from '@zadmin/svelte-taro';

export default defineSvelteConfig({
	compiler: { type: 'vite' },
	framework: 'svelte',
	plugins: ['@zadmin/svelte-taro'],
	sourceRoot: 'src',
	outputRoot: 'dist',
	projectName: 'example',
	designWidth: 750,
	date: '2026-08-25',
	mini: { enableSourceMap: true }
});
```

`defineSvelteConfig` validates the public `framework: 'svelte'` declaration and returns an ordinary Taro-compatible config using official runtime framework `none`; this is required because Taro Doctor rejects unknown framework names before third-party plugins run.

## Stable entries

- `@zadmin/svelte-taro/module`: typed static business modules, routes, capability declarations, and config diagnostics.
- `@zadmin/svelte-taro/native`: Taro 4.2.1 native-element prop map and Svelte augmentation.
- `@zadmin/svelte-taro/platform`: raw Taro plus scoped managed WeChat capabilities.
- `@zadmin/svelte-taro/renderer`: Svelte custom renderer operations over Taro nodes.
- `@zadmin/svelte-taro/runtime`: App/Page mounting, context, ResourceScope, and development build ID reader.
- `@zadmin/svelte-taro/testing`: fake platform driver; never import this entry from production application code.

Compiler/plugin helpers not listed above remain internal except the root config/compiler exports already declared by `package.json`.

## Supported boundary

The tested Svelte matrix includes runes, effects/cleanup, props, component binding, lifecycle, context, same-renderer snippets, if/keyed each/key/await, nested components, class/style/events, mount/unmount, and `<svelte:boundary onerror>` recovery.

Browser DOM bindings, transitions/animations, browser special elements, dynamic `svelte:element`, raw HTML, `createRawSnippet`, hydration, and cross-renderer snippets are rejected or unsupported. The pinned upstream artifact crashes on boundary `failed`/`pending` snippets, so those forms receive an early diagnostic; use `onerror` and external recovery state.

The default production target is WeChat WebView. See the repository [production acceptance](https://github.com/kenconnet666/zadmin/blob/master/apps/docs/content/wechat-production-acceptance.md) for exact verification grades and limits.
