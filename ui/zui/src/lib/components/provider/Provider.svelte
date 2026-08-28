<script lang="ts">
	import type { Snippet } from 'svelte';
	import { defaultTheme } from '../../theme/default.js';

	import { provideZuiTheme, type ZuiTheme } from './context.js';

	interface Props {
		children?: Snippet;
		theme?: ZuiTheme;
	}

	let { children, theme = defaultTheme }: Props = $props();
	provideZuiTheme(() => theme);
</script>

{@render children?.()}
