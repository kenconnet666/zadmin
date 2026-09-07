import type { PopoverPlacement } from '../components/compound/popover/ZPopover.svelte';

export type PickerPresentation = 'popover' | 'inline';

/** Inline panels are always present and cannot have a competing popup-state owner. */
export interface PopoverPickerPresentationProps {
	readonly presentation?: 'popover';
	readonly defaultOpen?: boolean;
	readonly onOpenChange?: (open: boolean) => void;
	open?: boolean;
	readonly placement?: PopoverPlacement;
}
export interface InlinePickerPresentationProps {
	readonly presentation: 'inline';
	readonly defaultOpen?: never;
	readonly onOpenChange?: never;
	readonly open?: never;
	readonly placement?: never;
}
export type PickerPresentationProps =
	PopoverPickerPresentationProps | InlinePickerPresentationProps;

export function resolvePickerPresentation(value: PickerPresentation): PickerPresentation {
	if (value !== 'popover' && value !== 'inline')
		throw new TypeError("Picker presentation must be 'popover' or 'inline'.");
	return value;
}
