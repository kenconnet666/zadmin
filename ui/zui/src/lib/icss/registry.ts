import { hashString } from './hash.js';
import type { IcssClassName, StyleProgram } from './types.js';

import { canonicalizeStyleProgram, serializeStyleProgram } from './serialize.js';
import { MemoryStyleSheet, type IcssStyleSheet } from './sheet.js';

export interface RegisteredStyle {
	readonly canonical: string;
	readonly className: IcssClassName;
	readonly cssText: string;
	readonly rules: readonly string[];
}

export interface StyleRegistryOptions {
	readonly hash?: (canonical: string) => string;
	readonly maxVariantsPerOwner?: number;
	readonly sheet?: IcssStyleSheet;
}

export interface StyleTagOptions {
	readonly nonce?: string;
}

export interface StyleRegistryMetrics {
	readonly classes: number;
	readonly hydrated: number;
	readonly owners: number;
	readonly recipes: number;
	readonly rules: number;
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
	readonly #classesByOwner = new Map<string, Set<string>>();
	readonly #hash: (canonical: string) => string;
	readonly #maxVariantsPerOwner: number;
	readonly #owners = new Map<string, Set<string>>();
	readonly #persistent = new Set<string>();
	readonly #sheet: IcssStyleSheet;

	constructor(options: StyleRegistryOptions = {}) {
		this.#hash = options.hash ?? hashString;
		this.#maxVariantsPerOwner = options.maxVariantsPerOwner ?? 128;
		if (!Number.isInteger(this.#maxVariantsPerOwner) || this.#maxVariantsPerOwner < 1) {
			throw new TypeError('maxVariantsPerOwner must be a positive integer.');
		}
		this.#sheet = options.sheet ?? new MemoryStyleSheet();
	}

	get size(): number {
		return this.#byCanonical.size;
	}

	get metrics(): StyleRegistryMetrics {
		const recipes = new Set<string>();
		for (const owner of this.#classesByOwner.keys()) {
			const match = /^(recipe|slot-recipe):([^:]+)/u.exec(owner);
			if (match !== null) recipes.add(`${match[1]}:${match[2]}`);
		}
		return Object.freeze({
			classes: this.#byCanonical.size,
			hydrated: this.#sheet.hydratedClassNames.size,
			owners: this.#classesByOwner.size,
			recipes: recipes.size,
			rules: [...this.#byCanonical.values()].reduce((total, entry) => total + entry.rules.length, 0)
		});
	}

	clear(): void {
		this.#byCanonical.clear();
		this.#byClassName.clear();
		this.#classesByOwner.clear();
		this.#owners.clear();
		this.#persistent.clear();
		this.#sheet.clear();
	}

	cssText(): string {
		return [...this.#byCanonical.values()].map((entry) => entry.cssText).join('');
	}

	htmlStyleText(): string {
		return escapeStyleText(this.cssText());
	}

	ensure(program: StyleProgram, owner?: string): RegisteredStyle {
		const canonical = canonicalizeStyleProgram(program);
		if (canonical.length === 0) return EMPTY_STYLE;
		const existing = this.#byCanonical.get(canonical);
		if (existing !== undefined) {
			this.#retain(existing.className, owner);
			return existing;
		}

		const className = `c-${this.#hash(canonical)}` as IcssClassName;
		const collision = this.#byClassName.get(className);
		if (collision !== undefined && collision !== canonical) {
			throw new Error(`ICSS hash collision for class "${className}".`);
		}

		const serialized = serializeStyleProgram(program, className);
		const entry: RegisteredStyle = { canonical, className, ...serialized };
		this.#retain(className, owner);
		this.#byCanonical.set(canonical, entry);
		this.#byClassName.set(className, canonical);
		this.#sheet.insert(entry);
		return entry;
	}

	releaseOwner(owner: string): void {
		const classes = this.#classesByOwner.get(owner);
		if (classes === undefined) return;
		this.#classesByOwner.delete(owner);
		for (const className of classes) {
			const owners = this.#owners.get(className);
			if (
				owners === undefined ||
				!owners.delete(owner) ||
				owners.size > 0 ||
				this.#persistent.has(className)
			) {
				continue;
			}
			this.#owners.delete(className);
			const canonical = this.#byClassName.get(className);
			if (canonical !== undefined) this.#byCanonical.delete(canonical);
			this.#byClassName.delete(className);
			this.#sheet.remove(className);
		}
	}

	releaseOwnerPrefix(prefix: string): void {
		for (const owner of [...this.#classesByOwner.keys()]) {
			if (owner.startsWith(prefix)) this.releaseOwner(owner);
		}
	}

	styleTag(options: StyleTagOptions = {}): string {
		const entries = [...this.#byCanonical.values()];
		if (entries.length === 0) return '';
		const classes = entries.map((entry) => entry.className).join(' ');
		const nonce = options.nonce === undefined ? '' : ` nonce="${escapeAttribute(options.nonce)}"`;
		return `<style data-icss="${classes}"${nonce}>${this.htmlStyleText()}</style>`;
	}

	#retain(className: string, owner: string | undefined): void {
		if (owner === undefined) {
			this.#persistent.add(className);
			return;
		}
		let classes = this.#classesByOwner.get(owner);
		if (classes === undefined) {
			classes = new Set();
			this.#classesByOwner.set(owner, classes);
		}
		if (!classes.has(className) && classes.size >= this.#maxVariantsPerOwner) {
			throw new Error(
				`ICSS owner "${owner}" exceeded ${this.#maxVariantsPerOwner} structural variants.`
			);
		}
		classes.add(className);
		let owners = this.#owners.get(className);
		if (owners === undefined) {
			owners = new Set();
			this.#owners.set(className, owners);
		}
		owners.add(owner);
	}
}

export function createServerStyleRegistry(
	options: Omit<StyleRegistryOptions, 'sheet'> = {}
): StyleRegistry {
	return new StyleRegistry({ ...options, sheet: new MemoryStyleSheet() });
}
