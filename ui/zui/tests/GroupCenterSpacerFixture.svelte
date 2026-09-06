<script lang="ts">
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZCenter from '../src/components/layout/ZCenter.svelte';
	import ZGroup from '../src/components/layout/ZGroup.svelte';
	import ZSpacer from '../src/components/layout/ZSpacer.svelte';
	let wide = $state(false);
</script>

<button type="button" data-testid="group-width-toggle" onclick={() => (wide = !wide)}
	>Change width</button
>
<ZGroup data-testid="group-reactive-style" style={`width: ${wide ? 300 : 240}px`}
	><span>Reactive style</span></ZGroup
>

<ZGroup data-testid="group-default" gap="small">
	<button type="button">First</button>
	<button type="button">Second</button>
</ZGroup>

<div data-testid="group-grow-owner" style="width: 320px">
	<ZGroup data-testid="group-grow" itemSizing="grow" preventGrowOverflow>
		<button type="button">Longer first choice</button>
		<button type="button">Second</button>
	</ZGroup>
</div>

<div data-testid="group-equal-owner" style="width: 320px">
	<ZGroup data-testid="group-equal" itemSizing="equal">
		<button type="button">One</button>
		<button type="button">Two</button>
	</ZGroup>
</div>

<ZProvider direction="rtl">
	<ZGroup data-testid="group-rtl" justify="between">
		<span>يمين</span>
		<span>يسار</span>
	</ZGroup>
</ZProvider>

<ZCenter data-testid="center-block" style="width: 240px; height: 120px">
	<span>Centered</span>
</ZCenter>
<div><ZCenter data-testid="center-inline" inline><span>Inline</span></ZCenter></div>

<ZSpacer blockSize={12} data-testid="spacer-fixed" inlineSize={20} />
<ZSpacer data-testid="spacer-default" />
<ZSpacer
	blockSize={{ base: 'none', medium: 'large' }}
	data-testid="spacer-responsive"
	inlineSize={{ base: 'small', medium: 'xlarge' }}
/>

<ZProvider direction="rtl">
	<ZCenter data-testid="center-provider-rtl" style="width: 120px; height: 48px">Centered</ZCenter>
	<ZSpacer data-testid="spacer-provider-rtl" inlineSize="large" />
</ZProvider>
