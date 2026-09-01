<script module lang="ts">
	export interface FormResetSignalProps {
		readonly association?: string | null;
		readonly control?: (HTMLElement & { readonly form: HTMLFormElement | null }) | null;
		readonly onReset: () => void;
		readonly owner?: HTMLFormElement | null;
	}
</script>

<script lang="ts">
	import { portal } from '../layer/portal.js';
	import { formElementReset } from './form-control.svelte.js';

	interface ResetSignalActionOptions {
		readonly owner: HTMLFormElement;
		readonly reset: () => void;
	}

	let { association, control = null, onReset, owner = null }: FormResetSignalProps = $props();
	let resetOwner = $state<HTMLFormElement | null>(null);

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
		_control: HTMLInputElement,
		options: ResetSignalActionOptions
	): { destroy(): void; update(options: ResetSignalActionOptions): void } {
		// The component has already resolved the exact owner. Listen to that form once instead of
		// asking the generic control action to rediscover it across document/root/form targets.
		let current = options;
		let action = formElementReset(current.owner, () => current.reset());
		return {
			destroy() {
				action.destroy();
			},
			update(next) {
				const ownerChanged = current.owner !== next.owner;
				current = next;
				if (ownerChanged) {
					action.destroy();
					action = formElementReset(current.owner, () => current.reset());
				} else {
					action.update(() => current.reset());
				}
			}
		};
	}
</script>

{#if resetOwner}
	<input
		aria-hidden="true"
		tabindex="-1"
		type="hidden"
		hidden
		disabled
		data-zui-form-reset-signal=""
		use:portal={{ target: resetOwner }}
		use:signalFormReset={{ owner: resetOwner, reset: onReset }}
	/>
{/if}
