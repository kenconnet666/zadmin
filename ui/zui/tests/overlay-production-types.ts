import type { ComponentProps } from 'svelte';

import ZAlertDialog, {
	type ZAlertDialogProps
} from '../src/components/compound/alert-dialog/ZAlertDialog.svelte';
import ZAlertDialogContent, {
	type ZAlertDialogContentProps
} from '../src/components/compound/alert-dialog/ZAlertDialogContent.svelte';
import ZDialog, { type ZDialogProps } from '../src/components/compound/dialog/ZDialog.svelte';
import ZDialogContent, {
	type DialogEscapeEvent,
	type ZDialogContentProps
} from '../src/components/compound/dialog/ZDialogContent.svelte';
import ZPopover, { type ZPopoverProps } from '../src/components/compound/popover/ZPopover.svelte';
import ZPopoverContent, {
	type ZPopoverContentProps
} from '../src/components/compound/popover/ZPopoverContent.svelte';

const dialog = { defaultOpen: true } satisfies ComponentProps<
	typeof ZDialog
> satisfies ZDialogProps;
const content = {
	ariaLabel: 'Settings',
	ariaLabelledBy: null,
	initialFocus: () => null,
	onEscape(event: DialogEscapeEvent) {
		event.preventDefault();
	},
	restoreFocus: false,
	restoreTarget: () => null
} satisfies ComponentProps<typeof ZDialogContent> satisfies ZDialogContentProps;
const alert = {
	onAction: async (_event: MouseEvent) => undefined,
	onActionError: (_error: unknown) => undefined
} satisfies ComponentProps<typeof ZAlertDialog> satisfies ZAlertDialogProps;
const alertContent = {
	initialFocus: () => null,
	restoreFocus: true
} satisfies ComponentProps<typeof ZAlertDialogContent> satisfies ZAlertDialogContentProps;
const popover = { gutter: 4, modal: false, placement: 'bottom-start' } satisfies ComponentProps<
	typeof ZPopover
> satisfies ZPopoverProps;
const popoverContent = {
	ariaLabelledBy: null,
	restoreFocus: true,
	restoreTarget: () => null
} satisfies ComponentProps<typeof ZPopoverContent> satisfies ZPopoverContentProps;

// @ts-expect-error Dialog is intentionally modal-only
const invalidDialog = { modal: false } satisfies ZDialogProps;
// @ts-expect-error AlertDialog always derives its accessible name from required Title and Description
const invalidAlertContent = {
	ariaLabel: 'Bypass required title'
} satisfies ZAlertDialogContentProps;

void dialog;
void content;
void alert;
void alertContent;
void popover;
void popoverContent;
void invalidDialog;
void invalidAlertContent;
