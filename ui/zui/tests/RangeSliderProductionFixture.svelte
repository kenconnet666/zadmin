<script lang="ts">
	import ZRangeSlider from '../src/components/input/ZRangeSlider.svelte';
	import ZSlider from '../src/components/input/ZSlider.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import type { SliderCollision, SliderRangeValue } from '../src/runtime/slider.js';

	let range = $state<SliderRangeValue>([20, 80]);
	let single = $state(40);
	let collision = $state<SliderCollision>('clamp');
	let fieldsetDisabled = $state(false);
	let readonly = $state(false);
	let changes = $state(0);
	let commits = $state(0);
	let inputs = $state(0);
	let nativeChanges = $state(0);
	let cancelPointerUp = $state(false);
	let overlapPointerPhase = $state<'idle' | 'down' | 'move' | 'up'>('idle');
	let overlapPointerMoves = $state(0);
	let overlapCaptureSeen = $state(false);

	export function setCollision(next: SliderCollision): void {
		collision = next;
	}

	export function setFieldsetDisabled(next: boolean): void {
		fieldsetDisabled = next;
	}

	export function setReadonly(next: boolean): void {
		readonly = next;
	}
	export function setCancelPointerUp(next: boolean): void {
		cancelPointerUp = next;
	}
</script>

<form data-testid="range-form">
	<fieldset disabled={fieldsetDisabled}>
		<ZRangeSlider
			bind:value={range}
			{collision}
			data-testid="range-main"
			defaultValue={[20, 80]}
			formatValue={(value) => `${value} percent`}
			marks={[
				{ label: 'Minimum endpoint', value: 0 },
				{ label: 'Maximum endpoint', value: 100 }
			]}
			minRange={10}
			name="price"
			onchange={() => (nativeChanges += 1)}
			oninput={() => (inputs += 1)}
			onpointerup={(event) => {
				if (cancelPointerUp) event.preventDefault();
			}}
			onValueChange={() => (changes += 1)}
			onValueCommit={() => (commits += 1)}
			{readonly}
			thumbLabels={['Minimum price', 'Maximum price']}
			valueLabel="always"
		/>
	</fieldset>
	<button type="reset">Reset</button>
</form>

<ZSlider
	bind:value={single}
	aria-label="Vertical threshold"
	data-testid="slider-extended"
	marks={[{ label: 'Middle', value: 50 }]}
	orientation="vertical"
	reversed
	valueLabel="always"
/>

<ZProvider direction="rtl">
	<ZSlider
		aria-label="Instance LTR slider"
		data-testid="slider-instance-direction"
		dir="ltr"
		value={40}
	/>
</ZProvider>

<ZRangeSlider
	data-testid="range-rtl"
	dir="rtl"
	defaultValue={[10, 60]}
	thumbLabels={['RTL lower', 'RTL upper']}
/>

<ZRangeSlider
	data-testid="range-overlap"
	defaultValue={[50, 50]}
	style="width: 640px; max-width: 100%;"
	thumbLabels={['Overlap lower', 'Overlap upper']}
	onpointerdown={() => (overlapPointerPhase = 'down')}
	onpointermove={(event) => {
		overlapPointerPhase = 'move';
		overlapPointerMoves += 1;
		overlapCaptureSeen = event.currentTarget.hasPointerCapture(event.pointerId);
	}}
	onpointerup={() => (overlapPointerPhase = 'up')}
	data-pointer-phase={overlapPointerPhase}
	data-pointer-moves={overlapPointerMoves}
	data-capture-seen={overlapCaptureSeen || undefined}
/>

<ZRangeSlider
	data-testid="range-vertical"
	defaultValue={[25, 75]}
	orientation="vertical"
	thumbLabels={['Vertical lower', 'Vertical upper']}
/>

{#each ['xsmall', 'small', 'medium', 'large', 'xlarge'] as sliderSize (sliderSize)}
	<ZRangeSlider
		data-testid={`range-${sliderSize}`}
		defaultValue={[30, 70]}
		size={sliderSize as 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'}
		thumbLabels={[`${sliderSize} lower`, `${sliderSize} upper`]}
		valueLabel="never"
	/>
{/each}

<output data-testid="range-output" data-commits={commits}
	>{range[0]}:{range[1]}:{changes}:{commits}:{inputs}:{nativeChanges}</output
>
