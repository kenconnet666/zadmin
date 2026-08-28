<script lang="ts">
	import {
		ZBox,
		ZButton,
		ZIcon,
		ZProvider,
		ZStack,
		ZText,
		defaultTheme,
		defineTheme
	} from '@zadmin/zui';
	import { __icssCarrier } from '@zadmin/zui/internal';

	const theme = defineTheme({
		...defaultTheme,
		color: { ...defaultTheme.color, primary: '#7c3aed', primaryHover: '#6d28d9' },
		fontSize: { ...defaultTheme.fontSize, medium: '1rem' },
		space: { ...defaultTheme.space, medium: '0.5rem' }
	});
	let variable = $state<number | undefined>(1);
	let authoredStyle = $state('color: red');
</script>

<ZProvider {theme}>
	<ZButton data-testid="button" variant="secondary">Save</ZButton>
	<ZStack data-testid="stack" direction="row" gap="medium">
		<ZText data-testid="text" tone="primary">Label</ZText>
		<ZIcon data-testid="icon" label="Search" name="search" size={20} />
	</ZStack>
	<ZStack data-testid="numeric-stack" direction="row" gap={6}></ZStack>
	<ZBox
		{...__icssCarrier({ '--manual-value': variable })}
		data-testid="manual"
		style={authoredStyle}>Manual</ZBox
	>
	<button data-testid="change" onclick={() => (variable = 2)}>Change</button>
	<button data-testid="style" onclick={() => (authoredStyle = 'color: blue')}>Style</button>
	<button data-testid="remove" onclick={() => (variable = undefined)}>Remove</button>
</ZProvider>
