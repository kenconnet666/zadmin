import type { CollectionItem } from './collection.svelte.js';

export interface TypeaheadOptions {
	readonly locale?: string | (() => string);
	readonly now?: () => number;
	readonly timeout?: number;
}

export class Typeahead<TKey extends number | string> {
	#collator: Intl.Collator | undefined;
	#collatorLocale: string | undefined;
	readonly #locale: () => string | undefined;
	readonly #now: () => number;
	readonly #timeout: number;
	#buffer = '';
	#lastInput = Number.NEGATIVE_INFINITY;

	constructor(options: TypeaheadOptions = {}) {
		this.#locale = typeof options.locale === 'function' ? options.locale : () => options.locale;
		this.#now = options.now ?? Date.now;
		this.#timeout = options.timeout ?? 500;
		if (!Number.isFinite(this.#timeout) || this.#timeout <= 0) {
			throw new TypeError('Typeahead timeout must be positive.');
		}
	}

	get buffer(): string {
		return this.#buffer;
	}

	clear(): void {
		this.#buffer = '';
		this.#lastInput = Number.NEGATIVE_INFINITY;
	}

	search(
		input: string,
		items: readonly CollectionItem<TKey>[],
		currentKey?: TKey
	): TKey | undefined {
		if (this.#refreshCollator()) this.clear();
		if ([...input].length !== 1 || /\s/u.test(input)) return undefined;
		const now = this.#now();
		this.#buffer = now - this.#lastInput > this.#timeout ? input : this.#buffer + input;
		this.#lastInput = now;
		const repeated = [...this.#buffer].every((character) =>
			this.#equal(character, this.#buffer[0] ?? '')
		);
		const query = repeated ? (this.#buffer[0] ?? '') : this.#buffer;
		const enabled = items.filter(({ disabled, textValue }) => !disabled && textValue);
		if (enabled.length === 0) return undefined;
		const current = enabled.findIndex(({ key }) => Object.is(key, currentKey));
		for (let offset = 1; offset <= enabled.length; offset += 1) {
			const item = enabled[(current + offset + enabled.length) % enabled.length];
			if (item?.textValue && this.#startsWith(item.textValue, query)) return item.key;
		}
		return undefined;
	}

	#equal(left: string, right: string): boolean {
		return this.#collator!.compare(left, right) === 0;
	}

	#startsWith(value: string, query: string): boolean {
		return this.#equal(value.slice(0, query.length), query);
	}

	#refreshCollator(): boolean {
		const locale = this.#locale();
		const changed = this.#collator !== undefined && locale !== this.#collatorLocale;
		if (!this.#collator || changed) {
			this.#collator = new Intl.Collator(locale, { sensitivity: 'base', usage: 'search' });
			this.#collatorLocale = locale;
		}
		return changed;
	}
}
