# @zadmin/zui-taro

Svelte 5 components and a deliberately small ICSS compiler for Taro 4.2.1 WeChat mini programs.

The package shares tokens and design contracts with `@zadmin/zui/core`; it does not depend on the Web renderer. Use it together with `@zadmin/svelte-taro` and the exact custom-renderer Svelte artifact documented by that package.

## Components

```svelte
<script lang="ts">
	import { Box, Button, Stack, Text, ZuiProvider } from '@zadmin/zui-taro';
</script>

<ZuiProvider>
	<Box>
		<Stack gap="medium">
			<Text size="large">Account</Text>
			<Button>Save</Button>
		</Stack>
	</Box>
</ZuiProvider>
```

The foundational set is `ZuiProvider`, `Box`, `Stack`, `Text`, and `Button`. WeChat flow components are `CapabilityGate`, `PrivacyConsent`, and `PhoneNumberButton`. The latter two only bridge explicit user gestures; they never exchange a phone code, accept privacy consent, or log sensitive values.

`Button` preserves ZUI design props and typed WeChat `openType` event callbacks. Camera, map, canvas, media, live, WebView, and similar tags remain native elements typed by `@zadmin/svelte-taro/native`; they are not disguised as design components.

## ICSS subset

```ts
import { bindTaroIcss, createIcssSlot, defaultIcss, slotValues } from '@zadmin/zui-taro';

const width = createIcssSlot('panel-width', 'panelWidth');
const panel = defaultIcss((style) => {
	style.backgroundColor._surface;
	style.width.px(width);
});

const inlineStyle = bindTaroIcss(panel, slotValues([[width, 320]]));
```

The compiler emits a deterministic class and static WXSS for flat declarations. Dynamic leaves become an inline Mini Program style string without creating a new class or rule. Supported units are px, percent, and explicit `rpx()` raw values. Unsupported properties, units, selectors, pseudo-elements, container/support queries, and browser CSSOM semantics fail with diagnostics rather than emitting pretend-valid WXSS.

Exact peers: Svelte 5.56.10 custom artifact and Taro runtime/components 4.2.1. Clean-tarball installation and external Taro build are part of the repository release gate.
