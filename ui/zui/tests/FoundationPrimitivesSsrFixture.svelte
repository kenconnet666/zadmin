<script lang="ts">
	import ZAspectRatio from '../src/components/layout/ZAspectRatio.svelte';
	import ZContainer from '../src/components/layout/ZContainer.svelte';
	import ZKbd from '../src/components/gene/ZKbd.svelte';
	import ZSeparator from '../src/components/gene/ZSeparator.svelte';
	import ZVisuallyHidden from '../src/components/gene/ZVisuallyHidden.svelte';
</script>

<ZSeparator label="Server boundary" />
<ZSeparator decorative orientation="vertical" />
<ZVisuallyHidden role="status">Server hidden</ZVisuallyHidden>
<ZKbd><ZKbd>Ctrl</ZKbd> + <ZKbd>K</ZKbd></ZKbd>
<ZAspectRatio ratio="4 / 3">Server ratio</ZAspectRatio>
<ZAspectRatio aria-label="Empty ratio" ratio={2} />
<ZContainer gutter="none" size="full">Server container</ZContainer>
