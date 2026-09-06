import type {
	StepsItem,
	StepRequestEvent,
	ZStepsProps
} from '../src/components/navigation/ZSteps.svelte';
const items: readonly StepsItem<'profile' | 'confirm'>[] = [
	{ key: 'profile', title: 'Profile', status: 'complete', clickable: true },
	{ key: 'confirm', title: 'Confirm', href: '/confirm' }
];
const props: ZStepsProps<'profile' | 'confirm'> = {
	items,
	currentKey: 'profile',
	size: 'xlarge',
	onStepRequest(event) {
		const key: 'profile' | 'confirm' = event.key;
		void key;
		event.preventDefault();
	}
};
// @ts-expect-error Current keys retain the caller's finite key type.
const invalidCurrent: ZStepsProps<'profile'> = { items: [], currentKey: 'other' };
// @ts-expect-error Current state belongs to currentKey, not the business status axis.
const invalidStatus: StepsItem = { key: 'one', title: 'One', status: 'current' };
// @ts-expect-error Step identity excludes object keys.
const invalidKey: StepsItem = { key: {}, title: 'One' };
// @ts-expect-error Five control sizes are a closed contract.
const invalidSize: ZStepsProps = { items: [], size: 'giant' };
const passive: StepsItem<'profile'> = { key: 'profile', title: 'Profile' };
const link: StepsItem<'confirm'> = {
	key: 'confirm',
	title: 'Confirm',
	href: '/confirm',
	target: '_blank',
	rel: 'help'
};
// @ts-expect-error Link and button behavior are mutually exclusive.
const ambiguous: StepsItem = { key: 1, title: 'One', href: '/one', clickable: true };
// @ts-expect-error Link descriptors also reject explicitly false clickable flags.
const falseClickable: StepsItem = { key: 1, title: 'One', href: '/one', clickable: false };
// @ts-expect-error Native target only belongs to descriptors with a required href.
const orphanTarget: StepsItem = { key: 1, title: 'One', target: '_blank' };
// @ts-expect-error Native rel only belongs to descriptors with a required href.
const orphanRel: StepsItem = { key: 1, title: 'One', clickable: true, rel: 'help' };
const receive = (event: StepRequestEvent<'profile'>): 'profile' => event.key;
void [
	props,
	passive,
	link,
	invalidCurrent,
	invalidStatus,
	invalidKey,
	invalidSize,
	ambiguous,
	falseClickable,
	orphanTarget,
	orphanRel,
	receive
];
