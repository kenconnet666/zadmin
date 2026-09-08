import type {
	ZDateTimePickerLocalProps,
	ZDateTimePickerProps
} from '../src/components/input/ZDateTimePicker.svelte';
import type { ZDateTimeRangePickerLocalProps } from '../src/components/input/ZDateTimeRangePicker.svelte';

const inline = { presentation: 'inline', commitMode: 'confirm' } as const;
const single: ZDateTimePickerLocalProps = inline;
const range: ZDateTimeRangePickerLocalProps = inline;
const popup: ZDateTimePickerLocalProps = { presentation: 'popover', open: true, placement: 'top' };
const competingOpen = { ...inline, open: true } as const;
// @ts-expect-error Inline has no popup-state owner.
const invalidSingle: ZDateTimePickerLocalProps = competingOpen;
const competingPlacement = { ...inline, placement: 'top' } as const;
// @ts-expect-error Inline range has no floating placement.
const invalidRange: ZDateTimeRangePickerLocalProps = competingPlacement;
const competingDefault = { ...inline, defaultOpen: true } as const;
// @ts-expect-error Inline has no popup default.
const invalidDefault: ZDateTimePickerLocalProps = competingDefault;
type InlineAcrossDateTimeModes = ZDateTimePickerProps<'local' | 'zoned', 'inline'>;
const inlineAcrossDateTimeModes = {
	'aria-label': 'Any date-time mode inline picker',
	onclick: (event: MouseEvent) => event.preventDefault(),
	presentation: 'inline'
} satisfies InlineAcrossDateTimeModes;
const inlineAcrossModesWithPopoverState = { open: true, presentation: 'inline' } as const;
// @ts-expect-error A local|zoned inline picker has neither a popover owner nor its open state.
const invalidInlineAcrossModes: InlineAcrossDateTimeModes = inlineAcrossModesWithPopoverState;
void [
	single,
	range,
	popup,
	invalidSingle,
	invalidRange,
	invalidDefault,
	inlineAcrossDateTimeModes,
	invalidInlineAcrossModes
];
