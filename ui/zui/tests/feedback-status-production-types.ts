import type { ComponentProps } from 'svelte';

import ZAlert, {
	type AlertLive,
	type AlertTone,
	type ZAlertProps
} from '../src/components/feedback/ZAlert.svelte';
import ZLoadingBar, {
	type LoadingBarController,
	type LoadingBarMode,
	type LoadingBarState,
	type ZLoadingBarProps
} from '../src/components/feedback/ZLoadingBar.svelte';
import ZSpinner, {
	type SpinnerSize,
	type SpinnerTone,
	type ZSpinnerProps
} from '../src/components/feedback/ZSpinner.svelte';

const live: AlertLive = 'assertive';
const alertTone: AlertTone = 'warning';
const alertProps = {
	dismissible: true,
	live,
	title: 'Certificate expires',
	tone: alertTone
} satisfies ComponentProps<typeof ZAlert> satisfies ZAlertProps;

const size: SpinnerSize = 'large';
const spinnerTone: SpinnerTone = 'inherit';
const spinnerProps = {
	'aria-hidden': true,
	label: 'Submitting',
	size,
	tone: spinnerTone
} satisfies ComponentProps<typeof ZSpinner> satisfies ZSpinnerProps;

const mode: LoadingBarMode = 'page';
const state: LoadingBarState = 'loading';
const loadingProps = {
	active: true,
	errorDelay: null,
	finishDelay: 200,
	label: 'Navigation',
	mode,
	state,
	value: 32
} satisfies ComponentProps<typeof ZLoadingBar> satisfies ZLoadingBarProps;

function useController(controller: LoadingBarController): void {
	controller.start();
	controller.update(45);
	controller.finish({ hideAfter: 100 });
	controller.error({ hideAfter: null });
	controller.reset();
}

// @ts-expect-error Alert tone is finite
const invalidAlert = { title: 'Invalid', tone: 'error' } satisfies ZAlertProps;
// @ts-expect-error Spinner does not use semantic result tones
const invalidSpinner = { tone: 'success' } satisfies ZSpinnerProps;
// @ts-expect-error LoadingBar mode is local or page
const invalidMode = { mode: 'global' } satisfies ZLoadingBarProps;
// @ts-expect-error LoadingBar state is finite
const invalidState = { state: 'finished' } satisfies ZLoadingBarProps;

void alertProps;
void spinnerProps;
void loadingProps;
void useController;
void invalidAlert;
void invalidSpinner;
void invalidMode;
void invalidState;
