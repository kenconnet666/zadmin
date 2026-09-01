import {
	arrow,
	autoUpdate,
	computePosition,
	flip,
	offset,
	shift,
	size,
	type Middleware,
	type Placement,
	type Strategy
} from '@floating-ui/dom';

export type FloatingPlacement =
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

export interface FloatingPosition {
	readonly placement: FloatingPlacement;
	readonly strategy: 'absolute' | 'fixed';
	readonly x: number;
	readonly y: number;
}

export interface FloatingOptions {
	readonly arrow?: HTMLElement | null;
	readonly gutter?: number;
	readonly matchWidth?: boolean;
	readonly onError?: (error: unknown) => void;
	readonly onPosition?: (position: FloatingPosition) => void;
	readonly placement?: FloatingPlacement;
	readonly strategy?: 'absolute' | 'fixed';
}

const oppositeSide = { bottom: 'top', left: 'right', right: 'left', top: 'bottom' } as const;

export class FloatingPositioner {
	#cleanup: (() => void) | undefined;
	#floating: HTMLElement | undefined;
	#generation = 0;
	#initialWidth: { readonly priority: string; readonly value: string } | undefined;
	#options: FloatingOptions | undefined;
	#reference: Element | undefined;

	start(reference: Element, floating: HTMLElement, options: FloatingOptions = {}): () => void {
		this.stop();
		this.#reference = reference;
		this.#floating = floating;
		this.#options = options;
		if (options.matchWidth) {
			this.#initialWidth = {
				priority: floating.style.getPropertyPriority('width'),
				value: floating.style.getPropertyValue('width')
			};
			this.#setReferenceWidth(reference.getBoundingClientRect().width);
		}
		const generation = (this.#generation += 1);
		this.#cleanup = autoUpdate(reference, floating, () => void this.#update(generation));
		return () => this.stop();
	}

	stop(): void {
		this.#generation += 1;
		this.#cleanup?.();
		if (this.#floating && this.#initialWidth) {
			this.#floating.style.setProperty(
				'width',
				this.#initialWidth.value,
				this.#initialWidth.priority
			);
		}
		this.#cleanup = undefined;
		this.#reference = undefined;
		this.#floating = undefined;
		this.#initialWidth = undefined;
		this.#options = undefined;
	}

	update(): Promise<void> {
		return this.#update(this.#generation);
	}

	async #update(generation: number): Promise<void> {
		const reference = this.#reference;
		const floating = this.#floating;
		const options = this.#options;
		if (!reference || !floating || !options) return;
		const middleware: Middleware[] = [
			offset(options.gutter ?? 8),
			flip(),
			shift({ padding: 8 }),
			size({
				apply: ({ availableHeight, availableWidth, rects }) => {
					floating.style.setProperty('--zui-floating-available-height', `${availableHeight}px`);
					floating.style.setProperty('--zui-floating-available-width', `${availableWidth}px`);
					if (options.matchWidth) this.#setReferenceWidth(rects.reference.width);
				}
			})
		];
		if (options.arrow) middleware.push(arrow({ element: options.arrow }));

		try {
			const result = await computePosition(reference, floating, {
				middleware,
				placement: (options.placement ?? 'bottom') as Placement,
				strategy: (options.strategy ?? 'absolute') as Strategy
			});
			if (generation !== this.#generation || floating !== this.#floating) return;
			Object.assign(floating.style, {
				left: `${result.x}px`,
				position: result.strategy,
				top: `${result.y}px`
			});
			if (options.arrow) {
				const arrowData = result.middlewareData.arrow;
				const side = result.placement.split('-')[0] as keyof typeof oppositeSide;
				Object.assign(options.arrow.style, {
					bottom: '',
					left: arrowData?.x === undefined ? '' : `${arrowData.x}px`,
					right: '',
					top: arrowData?.y === undefined ? '' : `${arrowData.y}px`,
					[oppositeSide[side]]: '-4px'
				});
			}
			options.onPosition?.({
				placement: result.placement as FloatingPlacement,
				strategy: result.strategy,
				x: result.x,
				y: result.y
			});
		} catch (error) {
			if (generation === this.#generation) options.onError?.(error);
		}
	}

	#setReferenceWidth(width: number): void {
		if (!this.#floating || !Number.isFinite(width) || width < 0) return;
		this.#floating.style.width = `${width}px`;
	}
}
