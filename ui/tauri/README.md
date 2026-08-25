# @zadmin/tauri

Typed Tauri system capabilities and Svelte desktop integrations. The root entry is independent from Svelte and never exposes raw `invoke()` calls to components.

```ts
import { createTauriDesktopPlatform } from '@zadmin/tauri';

const desktop = createTauriDesktopPlatform({
	opener: { allowedOrigins: ['https://v2.tauri.app'] }
});

const result = await desktop.os.snapshot();
if (result.ok) console.log(result.value);
```

Use `@zadmin/tauri/testing` for deterministic fake capabilities. System permissions and filesystem scopes remain owned by each Tauri host application's capability files.

Svelte desktop integrations are isolated behind a separate entry and reuse `@zadmin/zui-svelte`:

```svelte
<script lang="ts">
	import { ZuiProvider } from '@zadmin/zui-svelte';
	import { DesktopProvider, WindowFrame } from '@zadmin/tauri/svelte';
	import { createTauriDesktopPlatform } from '@zadmin/tauri';

	const desktop = createTauriDesktopPlatform({
		opener: { allowedOrigins: ['https://v2.tauri.app'] }
	});
</script>

<ZuiProvider>
	<DesktopProvider platform={desktop}>
		<WindowFrame>Desktop content</WindowFrame>
	</DesktopProvider>
</ZuiProvider>
```

The first component set is `DesktopProvider`, `WindowFrame`, `WindowTitleBar`, `WindowControls`, `FilePickerButton`, `ClipboardButton`, `ExternalLink`, `NotificationButton`, and `SystemInfo`. Components use the injected platform and never import Tauri plugins directly.
