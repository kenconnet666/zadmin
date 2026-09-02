import { getContext, setContext } from 'svelte';

import type { PortalTarget } from '../../../runtime/layer/portal.js';

export interface ZDialogContext {
	readonly contentId: string;
	readonly descriptionId: string;
	readonly description: HTMLParagraphElement | null;
	readonly hasDescription: boolean;
	readonly hasTitle: boolean;
	readonly exitDuration: number;
	readonly open: boolean;
	readonly overlay: HTMLDivElement | null;
	readonly portalTarget: PortalTarget;
	readonly reducedMotion: boolean;
	readonly titleId: string;
	readonly title: HTMLHeadingElement | null;
	readonly trigger: HTMLButtonElement | null;
	readonly triggerId: string;
	setOpen(open: boolean): void;
	registerDescription(): () => void;
	registerTitle(): () => void;
	setOverlay(overlay: HTMLDivElement | null): void;
	setDescription(description: HTMLParagraphElement | null): void;
	setTitle(title: HTMLHeadingElement | null): void;
	setTrigger(trigger: HTMLButtonElement | null): void;
}

const DIALOG_CONTEXT = Symbol('zui-dialog-context');

export function provideZDialog(context: ZDialogContext): ZDialogContext {
	setContext(DIALOG_CONTEXT, context);
	return context;
}

export function useZDialog(): ZDialogContext {
	const context = getContext<ZDialogContext | undefined>(DIALOG_CONTEXT);
	if (!context) throw new Error('ZDialog compound components must be rendered inside ZDialog.');
	return context;
}
