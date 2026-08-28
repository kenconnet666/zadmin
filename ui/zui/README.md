# @zadmin/zui

Type-safe runtime CSS and foundational Svelte 5 components. Public ICSS calls return one class string; the optional Svelte preprocessor lifts traceable reactive leaf values to private inline CSS custom properties without changing source-level usage.

```svelte
<script lang="ts">
	import { defaultTheme, icss } from '@zadmin/zui';

	let width = $state(320);
	const panelClass = $derived(icss(defaultTheme, (style) => style.width.px(width)));
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
import { icssHandle } from '@zadmin/zui/sveltekit';

export const handle = icssHandle();
```

## Components

```svelte
<script lang="ts">
	import { Box, Button, Stack, Text, ZuiProvider } from '@zadmin/zui';
</script>

<ZuiProvider>
	<Stack gap="medium">
		<Text as="strong">Account</Text>
		<Box>Content</Box>
		<Button>Save</Button>
	</Stack>
</ZuiProvider>
```

Requires Node 22 or newer and Svelte `>=5.56 <6`.

Full architecture, CSP, SSR, HMR and external integration documentation lives in the [ZAdmin documentation](https://github.com/kenconnet666/zadmin/tree/master/apps/docs/content).
