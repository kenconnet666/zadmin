import type { FormControlDraftState } from './form-value-adapter.svelte.js';

interface ValueControl {
	readonly element: () => HTMLElement | null;
	readonly draftState?: () => FormControlDraftState;
	readonly resetDraft?: () => void;
	draft: FormControlDraftState;
}
const pristine: FormControlDraftState = Object.freeze({ valid: true, dirty: false });

/** One registration owns both canonical-value participation and local draft feedback. */
export class FormValueControls {
	readonly #owners = new Map<string, Map<symbol, ValueControl>>();
	register(
		instanceId: string,
		element: () => HTMLElement | null,
		draftState?: () => FormControlDraftState,
		resetDraft?: () => void
	): () => void {
		const token = Symbol();
		const owners = this.#owners.get(instanceId) ?? new Map<symbol, ValueControl>();
		owners.set(token, { element, draftState, resetDraft, draft: pristine });
		this.#owners.set(instanceId, owners);
		return () => {
			owners.delete(token);
			if (owners.size === 0 && this.#owners.get(instanceId) === owners)
				this.#owners.delete(instanceId);
		};
	}
	count(instanceId: string): number {
		return this.#owners.get(instanceId)?.size ?? 0;
	}
	resetDraft(instanceId: string): void {
		for (const owner of this.#owners.get(instanceId)?.values() ?? []) owner.resetDraft?.();
	}
	refresh(): boolean {
		let changed = false;
		for (const owners of this.#owners.values())
			for (const owner of owners.values()) {
				if (!owner.draftState) continue;
				const element = owner.element();
				const input = owner.draftState();
				const controls = element?.querySelectorAll('input:not([type="hidden"]), select, textarea');
				// :disabled includes native fieldset inheritance and its first-legend exception.
				const disabled =
					element?.matches(':disabled, [data-disabled="true"]') ||
					(controls &&
						controls.length > 0 &&
						[...controls].every((control) => control.matches(':disabled')));
				const next = {
					valid: !element?.isConnected || !!disabled || input.valid,
					dirty: input.dirty,
					message: input.message
				};
				if (
					next.valid === owner.draft.valid &&
					next.dirty === owner.draft.dirty &&
					next.message === owner.draft.message
				)
					continue;
				owner.draft = Object.freeze(next);
				changed = true;
			}
		return changed;
	}
	drafts(instanceId: string): readonly FormControlDraftState[] {
		return [...(this.#owners.get(instanceId)?.values() ?? [])].map((owner) => owner.draft);
	}
	clear(): void {
		this.#owners.clear();
	}
}
