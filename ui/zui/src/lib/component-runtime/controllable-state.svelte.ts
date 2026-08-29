export interface ControllableStateOptions<TValue> {
	readonly defaultValue: () => TValue;
	readonly onChange?: () => ((value: TValue) => void) | undefined;
	readonly read: () => TValue | undefined;
	readonly write: (value: TValue) => void;
}

export class ControllableState<TValue> {
	readonly #options: ControllableStateOptions<TValue>;
	#fallback: TValue;

	constructor(options: ControllableStateOptions<TValue>) {
		this.#options = options;
		this.#fallback = $state(options.defaultValue());
	}

	get current(): TValue {
		return this.#options.read() ?? this.#fallback;
	}

	setFromUser(value: TValue): void {
		if (Object.is(this.current, value)) return;
		this.#fallback = value;
		this.#options.write(value);
		this.#options.onChange?.()?.(value);
	}

	reset(): void {
		const value = this.#options.defaultValue();
		this.#fallback = value;
		this.#options.write(value);
	}
}
