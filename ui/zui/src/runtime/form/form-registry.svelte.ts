import { SvelteMap } from 'svelte/reactivity';

export interface FormFieldState {
	readonly dirty: boolean;
	readonly errors: readonly string[];
	readonly touched: boolean;
	readonly validating: boolean;
}

const INITIAL_STATE = Object.freeze({
	dirty: false,
	errors: Object.freeze([]),
	touched: false,
	validating: false
}) satisfies FormFieldState;

export class FormRegistry {
	// Control lookup is imperative metadata; form state below is the reactive surface.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly #controls = new Map<string, () => HTMLElement | null>();
	readonly #states = new SvelteMap<string, FormFieldState>();

	register(name: string, control: () => HTMLElement | null): () => void {
		if (this.#controls.has(name)) throw new Error(`Duplicate ZFormField name "${name}".`);
		this.#controls.set(name, control);
		this.#states.set(name, INITIAL_STATE);
		return () => {
			this.#controls.delete(name);
			this.#states.delete(name);
		};
	}

	state(name: string): FormFieldState {
		return this.#states.get(name) ?? INITIAL_STATE;
	}

	markDirty(name: string): void {
		this.#patch(name, { dirty: true });
	}

	markTouched(name: string): void {
		this.#patch(name, { touched: true });
	}

	markAllTouched(): void {
		for (const name of this.#states.keys()) this.#patch(name, { touched: true });
	}

	setValidating(validating: boolean): void {
		for (const name of this.#states.keys()) this.#patch(name, { validating });
	}

	setErrors(errors: ReadonlyMap<string, readonly string[]>): void {
		for (const name of this.#states.keys()) {
			this.#patch(name, {
				errors: Object.freeze([...(errors.get(name) ?? [])]),
				validating: false
			});
		}
	}

	reset(): void {
		for (const name of this.#states.keys()) this.#states.set(name, INITIAL_STATE);
	}

	focusFirstInvalid(): boolean {
		for (const [name, state] of this.#states) {
			if (state.errors.length === 0) continue;
			const root = this.#controls.get(name)?.();
			const candidate = root?.querySelector<HTMLElement>(
				'input:not([type="hidden"]), textarea, select, button, [tabindex]:not([tabindex="-1"])'
			);
			(candidate ?? root)?.focus({ preventScroll: true });
			return true;
		}
		return false;
	}

	#patch(name: string, patch: Partial<FormFieldState>): void {
		const current = this.#states.get(name);
		if (current) this.#states.set(name, Object.freeze({ ...current, ...patch }));
	}
}
