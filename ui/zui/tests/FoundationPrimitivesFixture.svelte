<script lang="ts">
	import ZAspectRatio from '../src/components/layout/ZAspectRatio.svelte';
	import ZContainer from '../src/components/layout/ZContainer.svelte';
	import ZBox from '../src/components/gene/ZBox.svelte';
	import ZKbd from '../src/components/gene/ZKbd.svelte';
	import ZSeparator from '../src/components/gene/ZSeparator.svelte';
	import ZVisuallyHidden from '../src/components/gene/ZVisuallyHidden.svelte';
</script>

<ZSeparator data-testid="separator-named" label="Named boundary" />
<ZSeparator data-testid="separator-decorative" decorative />
<ZBox style="height: 2rem">
	<ZSeparator data-testid="separator-vertical" orientation="vertical" />
</ZBox>

<ZVisuallyHidden data-testid="visually-hidden" role="status">Hidden status</ZVisuallyHidden>
<ZKbd data-testid="kbd-single">Ctrl</ZKbd>
<ZKbd data-testid="kbd-combination"><ZKbd>Ctrl</ZKbd> + <ZKbd>K</ZKbd></ZKbd>

<ZBox style="width: 20rem">
	<ZAspectRatio data-testid="aspect-ratio" ratio="16 / 9">Ratio content</ZAspectRatio>
	<ZAspectRatio aria-label="Empty ratio" data-testid="aspect-ratio-empty" ratio={1.5} />
</ZBox>

<ZContainer data-testid="container-outer" gutter="large" size="full">
	<ZContainer data-testid="container-inner" gutter="small" size="small">Nested</ZContainer>
</ZContainer>
