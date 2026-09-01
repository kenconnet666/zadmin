export interface TextareaAutosizeActionOptions {
	readonly enabled: boolean;
	readonly maxRows?: number;
	readonly minRows?: number;
	readonly onResize?: (height: number) => void;
	readonly value: string;
}

interface MeasurementRecord {
	readonly element: HTMLTextAreaElement;
	users: number;
}

interface MeasurementLease {
	readonly element: HTMLTextAreaElement;
	release(): void;
}

const measurementRecords = new WeakMap<Document, MeasurementRecord>();
const copiedProperties = [
	'box-sizing',
	'width',
	'padding-block-start',
	'padding-block-end',
	'padding-inline-start',
	'padding-inline-end',
	'border-block-start-width',
	'border-block-end-width',
	'border-inline-start-width',
	'border-inline-end-width',
	'font-family',
	'font-feature-settings',
	'font-kerning',
	'font-size',
	'font-stretch',
	'font-style',
	'font-variant',
	'font-variation-settings',
	'font-weight',
	'letter-spacing',
	'line-height',
	'tab-size',
	'text-indent',
	'text-transform',
	'white-space',
	'word-break',
	'word-spacing',
	'overflow-wrap'
] as const;

function createMeasurement(ownerDocument: Document): HTMLTextAreaElement | undefined {
	const parent = ownerDocument.body ?? ownerDocument.documentElement;
	if (!parent) return undefined;
	const element = ownerDocument.createElement('textarea');
	element.disabled = true;
	element.tabIndex = -1;
	element.setAttribute('aria-hidden', 'true');
	element.dataset.zuiTextareaMeasurement = '';
	Object.assign(element.style, {
		contain: 'layout style paint',
		display: 'block',
		height: '0',
		inset: '0 auto auto -10000px',
		maxHeight: 'none',
		minHeight: '0',
		overflow: 'hidden',
		pointerEvents: 'none',
		position: 'fixed',
		resize: 'none',
		visibility: 'hidden',
		zIndex: '-1'
	});
	parent.append(element);
	return element;
}

function acquireMeasurement(ownerDocument: Document): MeasurementLease | undefined {
	let record = measurementRecords.get(ownerDocument);
	if (!record) {
		const element = createMeasurement(ownerDocument);
		if (!element) return undefined;
		record = { element, users: 0 };
		measurementRecords.set(ownerDocument, record);
	}
	record.users += 1;
	let active = true;
	return {
		element: record.element,
		release() {
			if (!active) return;
			active = false;
			record.users -= 1;
			if (record.users > 0) return;
			record.element.remove();
			measurementRecords.delete(ownerDocument);
		}
	};
}

function finitePixels(value: string): number {
	const result = Number.parseFloat(value);
	return Number.isFinite(result) ? result : 0;
}

function normalizeRows(value: number | undefined, fallback: number): number {
	return value ?? fallback;
}

function validateRows(options: TextareaAutosizeActionOptions): void {
	for (const [name, value] of [
		['minRows', options.minRows],
		['maxRows', options.maxRows]
	] as const) {
		if (value !== undefined && (!Number.isInteger(value) || value < 1)) {
			throw new TypeError(`Textarea autosize ${name} must be a positive integer.`);
		}
	}
	if (
		options.minRows !== undefined &&
		options.maxRows !== undefined &&
		options.maxRows < options.minRows
	) {
		throw new TypeError('Textarea autosize maxRows must be greater than or equal to minRows.');
	}
}

class TextareaAutosizeController {
	readonly #element: HTMLTextAreaElement;
	readonly #lease: MeasurementLease;
	readonly #view: Window;
	readonly #originalStyles: Readonly<
		Record<'height' | 'maxHeight' | 'minHeight' | 'overflowY', string>
	>;
	#active = true;
	#frame: number | undefined;
	#lastAppliedHeight: string | undefined;
	#lastAppliedMaxHeight: string | undefined;
	#lastAppliedMinHeight: string | undefined;
	#lastAppliedOverflow: string | undefined;
	#lastHeight = -1;
	#lastWidth = -1;
	#options: TextareaAutosizeActionOptions;
	#resizeObserver: ResizeObserver | undefined;

	constructor(element: HTMLTextAreaElement, options: TextareaAutosizeActionOptions) {
		const view = element.ownerDocument.defaultView;
		if (!view) throw new TypeError('Textarea autosize requires an active owner window.');
		const lease = acquireMeasurement(element.ownerDocument);
		if (!lease) throw new TypeError('Textarea autosize requires an active owner document.');
		this.#element = element;
		this.#lease = lease;
		this.#view = view;
		this.#options = options;
		this.#originalStyles = {
			height: element.style.height,
			maxHeight: element.style.maxHeight,
			minHeight: element.style.minHeight,
			overflowY: element.style.overflowY
		};
		const ResizeObserverConstructor = view.ResizeObserver;
		if (ResizeObserverConstructor) {
			this.#resizeObserver = new ResizeObserverConstructor(() => {
				const width = element.offsetWidth;
				if (width !== this.#lastWidth) this.schedule();
			});
			this.#resizeObserver.observe(element);
		} else {
			view.addEventListener('resize', this.schedule);
		}
		const fonts = element.ownerDocument.fonts;
		fonts?.addEventListener('loadingdone', this.schedule);
		fonts?.addEventListener('loadingerror', this.schedule);
		void fonts?.ready.then(this.schedule);
		this.schedule();
	}

	update(options: TextareaAutosizeActionOptions): void {
		this.#options = options;
		this.schedule();
	}

	schedule = (): void => {
		if (!this.#active || this.#frame !== undefined) return;
		this.#frame = this.#view.requestAnimationFrame(() => {
			this.#frame = undefined;
			this.#measure();
		});
	};

	destroy(): void {
		if (!this.#active) return;
		this.#active = false;
		if (this.#frame !== undefined) this.#view.cancelAnimationFrame(this.#frame);
		this.#resizeObserver?.disconnect();
		this.#view.removeEventListener('resize', this.schedule);
		const fonts = this.#element.ownerDocument.fonts;
		fonts?.removeEventListener('loadingdone', this.schedule);
		fonts?.removeEventListener('loadingerror', this.schedule);
		this.#restoreStyle('height', this.#lastAppliedHeight);
		this.#restoreStyle('maxHeight', this.#lastAppliedMaxHeight);
		this.#restoreStyle('minHeight', this.#lastAppliedMinHeight);
		this.#restoreStyle('overflowY', this.#lastAppliedOverflow);
		this.#lease.release();
	}

	#restoreStyle(
		property: 'height' | 'maxHeight' | 'minHeight' | 'overflowY',
		lastApplied: string | undefined
	): void {
		if (lastApplied !== undefined && this.#element.style[property] === lastApplied) {
			this.#element.style[property] = this.#originalStyles[property];
		}
	}

	#measure(): void {
		const element = this.#element;
		if (!element.isConnected || element.offsetWidth === 0) return;
		const measurement = this.#lease.element;
		const computed = this.#view.getComputedStyle(element);
		for (const property of copiedProperties) {
			measurement.style.setProperty(property, computed.getPropertyValue(property));
		}
		measurement.style.width = `${element.offsetWidth}px`;
		measurement.style.height = '0';
		measurement.style.minHeight = '0';
		measurement.style.maxHeight = 'none';
		measurement.style.overflow = 'hidden';

		measurement.value = 'x';
		const oneRowScrollHeight = measurement.scrollHeight;
		measurement.value = 'x\nx';
		const measuredLineHeight = measurement.scrollHeight - oneRowScrollHeight;
		const lineHeight = Math.max(1, measuredLineHeight || finitePixels(computed.lineHeight));
		const minRows = normalizeRows(this.#options.minRows, Math.max(1, element.rows));
		const maxRows =
			this.#options.maxRows === undefined
				? undefined
				: Math.max(minRows, normalizeRows(this.#options.maxRows, minRows));
		const minimumScrollHeight = oneRowScrollHeight + lineHeight * (minRows - 1);
		const maximumScrollHeight =
			maxRows === undefined
				? Number.POSITIVE_INFINITY
				: oneRowScrollHeight + lineHeight * (maxRows - 1);
		const value = this.#options.value || element.placeholder || ' ';
		measurement.value = value.endsWith('\n') ? `${value} ` : value;
		const contentScrollHeight = measurement.scrollHeight;
		const scrollHeight = Math.min(
			maximumScrollHeight,
			Math.max(minimumScrollHeight, contentScrollHeight)
		);
		const padding =
			finitePixels(computed.paddingBlockStart) + finitePixels(computed.paddingBlockEnd);
		const border =
			finitePixels(computed.borderBlockStartWidth) + finitePixels(computed.borderBlockEndWidth);
		const height = Math.max(
			0,
			computed.boxSizing === 'border-box' ? scrollHeight + border : scrollHeight - padding
		);
		const heightStyle = `${height}px`;
		const overflowStyle = contentScrollHeight > maximumScrollHeight ? 'auto' : 'hidden';
		this.#lastWidth = element.offsetWidth;
		element.style.minHeight = '0px';
		element.style.maxHeight = 'none';
		element.style.height = heightStyle;
		element.style.overflowY = overflowStyle;
		this.#lastAppliedHeight = heightStyle;
		this.#lastAppliedMaxHeight = 'none';
		this.#lastAppliedMinHeight = '0px';
		this.#lastAppliedOverflow = overflowStyle;
		const renderedHeight = element.getBoundingClientRect().height;
		if (Math.abs(renderedHeight - this.#lastHeight) < 0.5) return;
		this.#lastHeight = renderedHeight;
		this.#options.onResize?.(renderedHeight);
	}
}

export function textareaAutosize(
	element: HTMLTextAreaElement,
	initialOptions: TextareaAutosizeActionOptions
): { destroy(): void; update(options: TextareaAutosizeActionOptions): void } {
	let controller: TextareaAutosizeController | undefined;
	const apply = (options: TextareaAutosizeActionOptions) => {
		if (!options.enabled) {
			controller?.destroy();
			controller = undefined;
			return;
		}
		validateRows(options);
		if (!controller) {
			const ownerDocument = element.ownerDocument;
			if (!ownerDocument.defaultView || !(ownerDocument.body ?? ownerDocument.documentElement))
				return;
			controller = new TextareaAutosizeController(element, options);
			return;
		}
		controller.update(options);
	};
	apply(initialOptions);
	return {
		destroy() {
			controller?.destroy();
		},
		update: apply
	};
}
