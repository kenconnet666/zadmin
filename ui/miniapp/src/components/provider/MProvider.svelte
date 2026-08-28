<script lang="ts">
	import { defaultMiniappTheme, provideMiniappTheme } from '../../theme/index.ts';
	import type { MProviderProps } from '../types.ts';

	let { children, theme = defaultMiniappTheme }: MProviderProps = $props();
	provideMiniappTheme(() => theme);
</script>

{@render children?.()}
