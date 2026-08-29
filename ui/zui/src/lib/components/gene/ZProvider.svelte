<script module lang="ts">
	import type { Snippet } from 'svelte';

	import type { IcssRuntime } from '../../icss/runtime.js';
	import type { ZuiTheme } from '../../theme/types.js';

	export interface ZProviderProps {
		children?: Snippet;
		runtime?: IcssRuntime;
		theme?: ZuiTheme;
	}
</script>

<script lang="ts">
	import { provideZui } from '../../component-runtime/zui-context.js';

	let { children, runtime, theme }: ZProviderProps = $props();
	provideZui(() => ({ runtime, theme }));
</script>

{@render children?.()}
