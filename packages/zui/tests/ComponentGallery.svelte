<script lang="ts">
	import { Box, Button, Stack, Text, ZuiProvider, defaultTheme, defineTheme } from '@zadmin/zui';

	const theme = defineTheme({
		...defaultTheme,
		color: { ...defaultTheme.color, primary: '#7c3aed', primaryHover: '#6d28d9' },
		fontSize: { ...defaultTheme.fontSize, medium: '1rem' },
		space: { ...defaultTheme.space, medium: '0.5rem' }
	});
	let variable = $state<number | undefined>(1);
	let authoredStyle = $state('color: red');
</script>

<ZuiProvider {theme}>
	<Button data-testid="button" variant="secondary">Save</Button>
	<Stack data-testid="stack" direction="row" gap="medium">
		<Text data-testid="text" color="primary">Label</Text>
	</Stack>
	<Box data-testid="manual" __icssVariables={{ '--manual-value': variable }} style={authoredStyle}
		>Manual</Box
	>
	<button data-testid="change" onclick={() => (variable = 2)}>Change</button>
	<button data-testid="style" onclick={() => (authoredStyle = 'color: blue')}>Style</button>
	<button data-testid="remove" onclick={() => (variable = undefined)}>Remove</button>
</ZuiProvider>
