<script module lang="ts">
	import type { FormValue, FormValueEntry } from './form-value.js';

	interface FormValueBridgeBaseProps {
		readonly disabled?: boolean;
		readonly form?: string;
		readonly onReset: () => void;
	}

	interface NamedFormValueBridgeProps extends FormValueBridgeBaseProps {
		readonly entries?: never;
		readonly name?: string | null;
		readonly value?: FormValue;
	}

	interface ExplicitFormValueBridgeProps extends FormValueBridgeBaseProps {
		readonly entries: readonly FormValueEntry[];
		readonly name?: never;
		readonly value?: never;
	}

	export type FormValueBridgeProps = ExplicitFormValueBridgeProps | NamedFormValueBridgeProps;
</script>

<script lang="ts">
	import { formReset } from './form-control.svelte.js';
	import { createExplicitFormEntries, createFormEntries } from './form-value.js';

	interface BridgeResetActionOptions {
		readonly association?: string;
		readonly reset: () => void;
	}

	let { disabled = false, entries, form, name, onReset, value }: FormValueBridgeProps = $props();
	const resolvedEntries = $derived.by(() => {
		if (entries !== undefined) return createExplicitFormEntries(entries);
		return name === null || name === undefined ? [] : createFormEntries(name, value);
	});

	function bridgeFormReset(
		control: HTMLInputElement,
		options: BridgeResetActionOptions
	): { destroy(): void; update(options: BridgeResetActionOptions): void } {
		let active = true;
		let current = options;
		let observer: MutationObserver | undefined;
		const action = formReset(control, () => current.reset());
		const refresh = () => {
			if (active) action.update(() => current.reset());
		};
		const observeOwner = () => {
			observer?.disconnect();
			observer = undefined;
			if (!current.association) return;
			const MutationObserverConstructor = control.ownerDocument.defaultView?.MutationObserver;
			if (!MutationObserverConstructor) return;
			observer = new MutationObserverConstructor(() => queueMicrotask(refresh));
			observer.observe(control.ownerDocument, {
				attributeFilter: ['id'],
				attributes: true,
				childList: true,
				subtree: true
			});
		};
		observeOwner();
		return {
			destroy() {
				active = false;
				observer?.disconnect();
				action.destroy();
			},
			update(next) {
				const associationChanged = current.association !== next.association;
				current = next;
				if (associationChanged) observeOwner();
				queueMicrotask(refresh);
			}
		};
	}
</script>

<!--
	The disabled, unnamed control is both the stable association anchor and the only reset signal.
	It can never contribute a FormData entry, including while the business value is absent.
-->
<input
	aria-hidden="true"
	tabindex={-1}
	type="hidden"
	hidden
	disabled
	{form}
	data-zui-form-value-bridge=""
	data-zui-form-reset-signal=""
	use:bridgeFormReset={{ association: form, reset: onReset }}
/>
{#each resolvedEntries as [entryName, entryValue], index (`${entryName}\u0000${index}`)}
	<input
		aria-hidden="true"
		tabindex={-1}
		type="hidden"
		{disabled}
		{form}
		name={entryName}
		value={entryValue}
		data-zui-form-value=""
	/>
{/each}
