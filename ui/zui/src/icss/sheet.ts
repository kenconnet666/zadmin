export interface StyleSheetEntry {
	readonly className: string;
	readonly cssText: string;
	readonly rules: readonly string[];
}

export const ICSS_LAYER_PRELUDE = '@layer zui.components,zui.utilities;';

export interface IcssStyleSheet {
	readonly hydratedClassNames: ReadonlySet<string>;
	clear(): void;
	insert(entry: StyleSheetEntry): void;
	remove(className: string): void;
}

export class MemoryStyleSheet implements IcssStyleSheet {
	readonly entries: StyleSheetEntry[] = [];
	readonly hydratedClassNames: ReadonlySet<string> = new Set();

	clear(): void {
		this.entries.length = 0;
	}

	insert(entry: StyleSheetEntry): void {
		this.entries.push(entry);
	}

	remove(className: string): void {
		const index = this.entries.findIndex((entry) => entry.className === className);
		if (index >= 0) this.entries.splice(index, 1);
	}
}

export interface BrowserStyleSheetOptions {
	readonly insertionPoint?: Node;
	readonly nonce?: string;
	readonly root?: Document | ShadowRoot;
	readonly speedy?: boolean;
}

function readHydratedStyles(root: Document | ShadowRoot): {
	readonly classNames: Set<string>;
	readonly styles: HTMLStyleElement[];
} {
	const names = new Set<string>();
	const styles = [...root.querySelectorAll<HTMLStyleElement>('style[data-icss]')];
	for (const element of styles) {
		for (const className of (element.dataset.icss ?? '').split(/\s+/)) {
			if (className.length > 0) names.add(className);
		}
	}
	return { classNames: names, styles };
}

function isDocument(root: Document | ShadowRoot): root is Document {
	return root.nodeType === 9;
}

function discoverNonce(root: Document | ShadowRoot): string | undefined {
	const style = root.querySelector<HTMLStyleElement>('style[data-icss][nonce]');
	if (style?.nonce) return style.nonce;
	const meta = root.querySelector<HTMLMetaElement>('meta[name="icss-nonce"]');
	return meta?.content || undefined;
}

export class BrowserStyleSheet implements IcssStyleSheet {
	readonly #hydratedClassNames: Set<string>;
	readonly #document: Document;
	readonly #insertionPoint?: Node;
	readonly #nonce?: string;
	readonly #root: Document | ShadowRoot;
	readonly #speedy: boolean;
	readonly #entries = new Map<string, StyleSheetEntry>();
	#hydratedStyles: HTMLStyleElement[];
	#classNames: string[] = [];
	#style?: HTMLStyleElement;

	constructor(options: BrowserStyleSheetOptions = {}) {
		const root = options.root ?? document;
		const hydrated = readHydratedStyles(root);
		this.#root = root;
		this.#document = isDocument(root) ? root : root.ownerDocument;
		this.#insertionPoint = options.insertionPoint;
		this.#nonce = options.nonce ?? discoverNonce(root);
		this.#speedy = options.speedy ?? true;
		this.#hydratedClassNames = hydrated.classNames;
		this.#hydratedStyles = hydrated.styles;
	}

	get hydratedClassNames(): ReadonlySet<string> {
		return this.#hydratedClassNames;
	}

	clear(): void {
		this.#style?.remove();
		this.#style = undefined;
		this.#classNames = [];
		this.#entries.clear();
	}

	insert(entry: StyleSheetEntry): void {
		this.#entries.set(entry.className, entry);
		if (!this.#hydratedClassNames.has(entry.className)) this.#insertEntry(entry);
	}

	remove(className: string): void {
		if (!this.#entries.delete(className)) return;
		if (this.#hydratedClassNames.has(className)) {
			for (const style of this.#hydratedStyles) style.remove();
			this.#hydratedStyles = [];
			this.#hydratedClassNames.clear();
		}
		this.#style?.remove();
		this.#style = undefined;
		this.#classNames = [];
		for (const entry of this.#entries.values()) {
			if (!this.#hydratedClassNames.has(entry.className)) this.#insertEntry(entry);
		}
	}

	#insertEntry(entry: StyleSheetEntry): void {
		const style = this.#style ?? this.#createStyle();
		if (this.#speedy && style.sheet !== null) {
			for (const rule of entry.rules) {
				try {
					style.sheet.insertRule(rule, style.sheet.cssRules.length);
				} catch (error) {
					// CSS text parsing ignores selectors unsupported by the current engine. CSSOM
					// insertRule throws instead, so speedy mode must preserve normal browser semantics.
					if (!(error instanceof DOMException) || error.name !== 'SyntaxError') throw error;
				}
			}
		} else {
			style.append(this.#document.createTextNode(entry.cssText));
		}
		this.#classNames.push(entry.className);
		style.dataset.icss = this.#classNames.join(' ');
	}

	#createStyle(): HTMLStyleElement {
		const style = this.#document.createElement('style');
		style.dataset.icss = '';
		if (this.#nonce !== undefined) style.nonce = this.#nonce;

		if (
			this.#insertionPoint?.parentNode !== null &&
			this.#insertionPoint?.parentNode !== undefined
		) {
			this.#insertionPoint.parentNode.insertBefore(style, this.#insertionPoint.nextSibling);
		} else if (isDocument(this.#root)) {
			this.#root.head.append(style);
		} else {
			this.#root.append(style);
		}
		this.#style = style;
		if (this.#speedy && style.sheet !== null) {
			style.sheet.insertRule(ICSS_LAYER_PRELUDE, 0);
		} else {
			style.append(this.#document.createTextNode(ICSS_LAYER_PRELUDE));
		}
		return style;
	}
}
