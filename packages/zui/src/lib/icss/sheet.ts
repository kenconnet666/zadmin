export interface StyleSheetEntry {
	readonly className: string;
	readonly cssText: string;
	readonly rules: readonly string[];
}

export interface IcssStyleSheet {
	readonly hydratedClassNames: ReadonlySet<string>;
	clear(): void;
	insert(entry: StyleSheetEntry): void;
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

export class BrowserStyleSheet implements IcssStyleSheet {
	readonly hydratedClassNames: ReadonlySet<string>;
	readonly #document: Document;
	readonly #insertionPoint?: Node;
	readonly #nonce?: string;
	readonly #root: Document | ShadowRoot;
	readonly #speedy: boolean;
	#classNames: string[] = [];
	#style?: HTMLStyleElement;

	constructor(options: BrowserStyleSheetOptions = {}) {
		const root = options.root ?? document;
		this.#root = root;
		this.#document = isDocument(root) ? root : root.ownerDocument;
		this.#insertionPoint = options.insertionPoint;
		this.#nonce = options.nonce;
		this.#speedy = options.speedy ?? true;
		this.hydratedClassNames = readHydratedClassNames(root);
	}

	clear(): void {
		this.#style?.remove();
		this.#style = undefined;
		this.#classNames = [];
	}

	insert(entry: StyleSheetEntry): void {
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
