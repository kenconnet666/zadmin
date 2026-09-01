import { getContext, setContext } from 'svelte';

import type { PortalTarget } from '../../../runtime/layer/portal.js';

export type PopoverPlacement =
	| 'bottom'
	| 'bottom-end'
	| 'bottom-start'
	| 'left'
	| 'left-end'
	| 'left-start'
	| 'right'
	| 'right-end'
	| 'right-start'
	| 'top'
	| 'top-end'
	| 'top-start';

export interface ZPopoverContext {
	readonly contentId: string;
	readonly exitDuration: number;
	readonly gutter: number;
	readonly matchWidth: boolean;
	readonly modal: boolean;
	readonly open: boolean;
	readonly placement: PopoverPlacement;
	readonly portalTarget: PortalTarget;
	readonly reducedMotion: boolean;
	readonly trigger: HTMLElement | null;
	readonly triggerId: string;
	setOpen(open: boolean): void;
	setTrigger(trigger: HTMLElement | null): void;
}

const POPOVER_CONTEXT = Symbol('zui-popover-context');

export function provideZPopover(context: ZPopoverContext): ZPopoverContext {
	setContext(POPOVER_CONTEXT, context);
	return context;
}

export function useZPopover(): ZPopoverContext {
	const context = getContext<ZPopoverContext | undefined>(POPOVER_CONTEXT);
	if (!context) throw new Error('ZPopover compound components require ZPopover.');
	return context;
}
