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
