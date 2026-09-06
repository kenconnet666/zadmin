<script lang="ts">
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZScrollArea, {
		type ZScrollAreaController
	} from '../src/components/layout/ZScrollArea.svelte';
	let controller = $state<ZScrollAreaController | null>(null);
	let reduced = $state(false);
	let left = $state(0);
	let top = $state(0);
	let events = $state(0);
	let snapshot = $state(0);
	let shown = $state(true);
</script>

<button
	type="button"
	data-testid="scroll-position"
	onclick={() => controller?.scrollTo({ top: 80, behavior: 'instant' })}>Scroll</button
>
<button
	type="button"
	data-testid="scroll-reduced"
	onclick={() => {
		reduced = true;
		controller?.scrollTo({ top: 160, behavior: 'smooth' });
		snapshot = controller?.position?.top ?? -1;
	}}>Reduce motion</button
>
<button type="button" data-testid="scroll-unmount" onclick={() => (shown = false)}>Unmount</button>
<output data-testid="scroll-output"
	>{left}:{top}:{events}:{snapshot}:{controller === null ? 'released' : 'ready'}</output
>
<ZProvider motion={reduced ? 'reduced' : 'full'}>
	{#if shown}
		<ZScrollArea
			bind:controller
			height={120}
			aria-label="Fixture scroll"
			data-testid="scroll-vertical"
			onscroll={() => (events += 1)}
			onScrollPositionChange={(position) => {
				left = position.left;
				top = position.top;
			}}><div style="height: 600px">Native content</div></ZScrollArea
		>
	{/if}
	<ZScrollArea
		height={100}
		axis="both"
		aria-label="Both directions"
		scrollbarGutter="auto"
		data-testid="scroll-both"
		style="width: 240px"><div style="width: 600px; height: 400px">Wide content</div></ZScrollArea
	>
	<ZScrollArea maxHeight={100} aria-label="Auto height" data-testid="scroll-autosize"
		><div style="height: 40px">Short</div></ZScrollArea
	>
	<div dir="rtl">
		<ZScrollArea
			height={80}
			axis="x"
			aria-label="RTL native offset"
			data-testid="scroll-rtl"
			style="width: 240px"><div style="width: 600px">RTL content</div></ZScrollArea
		>
	</div>
	<ZProvider direction="rtl">
		<ZScrollArea
			height={80}
			axis="x"
			aria-label="Provider RTL native offset"
			data-testid="scroll-provider-rtl"
			style="width: 240px"><div style="width: 600px">Provider RTL content</div></ZScrollArea
		>
	</ZProvider>
</ZProvider>
