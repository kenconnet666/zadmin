import { hashString } from './hash.js';
import { canonicalizeStyleProgram, serializeStyleProgram } from './serialize.js';
import { MemoryStyleSheet, type IcssStyleSheet } from './sheet.js';
import type { IcssClassName, StyleProgram } from './types.js';

export interface RegisteredStyle {
	readonly canonical: string;
	readonly className: IcssClassName;
	readonly cssText: string;
	readonly rules: readonly string[];
}

export interface StyleRegistryOptions {
	readonly hash?: (canonical: string) => string;
	readonly sheet?: IcssStyleSheet;
}

export interface StyleTagOptions {
	readonly nonce?: string;
}

const EMPTY_STYLE: RegisteredStyle = {
	canonical: '',
	className: '' as IcssClassName,
	cssText: '',
	rules: []
};

function escapeAttribute(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function escapeStyleText(value: string): string {
	return value.replace(/<\/style/giu, '<\\/style');
}

export class StyleRegistry {
	readonly #byCanonical = new Map<string, RegisteredStyle>();
	readonly #byClassName = new Map<string, string>();
	readonly #hash: (canonical: string) => string;
	readonly #sheet: IcssStyleSheet;

	constructor(options: StyleRegistryOptions = {}) {
		this.#hash = options.hash ?? hashString;
		this.#sheet = options.sheet ?? new MemoryStyleSheet();
	}

	get size(): number {
		return this.#byCanonical.size;
	}

	clear(): void {
		this.#byCanonical.clear();
		this.#byClassName.clear();
		this.#sheet.clear();
	}

	cssText(): string {
		return [...this.#byCanonical.values()].map((entry) => entry.cssText).join('');
	}

	ensure(program: StyleProgram): RegisteredStyle {
		const canonical = canonicalizeStyleProgram(program);
		if (canonical.length === 0) return EMPTY_STYLE;
		const existing = this.#byCanonical.get(canonical);
		if (existing !== undefined) return existing;

		const className = `c-${this.#hash(canonical)}` as IcssClassName;
		const collision = this.#byClassName.get(className);
		if (collision !== undefined && collision !== canonical) {
			throw new Error(`ICSS hash collision for class "${className}".`);
		}

		const serialized = serializeStyleProgram(program, className);
		const entry: RegisteredStyle = { canonical, className, ...serialized };
		this.#byCanonical.set(canonical, entry);
		this.#byClassName.set(className, canonical);
		if (!this.#sheet.hydratedClassNames.has(className)) this.#sheet.insert(entry);
		return entry;
	}

	styleTag(options: StyleTagOptions = {}): string {
		const entries = [...this.#byCanonical.values()];
		if (entries.length === 0) return '';
		const classes = entries.map((entry) => entry.className).join(' ');
		const nonce = options.nonce === undefined ? '' : ` nonce="${escapeAttribute(options.nonce)}"`;
		return `<style data-icss="${classes}"${nonce}>${escapeStyleText(this.cssText())}</style>`;
	}
}

export function createServerStyleRegistry(
	options: Omit<StyleRegistryOptions, 'sheet'> = {}
): StyleRegistry {
	return new StyleRegistry({ ...options, sheet: new MemoryStyleSheet() });
}
