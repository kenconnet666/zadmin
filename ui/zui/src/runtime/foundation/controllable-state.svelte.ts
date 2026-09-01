export interface ControllableStateOptions<TValue> {
	/** Initial value used only while the public value has never become concrete. */
	readonly defaultValue: () => TValue;
	/** User-originated notification. External synchronization and reset do not call it. */
	readonly onChange?: () => ((value: TValue) => void) | undefined;
	/** Reads the Svelte prop/local binding value. */
	readonly read: () => TValue | undefined;
	/**
	 * Lets a later external `undefined` clear an established value. This opt-in is
	 * type-available only when `TValue` itself includes `undefined`.
	 */
	readonly undefinedIsValue?: undefined extends TValue ? boolean : never;
	/** Always writes through so `$bindable` can synchronize with its consumer. */
	readonly write: (value: TValue) => void;
}

/**
 * Svelte-native write-through state with a type-safe optional one-time fallback.
 *
 * By default `undefined` keeps selecting `defaultValue`, preserving the original
 * contract for non-nullable states. With `undefinedIsValue`, it is ambiguous only
 * before the first concrete value or write: after a consumer value, user write, or
 * reset, the fallback is permanently relinquished and a later external `undefined`
 * is a real empty value. `null` is always concrete and is therefore the preferred
 * explicit empty value for newly designed nullable component APIs.
 *
 * This deliberately does not imitate React's controlled/uncontrolled detection:
 * Svelte does not expose whether a `$bindable` prop is actually bound. Callers that
 * bind a component with a non-undefined fallback must initialize the binding to a
 * concrete value (use `null` for empty) to avoid the documented initial ambiguity.
 */
export class ControllableState<TValue> {
	readonly #options: ControllableStateOptions<TValue>;
	#fallback: TValue;
	#fallbackActive = true;
	readonly #undefinedIsValue: boolean;

	constructor(options: ControllableStateOptions<TValue>) {
		this.#options = options;
		this.#fallback = $state(options.defaultValue());
		this.#undefinedIsValue = options.undefinedIsValue === true;
	}

	get current(): TValue {
		const value = this.#options.read();
		if (value !== undefined) {
			if (this.#undefinedIsValue) this.#fallbackActive = false;
			return value;
		}
		return this.#undefinedIsValue && !this.#fallbackActive ? (value as TValue) : this.#fallback;
	}

	setFromUser(value: TValue): void {
		if (Object.is(this.current, value)) return;
		this.#fallback = value;
		if (this.#undefinedIsValue) this.#fallbackActive = false;
		this.#options.write(value);
		this.#options.onChange?.()?.(value);
	}

	reset(): void {
		const value = this.#options.defaultValue();
		this.#fallback = value;
		if (this.#undefinedIsValue) this.#fallbackActive = false;
		this.#options.write(value);
	}
}
