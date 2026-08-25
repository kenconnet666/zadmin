<script lang="ts">
	import { Box, defaultTheme, icss } from '@zadmin/zui-svelte';

	let width = $state(10);
	const panelClass = $derived(icss(defaultTheme, (style) => style.width.px(width)));
</script>

<button data-testid="increment" onclick={() => (width += 1)}>Increment</button>
<Box data-testid="target" class={panelClass}>Target</Box>
