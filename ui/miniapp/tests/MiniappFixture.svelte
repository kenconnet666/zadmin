<script lang="ts">
	import {
		MBox,
		MButton,
		MIcon,
		MImage,
		MInput,
		MProvider,
		MStack,
		MText,
		defaultMiniappTheme,
		extendMiniappTheme
	} from '../src/index.ts';

	let count = $state(0);
	let value = $state('');
	let alternate = $state(false);
	const alternateTheme = extendMiniappTheme(defaultMiniappTheme, {
		color: { primary: '#7c3aed', surface: '#ede9fe' }
	});
	const theme = $derived(alternate ? alternateTheme : defaultMiniappTheme);
</script>

<MProvider {theme}>
	<MBox id="gallery" style={{ padding: '24rpx' }}>
		<MStack gap="small">
			<MText size="large" weight="bold">count:{count}</MText>
			<MIcon id="icon" name="check" label="Ready" />
			<MButton id="increment" onclick={() => (count += 1)}>increment</MButton>
			<MButton id="theme" variant="secondary" onclick={() => (alternate = !alternate)}>
				theme
			</MButton>
			<MInput id="input" bind:value placeholder="name" />
			<MText id="value">{value}</MText>
			<MImage id="image" src="/assets/logo.png" mode="aspectFit" lazyLoad />
		</MStack>
	</MBox>
</MProvider>
