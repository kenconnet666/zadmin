<script lang="ts">
	import { provideZui } from './context.js';
	import type { ZProviderProps } from './types.js';

	let { children, runtime, theme }: ZProviderProps = $props();
	provideZui(() => ({ runtime, theme }));
</script>

{@render children?.()}
