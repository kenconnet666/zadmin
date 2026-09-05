<script lang="ts">
	import { ZCard, ZProvider, defaultTheme, defineTheme } from '../src/entrypoints/index.js';

	const customTheme = defineTheme({
		...defaultTheme,
		shadow: { ...defaultTheme.shadow, large: '0 0 0 13px rgb(1 2 3 / 0.77)' }
	});
</script>

<ZCard data-testid="elevation-default">Default elevated</ZCard>
<ZCard data-testid="elevation-outlined" variant="outlined">Default outlined</ZCard>
<ZCard data-testid="elevation-explicit-medium" variant="outlined" elevation="medium">
	Explicit medium
</ZCard>
<ZCard data-testid="elevation-explicit-none" elevation="none">Explicit none</ZCard>

<ZProvider theme={customTheme} componentDefaults={{ card: { elevation: 'large' } }}>
	<ZCard data-testid="elevation-provider-default">Provider large</ZCard>
	<ZCard data-testid="elevation-explicit-large" elevation="large">Explicit large</ZCard>
</ZProvider>
