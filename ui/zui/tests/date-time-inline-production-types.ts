import type { ZDateTimePickerLocalProps } from '../src/components/input/ZDateTimePicker.svelte';
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
void [single, range, popup, invalidSingle, invalidRange, invalidDefault];
