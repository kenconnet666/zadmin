<script lang="ts">
	import { ZButton, ZProvider, type IcssRuntime, type ZuiTheme } from '../src/lib/index.js';

	interface Props {
		nestedTheme?: ZuiTheme;
		runtime: IcssRuntime;
		theme: ZuiTheme;
	}

	let { nestedTheme, runtime, theme }: Props = $props();
</script>

<ZProvider {runtime} {theme}>
	<ZButton data-testid="outer-provider">Outer</ZButton>
	{#if nestedTheme}
		<ZProvider theme={nestedTheme}>
			<ZButton data-testid="inner-provider">Inner</ZButton>
		</ZProvider>
	{/if}
</ZProvider>
