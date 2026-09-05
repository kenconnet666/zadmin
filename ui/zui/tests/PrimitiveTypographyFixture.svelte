<script lang="ts">
	import {
		ZCard,
		ZDescriptionList,
		ZHeading,
		ZLink,
		ZList,
		ZProvider,
		ZStack,
		ZText,
		defaultTheme,
		extendTheme
	} from '../src/entrypoints/index.js';
	const customTheme = extendTheme(defaultTheme, { fontSize: { xxlarge: 38 } });
	const sizes = ['small', 'medium', 'large'] as const;

	const listItems = [
		{ key: 'semantic', label: 'Uses a normal-weight list label' },
		{ key: 'runtime', label: 'Keeps the caller item snippet available' }
	];
	const descriptions = [{ key: 'mode', term: 'Mode', description: 'Data convenience mode' }];
</script>

<ZList aria-label="Primitive list" data-testid="primitive-list" items={listItems} />
<ZHeading size="xxlarge" data-testid="heading-xxlarge">Theme heading</ZHeading>
<ZProvider theme={customTheme}>
	<ZHeading size="xxlarge" data-testid="heading-custom">Custom theme heading</ZHeading>
	<ZText size="xxlarge" data-testid="text-custom">Custom text scale</ZText>
</ZProvider>
{#each sizes as size (size)}
	<ZLink appearance="navigation" {size} href="#typography" data-testid={`nav-${size}`}
		>Navigation</ZLink
	>
{/each}
<ZDescriptionList
	aria-label="Primitive descriptions"
	data-testid="primitive-descriptions"
	items={descriptions}
/>
<ZStack direction="row" gap="medium" wrap>
	<ZCard bodyPadding="none" data-testid="card-padding-none" variant="outlined">
		<ZText data-testid="card-none-text">None padding is for edge-to-edge content.</ZText>
	</ZCard>
	<ZCard bodyPadding="large" data-testid="card-padding-large" variant="outlined">
		<ZText data-testid="card-large-text">Large padding is for readable content.</ZText>
	</ZCard>
</ZStack>
