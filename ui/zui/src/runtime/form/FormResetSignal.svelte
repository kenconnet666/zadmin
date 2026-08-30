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
	import { listenForFormReset } from './form-control.svelte.js';

	const armedValue = 'zui-reset-armed';
	const resetValue = 'zui-reset-fired';
	let { association, control = null, onReset, owner = null }: FormResetSignalProps = $props();
	let ref = $state<HTMLInputElement | null>(null);
	let marker = $state(armedValue);
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

	$effect(() => {
		if (ref) ref.defaultValue = resetValue;
	});

	function updateMarker(next: string): void {
		if (next === resetValue) onReset();
		else marker = next;
	}

	function shadowFormReset(
		control: HTMLInputElement,
		reset: () => void
	): { destroy(): void; update(reset: () => void): void } {
		let active = true;
		let currentReset = reset;
		let disconnect: () => void = () => undefined;
		let listening = false;
		const connect = () => {
			if (!active || listening) return;
			const root = control.getRootNode();
			const ShadowRootConstructor = control.ownerDocument.defaultView?.ShadowRoot;
			if (!ShadowRootConstructor || !(root instanceof ShadowRootConstructor)) return;
			listening = true;
			disconnect = listenForFormReset(control, () => currentReset());
		};
		connect();
		queueMicrotask(connect);
		return {
			destroy() {
				active = false;
				disconnect();
			},
			update(nextReset) {
				currentReset = nextReset;
				connect();
			}
		};
	}
</script>

{#if resetOwner}
	<input
		bind:this={ref}
		aria-hidden="true"
		tabindex="-1"
		type="text"
		hidden
		disabled
		data-zui-form-reset-signal=""
		use:portal={{ target: resetOwner }}
		use:shadowFormReset={onReset}
		bind:value={() => marker, updateMarker}
	/>
{/if}
