import { getContext, setContext } from 'svelte';

import type { PortalTarget } from '../../../runtime/layer/portal.js';
import type { PopoverPlacement } from '../popover/context.svelte.js';

export interface ZTooltipContext {
	readonly contentId: string;
	readonly exitDuration: number;
	readonly gutter: number;
	readonly open: boolean;
	readonly placement: PopoverPlacement;
	readonly portalTarget: PortalTarget;
	readonly reducedMotion: boolean;
	readonly trigger: HTMLButtonElement | null;
	cancelClose(): void;
	close(immediate?: boolean): void;
	openAfterDelay(): void;
	setOpen(open: boolean): void;
	setTrigger(trigger: HTMLButtonElement | null): void;
}

const TOOLTIP_CONTEXT = Symbol('zui-tooltip-context');

export function provideZTooltip(context: ZTooltipContext): ZTooltipContext {
	setContext(TOOLTIP_CONTEXT, context);
	return context;
}

export function useZTooltip(): ZTooltipContext {
	const context = getContext<ZTooltipContext | undefined>(TOOLTIP_CONTEXT);
	if (!context) throw new Error('ZTooltipTrigger and ZTooltipContent require ZTooltip.');
	return context;
}
