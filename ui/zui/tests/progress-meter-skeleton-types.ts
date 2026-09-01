import type { ComponentProps } from 'svelte';

import ZMeter, { type ZMeterProps } from '../src/components/data-display/ZMeter.svelte';
import ZProgress, {
	type ProgressTone,
	type ZProgressProps
} from '../src/components/data-display/ZProgress.svelte';
import ZSkeleton, { type ZSkeletonProps } from '../src/components/data-display/ZSkeleton.svelte';

const tone: ProgressTone = 'success';
const progressProps = {
	formatValue: (value, range) => `${value}/${range.max}`,
	indeterminateText: 'Waiting',
	label: 'Build',
	tone,
	value: 50,
	view: 'circle'
} satisfies ComponentProps<typeof ZProgress> satisfies ZProgressProps;

const meterProps = {
	formatValue: (value, range, state) => `${value}/${range.max}:${state}`,
	high: 80,
	label: 'Capacity',
	low: 30,
	optimum: 10,
	value: 60
} satisfies ComponentProps<typeof ZMeter> satisfies ZMeterProps;

const skeletonProps = {
	animated: false,
	height: '1.25rem',
	lines: 3,
	shape: 'line',
	width: 240
} satisfies ComponentProps<typeof ZSkeleton> satisfies ZSkeletonProps;

// @ts-expect-error Meter value is required
const invalidMeter = { label: 'Capacity' } satisfies ZMeterProps;
// @ts-expect-error Progress tones are finite
const invalidProgress = { label: 'Build', tone: 'neutral' } satisfies ZProgressProps;
// @ts-expect-error Skeleton lines are numeric
const invalidSkeleton = { lines: '3' } satisfies ZSkeletonProps;

void progressProps;
void meterProps;
void skeletonProps;
void invalidMeter;
void invalidProgress;
void invalidSkeleton;
