<script lang="ts">
	import {
		ZBox,
		ZButton,
		ZIcon,
		ZProvider,
		ZStack,
		ZText,
		defaultTheme,
		defineTheme,
		icss
	} from '@zadmin/zui';
	import { __icssCarrier } from '@zadmin/zui/internal';

	const theme = defineTheme({
		...defaultTheme,
		color: { ...defaultTheme.color, primary: '#7c3aed', primaryHover: '#6d28d9' },
		fontSize: { ...defaultTheme.fontSize, medium: '1rem' },
		space: { ...defaultTheme.space, medium: '0.5rem' }
	});
	const overrideClass = icss(defaultTheme, (s) => s.backgroundColor._danger);
	let variable = $state<number | undefined>(1);
	let authoredStyle = $state('color: red');
</script>

<ZProvider {theme}>
	<ZButton class={overrideClass} data-testid="button" variant="secondary">Save</ZButton>
	<ZButton aria-label="Small square" data-testid="button-square-small" shape="square" size="small"
		><ZIcon name="search" /></ZButton
	>
	<ZButton
		aria-label="Medium square"
		data-testid="button-square-medium"
		shape="square"
		size="medium"><ZIcon name="search" /></ZButton
	>
	<ZButton aria-label="Large square" data-testid="button-square-large" shape="square" size="large"
		><ZIcon name="search" /></ZButton
	>
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
