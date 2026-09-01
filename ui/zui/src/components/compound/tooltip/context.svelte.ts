import { getContext, setContext } from 'svelte';

import type { PortalTarget } from '../../../runtime/layer/portal.js';
import type { PopoverPlacement } from '../popover/context.svelte.js';

interface GroupTimer {
	readonly id: number;
	readonly view: Window;
}

interface ActiveTooltip {
	readonly close: () => void;
	readonly focused: () => boolean;
	readonly id: string;
	readonly open: () => void;
}

/** Imperative warmup/cooldown owner scoped by ZTooltipGroup. */
export class TooltipGroupCoordinator {
	#active: ActiveTooltip | undefined;
	#cooldown: GroupTimer | undefined;
	#suspendedFocus: ActiveTooltip | undefined;
	#warm = false;

	openDelay(delay: number): number {
		return this.#warm ? 0 : delay;
	}

	opened(id: string, close: () => void, open: () => void, focused: () => boolean): void {
		this.#clearCooldown();
		const previous = this.#active;
		const next = { close, focused, id, open };
		if (previous?.id === id) {
			this.#active = next;
			this.#warm = true;
			return;
		}
		if (previous?.focused() && !next.focused()) this.#suspendedFocus = previous;
		else if (next.focused()) this.#suspendedFocus = undefined;
		this.#active = next;
		this.#warm = true;
		previous?.close();
	}

	closed(id: string, view: Window | undefined, skipDelayDuration: number): void {
		if (this.#active?.id !== id) return;
		this.#active = undefined;
		this.#clearCooldown();
		const suspended = this.#suspendedFocus;
		this.#suspendedFocus = undefined;
		if (suspended?.focused()) {
			suspended.open();
			return;
		}
		if (!view || skipDelayDuration === 0) {
			this.#warm = false;
			return;
		}
		const timerId = view.setTimeout(() => {
			if (this.#cooldown?.id !== timerId) return;
			this.#cooldown = undefined;
			this.#warm = false;
		}, skipDelayDuration);
		this.#cooldown = { id: timerId, view };
	}

	removed(id: string, view: Window | undefined, skipDelayDuration: number): void {
		if (this.#suspendedFocus?.id === id) this.#suspendedFocus = undefined;
		if (this.#active?.id !== id) return;
		this.#active = undefined;
		const suspended = this.#suspendedFocus;
		this.#suspendedFocus = undefined;
		if (suspended?.focused()) {
			suspended.open();
			return;
		}
		this.#clearCooldown();
		if (!view || skipDelayDuration === 0) {
			this.#warm = false;
			return;
		}
		const timerId = view.setTimeout(() => {
			if (this.#cooldown?.id !== timerId) return;
			this.#cooldown = undefined;
			this.#warm = false;
		}, skipDelayDuration);
		this.#cooldown = { id: timerId, view };
	}

	destroy(): void {
		this.#clearCooldown();
		this.#active = undefined;
		this.#suspendedFocus = undefined;
		this.#warm = false;
	}

	#clearCooldown(): void {
		if (this.#cooldown) this.#cooldown.view.clearTimeout(this.#cooldown.id);
		this.#cooldown = undefined;
	}
}

export interface ZTooltipGroupContext {
	readonly closeDelay: number;
	readonly coordinator: TooltipGroupCoordinator;
	readonly delay: number;
	readonly skipDelayDuration: number;
}

export interface ZTooltipContext {
	readonly contentId: string;
	readonly exitDuration: number;
	readonly gutter: number;
	readonly hoverable: boolean;
	readonly open: boolean;
	readonly placement: PopoverPlacement;
	readonly portalTarget: PortalTarget;
	readonly reducedMotion: boolean;
	readonly trigger: HTMLElement | null;
	readonly triggerFocused: boolean;
	cancelClose(): void;
	close(immediate?: boolean): void;
	openAfterDelay(immediate?: boolean): void;
	setOpen(open: boolean): void;
	setTrigger(trigger: HTMLElement | null): void;
	setTriggerFocused(focused: boolean): void;
}

const TOOLTIP_CONTEXT = Symbol('zui-tooltip-context');
const TOOLTIP_GROUP_CONTEXT = Symbol('zui-tooltip-group-context');

export function provideZTooltip(context: ZTooltipContext): ZTooltipContext {
	setContext(TOOLTIP_CONTEXT, context);
	return context;
}

export function provideZTooltipGroup(context: ZTooltipGroupContext): ZTooltipGroupContext {
	setContext(TOOLTIP_GROUP_CONTEXT, context);
	return context;
}

export function useOptionalZTooltipGroup(): ZTooltipGroupContext | undefined {
	return getContext<ZTooltipGroupContext | undefined>(TOOLTIP_GROUP_CONTEXT);
}

export function useZTooltip(): ZTooltipContext {
	const context = getContext<ZTooltipContext | undefined>(TOOLTIP_CONTEXT);
	if (!context) throw new Error('ZTooltipTrigger and ZTooltipContent require ZTooltip.');
	return context;
}
