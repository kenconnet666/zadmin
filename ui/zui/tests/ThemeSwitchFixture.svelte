<script lang="ts">
	import { ZButton, ZProvider } from '../src/entrypoints/index.js';
	import { auroraLight, neonDark, paperLight } from '../src/entrypoints/themes.js';

	const themes = [auroraLight, neonDark, paperLight] as const;
	let index = $state(0);
</script>

<ZProvider theme={themes[index]!} colorScheme={index === 1 ? 'dark' : 'light'}>
	<ZButton data-testid="theme-switch-target">Themed action</ZButton>
	<button
		type="button"
		data-testid="theme-switch-next"
		onclick={() => (index = (index + 1) % themes.length)}
	>
		Next theme
	</button>
</ZProvider>
