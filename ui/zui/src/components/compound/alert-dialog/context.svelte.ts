import { getContext, setContext } from 'svelte';

export interface ZAlertDialogContext {
	readonly action: HTMLButtonElement | null;
	readonly cancel: HTMLButtonElement | null;
	readonly pending: boolean;
	cancelDialog(): void;
	confirm(event: MouseEvent): void;
	setAction(action: HTMLButtonElement | null): void;
	setCancel(cancel: HTMLButtonElement | null): void;
}

const ALERT_DIALOG_CONTEXT = Symbol('zui-alert-dialog-context');

export function provideZAlertDialog(context: ZAlertDialogContext): ZAlertDialogContext {
	setContext(ALERT_DIALOG_CONTEXT, context);
	return context;
}

export function useZAlertDialog(): ZAlertDialogContext {
	const context = getContext<ZAlertDialogContext | undefined>(ALERT_DIALOG_CONTEXT);
	if (!context) throw new Error('ZAlertDialog compound components require ZAlertDialog.');
	return context;
}
