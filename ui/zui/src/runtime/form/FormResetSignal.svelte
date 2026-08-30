<script module lang="ts">
	export interface FormResetSignalProps {
		readonly association?: string | null;
		readonly control?: (HTMLElement & { readonly form: HTMLFormElement | null }) | null;
		readonly onReset: () => void;
		readonly owner?: HTMLFormElement | null;
	}
</script>

<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	import { portal } from '../layer/portal.js';
	import { formReset } from './form-control.svelte.js';

	interface ResetSignalActionOptions {
		readonly owner: HTMLFormElement;
	}

	let { association, control = null, onReset, owner = null }: FormResetSignalProps = $props();
	let resetOwner = $state<HTMLFormElement | null>(null);
	const resetEventAttributes = $derived({ onzuireset: onReset } as HTMLButtonAttributes & {
		onzuireset: () => void;
	});

	$effect(() => {
		const directOwner = owner;
		const associatedControl = control;
		const associationKey = association;
		let active = true;
		let observer: MutationObserver | undefined;
		const updateOwner = () => {
			if (!active || associationKey !== association) return;
			resetOwner = directOwner ?? associatedControl?.form ?? null;
		};
		if (associationKey === undefined) updateOwner();
		else queueMicrotask(updateOwner);
		if (typeof associationKey === 'string' && associationKey.length > 0 && associatedControl) {
			const MutationObserverConstructor =
				associatedControl.ownerDocument.defaultView?.MutationObserver;
			if (MutationObserverConstructor) {
				observer = new MutationObserverConstructor(() => queueMicrotask(updateOwner));
				observer.observe(associatedControl.ownerDocument, {
					attributeFilter: ['id'],
					attributes: true,
					childList: true,
					subtree: true
				});
			}
		}
		return () => {
			active = false;
			observer?.disconnect();
		};
	});

	function signalFormReset(
		control: HTMLButtonElement,
		options: ResetSignalActionOptions
	): { destroy(): void; update(options: ResetSignalActionOptions): void } {
		let current = options;
		const forwardReset = () => {
			if (control.form === current.owner) control.dispatchEvent(new Event('zuireset'));
		};
		const action = formReset(control, forwardReset);
		return {
			destroy() {
				action.destroy();
			},
			update(next) {
				current = next;
				action.update(forwardReset);
			}
		};
	}
</script>

{#if resetOwner}
	<button
		{...resetEventAttributes}
		aria-hidden="true"
		tabindex="-1"
		type="button"
		hidden
		data-zui-form-reset-signal=""
		use:portal={{ target: resetOwner }}
		use:signalFormReset={{ owner: resetOwner }}
	></button>
{/if}
