/** Native values remain in the DOM; this stores only immutable comparison baselines. */
export class NativeFormBaseline {
	readonly #entries = new Map<string, readonly FormDataEntryValue[]>();

	capture(key: string, name: string, data: FormData): void {
		if (!this.#entries.has(key)) this.#entries.set(key, Object.freeze(data.getAll(name)));
	}

	isDirty(key: string, name: string, data: FormData): boolean {
		const baseline = this.#entries.get(key);
		if (!baseline) return false;
		const current = data.getAll(name);
		return (
			current.length !== baseline.length ||
			current.some((value, index) => !sameEntry(value, baseline[index]!))
		);
	}

	forget(key: string): void {
		this.#entries.delete(key);
	}
	clear(): void {
		this.#entries.clear();
	}
}

function sameEntry(left: FormDataEntryValue, right: FormDataEntryValue): boolean {
	if (Object.is(left, right)) return true;
	// Empty file inputs synthesize a new empty File on every FormData construction.
	// Selected File identity is retained: equal metadata must not hide a different file.
	return (
		typeof left !== 'string' &&
		typeof right !== 'string' &&
		left.name === '' &&
		right.name === '' &&
		left.size === 0 &&
		right.size === 0 &&
		left.type === right.type &&
		(left.type === '' || left.type === 'application/octet-stream')
	);
}
