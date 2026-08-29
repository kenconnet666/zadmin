# @zadmin/zui

Type-safe runtime CSS and foundational Svelte 5 components. Public ICSS calls return one class string; the optional Svelte preprocessor lifts traceable reactive leaf values to private inline CSS custom properties without changing source-level usage.

```svelte
<script lang="ts">
	import { defaultTheme, icss } from '@zadmin/zui';

	let width = $state(320);
	const panelClass = $derived(icss(defaultTheme, (s) => s.width.px(width)));
</script>

<div class={panelClass}>...</div>
```

## SvelteKit

```ts
// vite.config.ts
import { icssPreprocess } from '@zadmin/zui/compiler';

sveltekit({ preprocess: [icssPreprocess()] });
```

```ts
// src/hooks.server.ts
import { zuiHandle } from '@zadmin/sveltekit/zui';

export const handle = zuiHandle();
```

## Components

```svelte
<script lang="ts">
	import { ZBox, ZButton, ZProvider, ZStack, ZText } from '@zadmin/zui';
</script>

<ZProvider>
	<ZStack gap="medium">
		<ZText as="strong">Account</ZText>
		<ZBox>Content</ZBox>
		<ZButton>Save</ZButton>
	</ZStack>
</ZProvider>
```

## Testing

`@zadmin/zui/testing`提供不依赖DOM或测试框架的内存runtime、fixture和资源断言：

```ts
import { defaultTheme } from '@zadmin/zui';
import {
	assertIcssResourcesStable,
	createIcssFixture,
	createTestIcssRuntime
} from '@zadmin/zui/testing';

const harness = createTestIcssRuntime();
const before = harness.snapshot();
assertIcssResourcesStable(before, harness.snapshot());
const fixture = createIcssFixture(harness, defaultTheme, (s) => s.display.flex);
```

该子入口仅供测试导入，根入口和生产组件bundle不引用它。

Requires Node 22 or newer and Svelte `>=5.56 <6`.

Full architecture, CSP, SSR, HMR and external integration documentation lives in the [ZAdmin documentation](https://github.com/kenconnet666/zadmin/tree/master/apps/docs/content).
