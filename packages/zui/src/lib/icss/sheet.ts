export interface StyleSheetEntry {
	readonly className: string;
	readonly cssText: string;
	readonly rules: readonly string[];
}

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

function readHydratedClassNames(root: Document | ShadowRoot): ReadonlySet<string> {
	const names = new Set<string>();
	for (const element of root.querySelectorAll<HTMLStyleElement>('style[data-icss]')) {
		for (const className of (element.dataset.icss ?? '').split(/\s+/)) {
			if (className.length > 0) names.add(className);
		}
	}
	return names;
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
	readonly hydratedClassNames: ReadonlySet<string>;
	readonly #document: Document;
	readonly #insertionPoint?: Node;
	readonly #nonce?: string;
	readonly #root: Document | ShadowRoot;
	readonly #speedy: boolean;
	readonly #entries = new Map<string, StyleSheetEntry>();
	#classNames: string[] = [];
	#style?: HTMLStyleElement;

	constructor(options: BrowserStyleSheetOptions = {}) {
		const root = options.root ?? document;
		this.#root = root;
		this.#document = isDocument(root) ? root : root.ownerDocument;
		this.#insertionPoint = options.insertionPoint;
		this.#nonce = options.nonce ?? discoverNonce(root);
		this.#speedy = options.speedy ?? true;
		this.hydratedClassNames = readHydratedClassNames(root);
	}

	clear(): void {
		this.#style?.remove();
		this.#style = undefined;
		this.#classNames = [];
		this.#entries.clear();
	}

	insert(entry: StyleSheetEntry): void {
		this.#entries.set(entry.className, entry);
		this.#insertEntry(entry);
	}

	remove(className: string): void {
		if (!this.#entries.delete(className)) return;
		this.#style?.remove();
		this.#style = undefined;
		this.#classNames = [];
		for (const entry of this.#entries.values()) this.#insertEntry(entry);
	}

	#insertEntry(entry: StyleSheetEntry): void {
		const style = this.#style ?? this.#createStyle();
		if (this.#speedy && style.sheet !== null) {
			for (const rule of entry.rules) {
				style.sheet.insertRule(rule, style.sheet.cssRules.length);
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
		return style;
	}
}
