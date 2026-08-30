<script lang="ts">
	import { ZButton, ZTour, type TourStep } from '../src/entrypoints/index.js';
	const steps: readonly TourStep[] = [
		{
			description: 'Inspect the release summary.',
			id: 'summary',
			placement: 'bottom-start',
			target: '#tour-summary',
			title: 'Release summary'
		},
		{
			description: 'Open the production metrics.',
			id: 'metrics',
			placement: 'right',
			target: '#tour-metrics',
			title: 'Production metrics'
		}
	];
	let open = $state(false);
	let step = $state(0);
	let completed = $state(0);
</script>

<ZButton
	id="tour-start"
	onclick={() => {
		step = 0;
		open = true;
	}}>Start tour</ZButton
>
<button id="tour-summary" type="button">Summary target</button>
<button id="tour-metrics" type="button">Metrics target</button>
<ZTour {steps} bind:open bind:step onComplete={() => (completed += 1)} />
<output data-testid="tour-output">{open}:{step}:{completed}</output>
