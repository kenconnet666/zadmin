<script lang="ts">
	import { Button, ZuiProvider, type IcssRuntime, type ZuiTheme } from '../src/lib/index.js';

	interface Props {
		nestedTheme?: ZuiTheme;
		runtime: IcssRuntime;
		theme: ZuiTheme;
	}

	let { nestedTheme, runtime, theme }: Props = $props();
</script>

<ZuiProvider {runtime} {theme}>
	<Button data-testid="outer-provider">Outer</Button>
	{#if nestedTheme}
		<ZuiProvider theme={nestedTheme}>
			<Button data-testid="inner-provider">Inner</Button>
		</ZuiProvider>
	{/if}
</ZuiProvider>
